import {pinPublicEntryFrame} from "../shared/public-entry-shell.mjs";
import {legacyDestination} from './routing.mjs';
const target = legacyDestination(location.href);
if (target) location.replace(target);

if(!target)pinPublicEntryFrame(document,document.querySelector("[data-gc-public-page]"));
