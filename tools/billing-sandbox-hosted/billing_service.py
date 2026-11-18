"""GradeCrew sandbox HTTP API, independent of hosting and database vendors.

The injected store reads grants by test account and atomically creates a grant
with read(kind) and grant(kind, invoice, event). Repeated grants for the same
invoice succeed, conflicting invoices raise ValueError, and unavailable storage
raises GrantStoreUnavailable. Storage adapters preserve invoice and event IDs.
"""
import hashlib
import hmac
import re
import time

from flask import Blueprint, jsonify, request, Response
import stripe

from billing_sandbox_access import ACCOUNT, reconcile

ORIGIN = 'https://gradecrew-staging-2026--billing-plan-01-o0aafic4.web.app'
PREFIX = '/billing-test/api'
SESSION = '__session'
SESSION_SECONDS = 1800


class GrantStoreUnavailable(RuntimeError):
    """The configured grant store cannot currently complete an operation."""


def create_app(fixtures, session_key, webhook_secret, store, read, *, origin=ORIGIN):
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
        if request.headers.get('Origin') != origin:
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
        if request.headers.get('Origin') != origin:
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
        except GrantStoreUnavailable:
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
        except (GrantStoreUnavailable, stripe.StripeError, ValueError):
            return '', 503
        return '', 204

    return app

