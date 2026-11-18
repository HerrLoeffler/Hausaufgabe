"""Google Cloud composition root for the GradeCrew sandbox."""
import json
import os
import re
from functools import lru_cache

from flask import Flask, Response
from google.api_core.exceptions import GoogleAPICallError
from google.cloud import firestore

from billing_sandbox_access import checkout_link
from billing_service import create_app, ORIGIN, PREFIX
from firestore_store import FirestoreGrants
from stripe_gateway import stripe_reader

PROJECT = 'gradecrew-staging-2026'


@lru_cache(maxsize=1)
def configured_app():
    if os.environ.get('BILLING_SANDBOX_PROJECT') != PROJECT:
        raise ValueError('Wrong cloud project')
    origin = os.environ.get('BILLING_SANDBOX_ORIGIN', ORIGIN)
    if not re.fullmatch(
        r'https://gradecrew-staging-2026--billing-plan-01-[a-z0-9]+\.web\.app', origin
    ):
        raise ValueError('Wrong preview origin')
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
    grants = FirestoreGrants(firestore.Client(project=PROJECT), config['run'])
    app.register_blueprint(create_app(
        fixtures, session_key, webhook_secret, grants, read, origin=origin,
    ))
    return app


def gradecrew_billing_sandbox(incoming):
    try:
        app = configured_app()
    except (ValueError, KeyError, GoogleAPICallError):
        return Response('Testanbindung noch nicht eingerichtet.', status=503,
                        headers={'Cache-Control': 'no-store'})
    with app.request_context(incoming.environ):
        return app.full_dispatch_request()
