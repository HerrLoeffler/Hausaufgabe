"""Fail closed before uploading a signed AAC lab to TestFlight."""
import datetime
import plistlib
import sys
from pathlib import Path

def validate(app, profile, info, team):
    if info.get('CFBundleIdentifier') != 'de.gradecrew.secure' or info.get('CFBundleDisplayName') != 'GradeCrew AAC Lab':
        raise ValueError('Expected isolated Secure AAC Lab, not another app')
    for label, entitlements in [('app', app), ('profile', profile.get('Entitlements', {}))]:
        if entitlements.get('com.apple.developer.automatic-assessment-configuration') is not True:
            raise ValueError(f'AAC missing in {label}')
        if entitlements.get('com.apple.developer.team-identifier') != team:
            raise ValueError(f'Wrong team in {label}')
        if entitlements.get('application-identifier', '').split('.', 1)[-1] != 'de.gradecrew.secure':
            raise ValueError(f'Wrong bundle in {label}')
        if entitlements.get('get-task-allow', False) is not False:
            raise ValueError(f'Debuggable {label} is not distribution signing')
    if app['application-identifier'] != profile['Entitlements']['application-identifier']:
        raise ValueError('Profile and signed app identifier mismatch')
    expiry = profile.get('ExpirationDate')
    if not isinstance(expiry, datetime.datetime) or expiry.replace(tzinfo=datetime.timezone.utc) <= datetime.datetime.now(datetime.timezone.utc):
        raise ValueError('Expired or missing profile expiry')
    if profile.get('ProvisionedDevices') or profile.get('ProvisionsAllDevices'):
        raise ValueError('Expected App Store distribution profile')

if __name__ == '__main__':
    values = [plistlib.loads(Path(path).read_bytes()) for path in sys.argv[1:4]]
    validate(*values, sys.argv[4])
    print('Signed AAC app and distribution profile verified for de.gradecrew.secure.')
