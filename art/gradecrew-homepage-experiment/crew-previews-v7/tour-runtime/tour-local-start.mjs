import {gradeCrewI18n} from './shared/i18n/bootstrap.mjs?v=3';
import {GRADECREW_ASSETS} from './generated/gradecrew-assets.js?v=1.2.0';
import {watchStickyHeight} from './interface.js?v=2.3.1-gc2';
import {isolation} from './firebase-local.mjs';
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


installGradeCrewDesignStyles();installGradeCrewBrandAssets();
await Promise.all([...document.querySelectorAll('link[rel=stylesheet]')].map(link=>link.sheet?Promise.resolve():new Promise(resolve=>{link.addEventListener('load',resolve,{once:true});link.addEventListener('error',resolve,{once:true});})));
const {installGradeCrewEntryFlow}=await import('./gradecrew-entry-flow.js?v=7');installGradeCrewEntryFlow();
watchStickyHeight(document.querySelector('.topbar'),'--topbar-height');
window.__gradecrewIsolation=isolation;
document.addEventListener('gradecrew:guest-tour-exited',()=>{location.href='../index.html';});
const notice=document.getElementById('startupNotice');
try{
 await import('./app.js?v=2.3.1-gc39-isolated-v7');
 await new Promise(resolve=>setTimeout(resolve,0));
 // Original tour/editor polish, loaded from frozen local copies only.
 for(const file of ['gradecrew-workspace-upgrade.mjs','visual-enhancements.js'])await import('./'+file);
 notice?.classList.add('hidden');
 document.dispatchEvent(new Event('gradecrew:start-guest-tour'));
}catch(error){console.error(error);document.getElementById('startupMessage').textContent='Die lokale Tutorialkopie konnte nicht starten: '+error.message;notice?.classList.remove('hidden');}
