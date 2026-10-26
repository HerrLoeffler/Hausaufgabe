"""Fail closed before uploading a signed AAC lab to TestFlight."""
import datetime
import plistlib
import sys
from pathlib import Path

def validate(app, profile, info, team, mode="aac-lab"):
    expected_bundle = 'de.gradecrew.secure.test2026' if mode == 'staging-exam' else 'de.gradecrew.secure'
    expected_name = 'Secure Test' if mode == 'staging-exam' else ('GradeCrew Secure' if mode == 'live-exam' else 'GradeCrew AAC Lab')
    if mode in ('staging-exam', 'live-exam') and info.get('GradeCrewSecureMode') != mode:
        raise ValueError('Expected Staging exam configuration')
    if info.get('CFBundleIdentifier') != expected_bundle or info.get('CFBundleDisplayName') != expected_name:
        raise ValueError('Expected isolated Secure AAC Lab, not another app')
    if mode in ('staging-exam', 'live-exam') and info.get('UIDeviceFamily') != [1, 2]:
        raise ValueError('Secure must support both iPhone and iPad')
    for label, entitlements in [('app', app), ('profile', profile.get('Entitlements', {}))]:
        if entitlements.get('com.apple.developer.automatic-assessment-configuration') is not True:
            raise ValueError(f'AAC missing in {label}')
        if entitlements.get('com.apple.developer.team-identifier') != team:
            raise ValueError(f'Wrong team in {label}')
        if entitlements.get('application-identifier', '').split('.', 1)[-1] != expected_bundle:
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
    permission = 'com.apple.developer.automatic-assessment-configuration'
    print('AAC present:', {'signed_app': values[0].get(permission) is True, 'profile': values[1].get('Entitlements', {}).get(permission) is True})
    validate(*values, sys.argv[4], sys.argv[5] if len(sys.argv) > 5 else "aac-lab")
    print('Signed AAC app and distribution profile verified for '+values[2]['CFBundleIdentifier'])
