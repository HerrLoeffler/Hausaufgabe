"""Explicit release target; preserves Live on existing automatic pushes."""
import os

def select(event, requested, ref=""):
    if event == 'push' and ref == 'refs/heads/feature/native-live-staging-20261018':
        target='live'
    elif event == 'push' and ref == 'refs/heads/feature/classroom-secure-access-20261022':
        target='live'
    elif event == 'workflow_dispatch' and requested in ('live','staging2026'):
        target=requested
    else:
        raise ValueError('Explicit supported Secure release target required')
    if target=='staging2026':
        return {'SECURE_SCHEME':'GradeCrew Secure Staging','SECURE_CONFIGURATION':'SecureStaging','SECURE_VERIFY_MODE':'staging-exam','SECURE_PROJECT':'gradecrew-staging-2026'}
    return {'SECURE_SCHEME':'GradeCrew Secure','SECURE_CONFIGURATION':'SecureLive','SECURE_VERIFY_MODE':'live-exam','SECURE_PROJECT':'hausaufgabe-staging'}

if __name__=='__main__':
    values=select(os.environ['SECURE_RELEASE_EVENT'],os.environ.get('SECURE_RELEASE_TARGET',''),os.environ.get('SECURE_RELEASE_REF',''))
    with open(os.environ['GITHUB_ENV'],'a') as output:
        for key,value in values.items():output.write(key+'='+value+'\n')
    print('Secure release project: '+values['SECURE_PROJECT'])
