import { installBrowserI18n, registerCatalog, registerSourcePatterns } from "./browser-runtime.mjs";
import { deDEMessages } from "./messages-de-DE.mjs";
import { enGBMessages, enGBSourcePatterns } from "./messages-en-GB.mjs";

registerCatalog("de-DE", deDEMessages);
registerCatalog("en-GB", enGBMessages);
registerSourcePatterns("en-GB", enGBSourcePatterns);

export const gradeCrewI18n = installBrowserI18n({
  defaultLocale: "de-DE",
});
