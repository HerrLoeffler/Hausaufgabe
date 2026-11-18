import hashlib
import hmac
import json
import os
from pathlib import Path
import subprocess
import sys
import time
import unittest
from unittest.mock import Mock

from flask import Flask

sys.path.insert(0, str(Path(__file__).parent / 'billing-sandbox-hosted'))
from main import create_app, ORIGIN, PREFIX
from billing_sandbox_access import TAG


class Store:
    def __init__(self):
        self.data = {}

    def read(self, kind):
        return self.data.get(kind)

    def grant(self, kind, invoice, event):
        self.data.setdefault(kind, (invoice, event))


class HostedAccessTests(unittest.TestCase):
    def setUp(self):
        self.store = Store()
        self.secret = 'whsec_fake_for_tests_only'
        self.password = 'a' * 43
        self.password2 = 'b' * 43
        self.fixtures = {
            'premium': {'id':'cs_test_premium', 'customer':'cus_premium', 'url':'https://checkout.stripe.com/c/pay/test',
                        'password_sha256': hashlib.sha256(self.password.encode()).hexdigest()},
            'school': {'id':'in_school', 'customer':'cus_school', 'url':'https://invoice.stripe.com/i/test',
                       'password_sha256': hashlib.sha256(self.password2.encode()).hexdigest()},
        }
        self.invoice = {'id': 'in_school', 'object': 'invoice', 'customer': 'cus_school',
            'livemode': False, 'billing_reason': 'manual', 'currency': 'eur',
            'status': 'open', 'amount_due': 3000, 'amount_paid': 1000, 'amount_remaining': 2000}
        self.app = Flask(__name__)
        self.session = {}
        self.app.register_blueprint(create_app(self.fixtures, b'a'*32, self.secret, self.store, self.read))
        self.client = self.app.test_client()
        self.base = ORIGIN + PREFIX

    def login(self, user, password, origin=ORIGIN):
        return self.client.post(self.base+'/login', json={'account':user,'password':password},
                                headers={'Origin':origin})

    def read(self, operation, object_id, expand=False):
        return self.session if operation == 'GetCheckoutSessionsSession' else self.invoice

    def event(self, customer='cus_school', live=False, signed=True,
              invoice='in_school', reason='manual'):
        event = {'id': 'evt_test', 'object': 'event', 'type': 'invoice.paid', 'livemode': live,
                 'data': {'object': {'id': invoice, 'customer': customer, 'billing_reason': reason}}}
        body = json.dumps(event).encode()
        stamp = str(int(time.time()))
        digest = hmac.new(self.secret.encode(), stamp.encode()+b'.'+body, hashlib.sha256).hexdigest()
        return self.client.post(self.base+'/webhook', data=body, headers={
            'Stripe-Signature': f't={stamp},v1={digest if signed else "invalid"}'})

    def test_only_authenticated_fixture_can_read_its_access(self):
        self.assertEqual(self.client.get(self.base+'/access').status_code, 401)
        self.assertEqual(self.login('school', self.password).status_code, 401)
        self.assertEqual(self.login('school', self.password2, 'https://gradecrew.de').status_code, 403)
        response = self.login('school', self.password2)
        self.assertEqual(response.status_code, 204)
        self.assertIn('HttpOnly', response.headers['Set-Cookie'])
        self.assertIn('Secure', response.headers['Set-Cookie'])
        data = self.client.get(self.base+'/access').json
        self.assertEqual(data['kind'], 'school')
        self.assertEqual(data['state'], 'pending')
        self.assertNotIn('premium', json.dumps(data))

    def test_rejects_unsigned_and_live_events(self):
        self.assertEqual(self.event(signed=False).status_code, 400)
        self.assertEqual(self.event(live=True).status_code, 400)
        self.assertEqual(self.store.data, {})

    def test_partial_payment_stays_locked_and_full_payment_activates_one_account(self):
        self.assertEqual(self.event().status_code, 503)
        self.assertEqual(self.store.data, {})
        self.invoice.update(status='paid', amount_paid=3000, amount_remaining=0,
            status_transitions={'paid_at': 100}, payments={'data': [
                {'status':'paid','amount_paid':3000,'payment':{'type':'payment_intent',
                 'payment_intent':{'livemode':False,'customer':'cus_school','currency':'eur',
                 'status':'succeeded','amount_received':3000,'payment_method_types':['customer_balance']}}}
            ]})
        self.assertEqual(self.event().status_code, 204)
        self.assertEqual(self.event().status_code, 204)
        self.assertEqual(len(self.store.data), 1)
        self.assertEqual(self.login('school', self.password2).status_code, 204)
        self.assertEqual(self.client.get(self.base+'/access').json['state'], 'active')
        self.assertEqual(self.login('premium', self.password).status_code, 204)
        self.assertEqual(self.client.get(self.base+'/access').json['state'], 'pending')

    def test_premium_webhook_waits_for_its_completed_checkout_and_matching_invoice(self):
        self.invoice.update(
            id='in_premium', customer='cus_premium', status='paid', billing_reason='subscription_create',
            amount_due=100, amount_paid=100, amount_remaining=0,
            parent={'subscription_details': {'subscription': 'sub_premium'}},
            status_transitions={'paid_at': 100}, payments={'data': [
                {'status':'paid','amount_paid':100,'payment':{'type':'payment_intent',
                 'payment_intent':{'livemode':False,'customer':'cus_premium','currency':'eur',
                 'status':'succeeded','amount_received':100,'payment_method_types':['paypal']}}}
            ]})
        self.session.update(
            id='cs_test_premium', object='checkout.session', mode='subscription', livemode=False,
            customer='cus_premium', client_reference_id=TAG, status='open', payment_status='unpaid',
            currency='eur', amount_total=100, invoice='in_premium', subscription='sub_premium')
        self.assertEqual(self.event('cus_premium', invoice='in_premium', reason='subscription_create').status_code, 503)
        self.session.update(status='complete', payment_status='paid')
        self.assertEqual(self.event('cus_premium', invoice='in_other', reason='subscription_create').status_code, 503)
        self.assertEqual(self.store.data, {})
        self.assertEqual(self.event('cus_premium', invoice='in_premium', reason='subscription_create').status_code, 204)
        self.assertEqual(self.store.data, {'premium': ('in_premium', 'evt_test')})

    def test_web_layer_loads_without_any_google_modules(self):
        source = """
import importlib.abc
import sys
class BlockGoogle(importlib.abc.MetaPathFinder):
    def find_spec(self, fullname, path, target=None):
        if fullname == 'google' or fullname.startswith('google.'):
            raise ImportError('Google must not be required by the web layer')
sys.meta_path.insert(0, BlockGoogle())
from billing_service import create_app
assert callable(create_app)
assert not any(n == 'google' or n.startswith('google.') for n in sys.modules)
"""
        result = subprocess.run(
            [sys.executable, '-B', '-c', source], capture_output=True, text=True,
            env={**os.environ, 'PYTHONPATH': os.pathsep.join(sys.path)}, timeout=15,
        )
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_same_web_api_supports_a_different_test_host_and_store_failure(self):
        from billing_service import GrantStoreUnavailable
        origin = 'https://billing.sandbox.example.org'
        app = Flask('portable_test')
        app.register_blueprint(create_app(
            self.fixtures, b'a'*32, self.secret, self.store, self.read, origin=origin,
        ))
        client = app.test_client()
        self.assertEqual(client.post(origin+PREFIX+'/login', json={
            'account':'school', 'password':self.password2,
        }, headers={'Origin':ORIGIN}).status_code, 403)
        self.assertEqual(client.post(origin+PREFIX+'/login', json={
            'account':'school', 'password':self.password2,
        }, headers={'Origin':origin}).status_code, 204)
        self.assertEqual(client.get(origin+PREFIX+'/access').json['state'], 'pending')
        self.store.data['school'] = ('in_school', 'evt_paid')
        self.assertEqual(client.get(origin+PREFIX+'/access').json['state'], 'active')
        def unavailable(kind):
            raise GrantStoreUnavailable('Store temporarily unreachable')
        self.store.read = unavailable
        self.assertEqual(client.get(origin+PREFIX+'/access').status_code, 503)

    def test_firestore_adapter_preserves_duplicate_grants_and_reports_outages(self):
        from google.api_core.exceptions import AlreadyExists, ServiceUnavailable
        from billing_service import GrantStoreUnavailable
        from firestore_store import FirestoreGrants
        store = FirestoreGrants(Mock(), 'a'*32)
        document = store.documents.document.return_value
        document.create.side_effect = AlreadyExists('Duplicate')
        document.get.return_value.to_dict.return_value = {'invoice':'in_school'}
        store.grant('school', 'in_school', 'evt_retry')
        with self.assertRaises(ValueError):
            store.grant('school', 'in_different', 'evt_other')
        document.get.side_effect = ServiceUnavailable('Offline')
        with self.assertRaises(GrantStoreUnavailable):
            store.read('school')
        with self.assertRaises(GrantStoreUnavailable):
            store.grant('school', 'in_school', 'evt_retry')
        document.create.side_effect = ServiceUnavailable('Offline')
        with self.assertRaises(GrantStoreUnavailable):
            store.grant('school', 'in_school', 'evt_retry')


if __name__ == '__main__':
    unittest.main()
