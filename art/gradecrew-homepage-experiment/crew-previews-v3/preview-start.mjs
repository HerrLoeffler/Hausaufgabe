import {gradeCrewI18n} from "./baseline/shared/i18n/bootstrap.mjs?v=3";
import {GRADECREW_ASSETS} from "./baseline/generated/gradecrew-assets.js?v=1.2.0";
import {watchStickyHeight} from "./baseline/interface.js?v=2.3.1-gc2";
import {translateTree} from "./baseline/shared/i18n/browser-runtime.mjs?v=3";
function installGradeCrewDesignStyles() {
  const styles = [
    ["./generated/gradecrew-design-tokens.css?v=1.1.0", "tokens-1.1.0"],
    ["./gradecrew-dashboard-foundation.css?v=1", "dashboard-foundation-v1"],
    ["./gradecrew-logo.css?v=1", "brand-logo-v1"],
    ["./gradecrew-auth-startscreen.css?v=4", "auth-startscreen-v4"],
    ["./gradecrew-auth-startscreen-polish.css?v=2", "auth-startscreen-polish-v2"],
    ["./gradecrew-hero-scene.css?v=3", "hero-scene-v3"],
    ["./gradecrew-workspace-upgrade.css?v=1", "workspace-upgrade-v1"]
  ];
  for (const [href, version] of styles) {
    if (document.querySelector(`link[data-gradecrew-design="${version}"]`)) continue;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.gradecrewDesign = version;
    document.head.appendChild(link);
  }
}


function installGradeCrewBrandAssets() {
  const primary = GRADECREW_ASSETS.brand?.primary;
  const favicon = GRADECREW_ASSETS.brand?.favicon || primary;
  if (!primary) return;

  document.querySelectorAll(".brandMark, [data-gradecrew-brand-mark]").forEach((host) => {
    if (host instanceof HTMLImageElement) {
      host.src = primary;
      host.dataset.gradecrewBrandMark = "1";
      return;
    }

    let image = host.querySelector("img[data-gradecrew-brand-mark]");
    if (!image) {
      image = document.createElement("img");
      image.alt = "";
      image.width = 44;
      image.height = 44;
      image.dataset.gradecrewBrandMark = "1";
      host.appendChild(image);
    }
    image.src = primary;
    host.dataset.gradecrewBrandReady = "1";
  });

  if (favicon) {
    let link = document.querySelector('link[data-gradecrew-favicon="1"], link[rel~="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/svg+xml";
      document.head.appendChild(link);
    }
    link.dataset.gradecrewFavicon = "1";
    link.type = "image/svg+xml";
    link.href = favicon;
  }
}


installGradeCrewDesignStyles();
if(document.body.dataset.experiment==="v3"){const css=document.createElement("link");css.rel="stylesheet";css.href="../v3.css";document.head.appendChild(css);}
await Promise.all([...document.querySelectorAll("link[rel=stylesheet]")].map(link=>link.sheet?Promise.resolve():new Promise(resolve=>{link.addEventListener("load",resolve,{once:true});link.addEventListener("error",resolve,{once:true});})));
installGradeCrewBrandAssets();
const entry=document.body.dataset.experiment==="v3"?await import("./entry-v3.mjs"):await import("./baseline/gradecrew-entry-flow.js");
entry.installGradeCrewEntryFlow();
document.getElementById("gcEntryStart")?.addEventListener("animationend",event=>{if(event.target.id==="gcEntryStart"&&event.animationName==="gcEntryIn")window.dispatchEvent(new Event("resize"));});
translateTree(document.querySelector(".topbar"));
watchStickyHeight(document.querySelector(".topbar"),"--topbar-height");
document.documentElement.style.setProperty("--editor-head-height",`${Math.ceil(document.querySelector(".compactEditorHead")?.getBoundingClientRect().height||0)}px`);
document.querySelectorAll("form").forEach(form=>form.addEventListener("submit",event=>{event.preventDefault();form.querySelectorAll("input[type=password]").forEach(input=>input.value="");alert(gradeCrewI18n?"Lokale Vorschau: Es wird kein Konto angelegt und kein Test geöffnet.":"Local preview only.");}));
document.addEventListener("gradecrew:start-guest-tour",()=>{location.href="../tutorial-finale.html";});
document.getElementById("openRightsReport")?.addEventListener("click",()=>alert("Lokale Vorschau: keine Meldung gesendet."));