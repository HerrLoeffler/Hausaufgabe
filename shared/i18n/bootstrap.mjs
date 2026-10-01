import { installBrowserI18n, registerCatalog } from "./browser-runtime.mjs";
import { deDEMessages } from "./messages-de-DE.mjs";

registerCatalog("de-DE", deDEMessages);

export const gradeCrewI18n = installBrowserI18n({
  defaultLocale: "de-DE",
});
