"""Local GradeCrew payment acceptance run using a scoped Stripe sandbox reader."""
import argparse
import hashlib
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import mimetypes
from pathlib import Path
import subprocess
import sys
from threading import Lock, Thread
import time
from urllib.parse import urlsplit

from billing_sandbox_preview import CSP

ACCOUNT = 'acct_1UYUaw1l0zkqOtXr'
TAG = 'GC-BILLING-PLAN-01-grant-20261110'
HOST = '127.0.0.1'
PORT = 8847
TYPES = {'premium': (100, 'subscription_create', 'paypal'),
         'school': (3000, 'manual', 'customer_balance')}


def access_from_invoice(invoice, invoice_id, customer_id, kind):
    cents, reason, method = TYPES[kind]
    if not (
        invoice.get('object') == 'invoice'
        and invoice.get('id') == invoice_id
        and invoice.get('livemode') is False
        and invoice.get('customer') == customer_id
        and invoice.get('currency') == 'eur'
        and invoice.get('billing_reason') == reason
        and invoice.get('status') == 'paid'
        and invoice.get('amount_due') == cents
        and invoice.get('amount_paid') == cents
        and invoice.get('amount_remaining') == 0
        and invoice.get('status_transitions', {}).get('paid_at')
    ):
        return False
    payments = invoice.get('payments', {}).get('data', [])
    for entry in payments:
        payment = entry.get('payment', {})
        intent = payment.get('payment_intent')
        if (
            entry.get('status') == 'paid'
            and entry.get('amount_paid') == cents
            and payment.get('type') == 'payment_intent'
            and isinstance(intent, dict)
            and intent.get('livemode') is False
            and intent.get('customer') == customer_id
            and intent.get('currency') == 'eur'
            and intent.get('payment_method_types') == [method]
            and intent.get('status') == 'succeeded'
            and intent.get('amount_received') == cents
        ):
            return True
    return False


def reconcile(read, fixtures, kind):
    fixture = fixtures[kind]
    customer = fixture['customer']
    if kind == 'school':
        invoice = read('GetInvoicesInvoice', fixture['id'], expand=True)
        return access_from_invoice(invoice, fixture['id'], customer, kind)

    session = read('GetCheckoutSessionsSession', fixture['id'])
    invoice_id, subscription = session.get('invoice'), session.get('subscription')
    if not (
        session.get('id') == fixture['id']
        and session.get('object') == 'checkout.session'
        and session.get('mode') == 'subscription'
        and session.get('livemode') is False
        and session.get('customer') == customer
        and session.get('client_reference_id') == TAG
        and session.get('status') == 'complete'
        and session.get('payment_status') == 'paid'
        and session.get('currency') == 'eur'
        and session.get('amount_total') == 100
        and isinstance(invoice_id, str) and invoice_id.startswith('in_')
        and isinstance(subscription, str) and subscription.startswith('sub_')
    ):
        return False
    invoice = read('GetInvoicesInvoice', invoice_id, expand=True)
    details = (invoice.get('parent') or {}).get('subscription_details') or {}
    return (details.get('subscription') == subscription
            and access_from_invoice(invoice, invoice_id, customer, kind))


def read_stripe(helper, operation, object_id, expand=False):
    parameters = {'id': object_id}
    if expand:
        parameters['expand'] = ['payments.data.payment.payment_intent']
    result = subprocess.run(
        [sys.executable, '-B', str(helper), 'call', 'stripe_api_read'],
        input=json.dumps({'stripe_api_operation_id': operation, 'parameters': parameters,
                          'stripe_context': ACCOUNT, 'livemode': False}),
        capture_output=True, text=True, timeout=40, check=True,
    )
    response = json.loads(result.stdout)
    data = response.get('structuredContent')
    if response.get('isError') or not isinstance(data, dict) or data.get('livemode') is not False:
        raise ValueError('No verified Stripe sandbox response')
    return data


def checkout_link(url, hostname):
    parsed = urlsplit(url)
    if parsed.scheme != 'https' or parsed.netloc != hostname or not parsed.path:
        raise ValueError('Unexpected Stripe page')
    return url


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--preview', required=True, type=Path)
    parser.add_argument('--fixtures', required=True, type=Path)
    parser.add_argument('--stripe-reader', required=True, type=Path)
    args = parser.parse_args()
    fixtures = json.loads(args.fixtures.read_text())
    for kind, prefix, host in (('premium', 'cs_test_', 'checkout.stripe.com'),
                               ('school', 'in_', 'invoice.stripe.com')):
        fixture = fixtures[kind]
        if not fixture['id'].startswith(prefix) or not fixture['customer'].startswith('cus_'):
            raise ValueError('Unexpected test fixture')
        checkout_link(fixture['url'], host)
    if fixtures['premium']['customer'] == fixtures['school']['customer']:
        raise ValueError('Use different synthetic customers')

    source = Path(__file__).parent
    receipt = source.parent / 'docs/billing/sandbox-v1/preview-deploy-2026-11-08.json'
    hashes = json.loads(receipt.read_text())['files']
    assets = {}
    for path, digest in hashes.items():
        if path == '/release.json':
            continue
        name = path.lstrip('/')
        data = (args.preview / name).read_bytes()
        if hashlib.sha256(data).hexdigest() != digest:
            raise ValueError('Preview asset does not match the verified baseline: ' + name)
        assets[path] = (data, mimetypes.guess_type(name)[0] or 'application/octet-stream')
    for path in ('/index.html', '/workspace.html'):
        html = assets[path][0].decode().replace(
            '</body>', '<script type="module" src="/billing-access.mjs"></script></body>')
        assets[path] = (html.encode(), 'text/html; charset=utf-8')
    assets['/'] = assets['/index.html']
    assets['/billing-access.mjs'] = (
        (source / 'billing-sandbox-preview/billing-access.mjs').read_bytes(), 'text/javascript')

    states = {kind: 'checking' for kind in TYPES}
    lock = Lock()

    def check(kind):
        def read(operation, object_id, expand=False):
            return read_stripe(args.stripe_reader, operation, object_id, expand)
        while True:
            try:
                state = 'active' if reconcile(read, fixtures, kind) else 'pending'
            except (ValueError, OSError, subprocess.SubprocessError):
                state = 'checking'
            with lock:
                if states[kind] != state:
                    print(f'{kind}: {states[kind]} -> {state}', flush=True)
                    states[kind] = state
            if state == 'active':
                return  # This acceptance run covers initial activation only.
            time.sleep(6)

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *_args):
            pass

        def send_data(self, status, data, mime='text/plain; charset=utf-8'):
            self.send_response(status)
            self.send_header('Content-Type', mime)
            self.send_header('Content-Length', str(len(data)))
            self.send_header('Content-Security-Policy', CSP.replace("connect-src 'none'", "connect-src 'self'"))
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.send_header('Referrer-Policy', 'no-referrer')
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            self.wfile.write(data)

        def do_GET(self):
            if self.headers.get('Host') != f'{HOST}:{PORT}':
                self.send_data(421, b'Unexpected host')
                return
            path = urlsplit(self.path).path
            if path == '/api/access':
                if self.headers.get('Sec-Fetch-Site') not in (None, 'same-origin', 'none'):
                    self.send_data(403, b'Forbidden')
                    return
                with lock:
                    response = {kind: {'state': state, 'url': fixtures[kind]['url']}
                                for kind, state in states.items()}
                self.send_data(200, json.dumps(response).encode(), 'application/json')
                return
            if path in assets:
                self.send_data(200, *assets[path])
                return
            self.send_data(404, b'Not found')

    with ThreadingHTTPServer((HOST, PORT), Handler) as server:
        for kind in TYPES:
            Thread(target=check, args=(kind,), daemon=True).start()
        print(f'GradeCrew Stripe-Testlauf auf http://{HOST}:{PORT}/', flush=True)
        server.serve_forever()


if __name__ == '__main__':
    main()
