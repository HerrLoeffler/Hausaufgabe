"""Firestore adapter for sandbox grants. Client access stays server-only."""
from google.api_core.exceptions import AlreadyExists, GoogleAPICallError
from google.cloud import firestore

from billing_service import GrantStoreUnavailable


class FirestoreGrants:
    def __init__(self, client, run):
        self.documents = client.collection('billingSandboxes').document('v1').collection(
            'runs').document(run).collection('grants')

    def read(self, kind):
        try:
            return self.documents.document(kind).get().to_dict()
        except GoogleAPICallError as error:
            raise GrantStoreUnavailable('Grant read unavailable') from error

    def grant(self, kind, invoice, event):
        try:
            self.documents.document(kind).create({
                'invoice': invoice, 'event': event, 'activatedAt': firestore.SERVER_TIMESTAMP,
            })
        except AlreadyExists:
            if (self.read(kind) or {}).get('invoice') != invoice:
                raise ValueError('Grant already belongs to another invoice')
        except GoogleAPICallError as error:
            raise GrantStoreUnavailable('Grant write unavailable') from error

