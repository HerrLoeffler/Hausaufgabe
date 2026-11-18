"""Read-only Stripe adapter restricted to the named GradeCrew sandbox."""
from functools import lru_cache
import re

import stripe

from billing_sandbox_access import ACCOUNT


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

