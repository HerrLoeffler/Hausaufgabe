from copy import deepcopy
import unittest

from billing_sandbox_access import access_from_invoice, reconcile


CUSTOMER = 'cus_sandbox'
TAG = 'GC-BILLING-PLAN-01-grant-20261110'


def invoice(method, cents, reason):
    return {
        'object': 'invoice', 'id': 'in_fixture', 'livemode': False,
        'customer': CUSTOMER, 'currency': 'eur', 'billing_reason': reason,
        'status': 'paid', 'amount_due': cents, 'amount_paid': cents,
        'amount_remaining': 0, 'status_transitions': {'paid_at': 100},
        'payments': {'data': [{'status': 'paid', 'amount_paid': cents,
            'payment': {'type': 'payment_intent', 'payment_intent': {
                'livemode': False, 'status': 'succeeded', 'customer': CUSTOMER,
                'currency': 'eur', 'payment_method_types': [method],
                'amount_received': cents,
            }}}]},
    }


class AccessTests(unittest.TestCase):
    def test_school_is_locked_until_invoice_is_fully_paid(self):
        school = invoice('customer_balance', 3000, 'manual')
        partial = {**school, 'status': 'open', 'amount_paid': 1000,
                   'amount_remaining': 2000, 'status_transitions': {'paid_at': None}}
        self.assertFalse(access_from_invoice(partial, 'in_fixture', CUSTOMER, 'school'))
        self.assertTrue(access_from_invoice(school, 'in_fixture', CUSTOMER, 'school'))

    def test_paid_status_alone_is_insufficient(self):
        school = invoice('customer_balance', 3000, 'manual')
        for mutation in ({'amount_paid': 0}, {'amount_remaining': 10},
                         {'payments': {'data': []}}, {'livemode': True},
                         {'customer': 'cus_other'}, {'id': 'in_other'}):
            self.assertFalse(access_from_invoice({**school, **mutation}, 'in_fixture', CUSTOMER, 'school'))
        wrong_method = invoice('card', 3000, 'manual')
        self.assertFalse(access_from_invoice(wrong_method, 'in_fixture', CUSTOMER, 'school'))

    def test_premium_is_linked_to_checkout_customer_and_subscription(self):
        first = invoice('paypal', 100, 'subscription_create')
        first['parent'] = {'subscription_details': {'subscription': 'sub_fixture'}}
        cfg = {'premium': {'id': 'cs_test_fixture', 'customer': CUSTOMER},
               'school': {'id': 'in_school', 'customer': 'cus_school'}}
        session = {
            'id': 'cs_test_fixture', 'object': 'checkout.session', 'mode': 'subscription',
            'livemode': False, 'customer': CUSTOMER, 'client_reference_id': TAG,
            'status': 'complete', 'payment_status': 'paid', 'currency': 'eur',
            'amount_total': 100, 'invoice': 'in_fixture', 'subscription': 'sub_fixture',
        }

        def read(operation, object_id, expand=False):
            return session if operation == 'GetCheckoutSessionsSession' else first

        self.assertTrue(reconcile(read, cfg, 'premium'))
        for field, value in (('client_reference_id', 'wrong'), ('customer', 'cus_other'),
                             ('status', 'open'), ('payment_status', 'unpaid'),
                             ('livemode', True), ('subscription', 'sub_other')):
            old = session[field]
            session[field] = value
            self.assertFalse(reconcile(read, cfg, 'premium'))
            session[field] = old

    def test_does_not_treat_a_paid_invoice_without_a_real_payment_as_access(self):
        school = invoice('customer_balance', 3000, 'manual')
        for field, value in (('status', 'requires_payment_method'), ('amount_received', 1000),
                             ('customer', 'cus_other'), ('livemode', True)):
            modified = deepcopy(school)
            modified['payments']['data'][0]['payment']['payment_intent'][field] = value
            self.assertFalse(access_from_invoice(modified, 'in_fixture', CUSTOMER, 'school'))


if __name__ == '__main__':
    unittest.main()
