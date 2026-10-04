import { installBrowserI18n, registerCatalog, registerSourcePatterns } from "./browser-runtime.mjs?v=2";
import { deDEMessages } from "./messages-de-DE.mjs?v=2";
import { enGBMessages, enGBSourcePatterns } from "./messages-en-GB.mjs?v=2";
import { enGBCrewMessages, enGBCrewSourcePatterns } from "./extensions-en-GB-crew.mjs?v=2";

registerCatalog("de-DE", deDEMessages);
registerCatalog("en-GB", enGBMessages);
registerCatalog("en-GB", enGBCrewMessages);
registerSourcePatterns("en-GB", enGBSourcePatterns);
registerSourcePatterns("en-GB", enGBCrewSourcePatterns);

export const gradeCrewI18n = installBrowserI18n({
  defaultLocale: "de-DE",
});
