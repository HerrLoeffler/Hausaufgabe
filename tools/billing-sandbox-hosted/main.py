"""Sandbox-only GradeCrew login, access status, and verified Stripe webhook."""
import hashlib
import hmac
import json
import os
import re
import time
from functools import lru_cache

from flask import Blueprint, Flask, jsonify, request, Response
from google.api_core.exceptions import AlreadyExists, GoogleAPICallError
from google.cloud import firestore
import stripe

from billing_sandbox_access import ACCOUNT, checkout_link, reconcile

PROJECT = 'gradecrew-staging-2026'
ORIGIN = 'https://gradecrew-staging-2026--billing-plan-01-o0aafic4.web.app'
PREFIX = '/billing-test/api'
SESSION = '__session'
SESSION_SECONDS = 1800


def create_app(fixtures, session_key, webhook_secret, store, read):
    app = Blueprint('billing_sandbox', __name__, url_prefix=PREFIX)

    def signature(value):
        return hmac.new(session_key, value.encode(), hashlib.sha256).hexdigest()

    def signed_in():
        value = request.cookies.get(SESSION, '')
        kind, separator, signed = value.partition('.')
        expires, point, mac = signed.partition('.')
        if (separator and point and kind in fixtures and expires.isascii()
                and expires.isdigit() and len(expires) <= 12
                and re.fullmatch(r'[a-f0-9]{64}', mac)
                and time.time() < int(expires)
                and hmac.compare_digest(signature(f'{kind}.{expires}'), mac)):
            return kind
        return None

    @app.after_request
    def private_response(response):
        response.headers['Cache-Control'] = 'private, no-store'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        return response

    @app.post('/login')
    def login():
        if request.headers.get('Origin') != ORIGIN:
            return '', 403
        form = request.get_json(silent=True)
        if not isinstance(form, dict):
            return '', 400
        kind, password = form.get('account'), form.get('password')
        if not isinstance(kind, str) or not isinstance(password, str) or len(password) != 43:
            return '', 401
        fixture = fixtures.get(kind)
        digest = hashlib.sha256(password.encode()).hexdigest()
        if not fixture or not hmac.compare_digest(fixture['password_sha256'], digest):
            return '', 401
        payload = f'{kind}.{int(time.time()) + SESSION_SECONDS}'
        response = Response(status=204)
        response.set_cookie(SESSION, f'{payload}.{signature(payload)}', max_age=SESSION_SECONDS,
                            secure=True, httponly=True, samesite='Lax', path='/billing-test')
        return response

    @app.post('/logout')
    def logout():
        if request.headers.get('Origin') != ORIGIN:
            return '', 403
        response = Response(status=204)
        response.delete_cookie(SESSION, secure=True, httponly=True,
                               samesite='Lax', path='/billing-test')
        return response

    @app.get('/access')
    def access():
        kind = signed_in()
        if not kind:
            return '', 401
        try:
            grant = store.read(kind)
        except GoogleAPICallError:
            return '', 503
        return jsonify(kind=kind, state='active' if grant else 'pending',
                       url=fixtures[kind]['url'] if kind == 'school' or not grant else None)

    @app.post('/webhook')
    def webhook():
        if not request.headers.get('Stripe-Signature'):
            return '', 400
        try:
            event = stripe.Webhook.construct_event(
                request.get_data(cache=False), request.headers['Stripe-Signature'], webhook_secret
            ).to_dict()
        except (ValueError, stripe.SignatureVerificationError):
            return '', 400
        if event.get('livemode') is not False or event.get('account') not in (None, ACCOUNT):
            return '', 400
        if event.get('type') != 'invoice.paid':
            return '', 204
        invoice = (event.get('data') or {}).get('object')
        if not isinstance(invoice, dict) or not invoice.get('id') or not event.get('id'):
            return '', 400
        kind = next((name for name, item in fixtures.items()
                     if item['customer'] == invoice.get('customer')), None)
        if not kind or (kind == 'school' and invoice.get('id') != fixtures[kind]['id']):
            return '', 204
        if kind == 'premium' and invoice.get('billing_reason') != 'subscription_create':
            return '', 204

        def read_for_invoice(operation, object_id, expand=False):
            item = read(operation, object_id, expand)
            if operation == 'GetCheckoutSessionsSession' and item.get('invoice') != invoice.get('id'):
                return {}
            return item

        try:
            if not reconcile(read_for_invoice, fixtures, kind):
                # Stripe can deliver before the Checkout Session becomes complete.
                return '', 503
            store.grant(kind, invoice['id'], event['id'])
        except (GoogleAPICallError, stripe.StripeError, ValueError):
            return '', 503
        return '', 204

    return app


class FirestoreGrants:
    def __init__(self, client, run):
        self.documents = client.collection('billingSandboxes').document('v1').collection(
            'runs').document(run).collection('grants')

    def read(self, kind):
        return self.documents.document(kind).get().to_dict()

    def grant(self, kind, invoice, event):
        try:
            self.documents.document(kind).create({
                'invoice': invoice, 'event': event, 'activatedAt': firestore.SERVER_TIMESTAMP,
            })
        except AlreadyExists:
            if (self.read(kind) or {}).get('invoice') != invoice:
                raise ValueError('Grant already belongs to another invoice')


def stripe_reader(api_key):
    if not re.fullmatch(r'(sk|rk)_test_[A-Za-z0-9]+', api_key):
        raise ValueError('Test API key required')
    client = stripe.StripeClient(api_key, max_network_retries=1)

    @lru_cache(maxsize=1)
    def verify_account():
        if client.v1.accounts.retrieve_current().id != ACCOUNT:
            raise ValueError('Wrong Stripe sandbox')

    def read(operation, object_id, expand=False):
        verify_account()
        if operation == 'GetCheckoutSessionsSession':
            return client.v1.checkout.sessions.retrieve(object_id).to_dict()
        if operation == 'GetInvoicesInvoice':
            params = {'expand': ['payments.data.payment.payment_intent']} if expand else {}
            return client.v1.invoices.retrieve(object_id, params).to_dict()
        raise ValueError('Unexpected Stripe request')
    return read


@lru_cache(maxsize=1)
def configured_app():
    if os.environ.get('BILLING_SANDBOX_PROJECT') != PROJECT:
        raise ValueError('Wrong cloud project')
    config = json.loads(os.environ['GRADECREW_BILLING_SANDBOX_TEST_ACCOUNTS'])
    session_key = bytes.fromhex(config['session_key'])
    if len(session_key) != 32 or not re.fullmatch('[a-f0-9]{32}', config['run']):
        raise ValueError('Invalid test session configuration')
    fixtures = config['fixtures']
    if set(fixtures) != {'premium', 'school'}:
        raise ValueError('Expected two test accounts')
    for kind, prefix, host in (('premium', 'cs_test_', 'checkout.stripe.com'),
                               ('school', 'in_', 'invoice.stripe.com')):
        fixture = fixtures[kind]
        if (not re.fullmatch(prefix + '[A-Za-z0-9]+', fixture['id'])
                or not re.fullmatch(r'cus_[A-Za-z0-9]+', fixture['customer'])
                or not re.fullmatch(r'[a-f0-9]{64}', fixture['password_sha256'])):
            raise ValueError('Invalid test account')
        checkout_link(fixture['url'], host)
    if fixtures['premium']['customer'] == fixtures['school']['customer']:
        raise ValueError('Expected distinct Stripe customers')
    webhook_secret = os.environ['GRADECREW_BILLING_SANDBOX_STRIPE_WEBHOOK_SECRET']
    if not webhook_secret.startswith('whsec_'):
        raise ValueError('Webhook signing secret required')
    read = stripe_reader(os.environ['GRADECREW_BILLING_SANDBOX_STRIPE_API_KEY'])
    app = Flask(__name__)
    app.config['MAX_CONTENT_LENGTH'] = 256 * 1024
    app.register_blueprint(create_app(fixtures, session_key, webhook_secret,
                                      FirestoreGrants(firestore.Client(project=PROJECT), config['run']), read))
    return app


def gradecrew_billing_sandbox(incoming):
    try:
        app = configured_app()
    except (ValueError, KeyError, GoogleAPICallError):
        return Response('Testanbindung noch nicht eingerichtet.', status=503,
                        headers={'Cache-Control': 'no-store'})
    with app.request_context(incoming.environ):
        return app.full_dispatch_request()
