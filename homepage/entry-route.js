import {legacyDestination} from './routing.mjs';
const target = legacyDestination(location.href);
if (target) location.replace(target);
