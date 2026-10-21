const environments=Object.freeze({
 production:Object.freeze({name:'production',projectId:'hausaufgabe-staging',origin:'https://hausaufgabe-staging.web.app',configFile:'firebase-config.production.js',firestoreLocation:'eur3',functionsRegion:'europe-west1'}),
 staging:Object.freeze({name:'staging',projectId:'gradecrew-staging-2026',origin:'https://gradecrew-staging-2026.web.app',configFile:'firebase-config.staging.js',firestoreLocation:'eur3',functionsRegion:'europe-west1'})
});
export function getEnvironment(name){
 if(!Object.hasOwn(environments,name))throw new Error('Explizit production oder staging angeben; kein Legacy- oder Preview-Fallback.');
 return environments[name];
}
export function assertDeploymentTarget(name,projectId){
 const env=getEnvironment(name);
 if(env.projectId!==projectId)throw new Error(`Falsches Deploy-Ziel für ${name}: erwartet ${env.projectId}.`);
 return env;
}
