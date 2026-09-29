let installed = false;

function titleOf(coach) {
  return coach?.querySelector("h2")?.textContent?.trim() || "";
}

function installStyles() {
  if (document.querySelector("style[data-gc26-story-polish]")) return;
  const style = document.createElement("style");
  style.dataset.gc26StoryPolish = "1";
  style.textContent = `
    .gc26HandoffStory .gcHandoffFaces.gcClayNames{
      display:grid!important;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);
      align-items:center;gap:12px!important;width:min(100%,520px);margin:2px auto 12px!important
    }
    .gc26HandoffStory .gcHandoffFaces.gcClayNames>div{
      min-width:0;padding:8px 12px;border:1px solid #dce5e1;border-radius:999px;
      background:#fff;color:#294940;text-align:center;box-shadow:0 4px 12px rgba(31,61,54,.05)
    }
    .gc26HandoffStory .gcHandoffFaces.gcClayNames>div strong{font-size:13px}
    .gc26HandoffStory .gcHandoffFaces.gcClayNames>span{
      display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;
      min-width:58px;color:#557069
    }
    .gc26HandoffArrow{font-size:30px;line-height:.9;color:#2f64d6;font-weight:800;animation:gc26Pass .55s ease-out 1}
    .gc26HandoffStory .gcHandoffFaces small{font-size:9px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#7a8b86}
    .gc26RemyWorking .gcCoachIdentity{position:relative}
    .gc26PencilBadge{
      position:absolute;left:70px;top:50px;display:flex;align-items:center;gap:4px;padding:5px 8px;
      border:1px solid #dfd8c8;border-radius:999px;background:#fffaf0;color:#6f5930;
      font-size:15px;font-weight:800;box-shadow:0 5px 14px rgba(73,59,32,.12);transform:rotate(-5deg);
      animation:gc26Write .7s ease-out 1;pointer-events:none
    }
    .gc26PencilBadge small{font-size:9px;letter-spacing:.02em;color:#7b6a49}
    .gc26NameReveal .gcCoachIdentity{display:grid!important;grid-template-columns:auto auto minmax(0,1fr);align-items:center;gap:12px}
    .gc26NameSign{
      position:relative;display:flex;align-items:center;gap:7px;min-width:112px;max-width:220px;
      padding:10px 14px;border:2px solid #d9c49a;border-radius:10px;background:#fff8e8;color:#27463e;
      box-shadow:0 7px 18px rgba(68,52,28,.12);transform:rotate(-2deg);animation:gc26Sign .5s ease-out 1
    }
    .gc26NameSign:before{content:"";position:absolute;left:-12px;top:50%;width:12px;height:2px;background:#b89b67}
    .gc26NameSign strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:15px}
    .gc26NameHeart{color:#c35c62;font-size:17px;line-height:1}
    @keyframes gc26Pass{from{opacity:.25;transform:translateX(-7px)}to{opacity:1;transform:none}}
    @keyframes gc26Write{0%{opacity:0;transform:translate(-5px,5px) rotate(-10deg)}100%{opacity:1;transform:rotate(-5deg)}}
    @keyframes gc26Sign{from{opacity:0;transform:translateY(8px) rotate(-5deg)}to{opacity:1;transform:rotate(-2deg)}}
    @media(max-width:640px){
      .gc26HandoffStory .gcHandoffFaces.gcClayNames{gap:7px!important}
      .gc26HandoffStory .gcHandoffFaces.gcClayNames>div{padding:7px 9px}
      .gc26HandoffStory .gcHandoffFaces.gcClayNames>span{min-width:44px}
      .gc26HandoffArrow{font-size:25px}
      .gc26NameReveal .gcCoachIdentity{grid-template-columns:auto 1fr}
      .gc26NameSign{grid-column:1 / -1;justify-self:center;max-width:100%}
      .gc26PencilBadge{left:55px;top:42px}
    }
    @media(prefers-reduced-motion:reduce){.gc26HandoffArrow,.gc26PencilBadge,.gc26NameSign{animation:none!important}}
  `;
  document.head.appendChild(style);
}

function polishHandoff(coach) {
  const title = titleOf(coach);
  if (!coach.classList.contains("gcCoachHandoff") || !/^Das ist (Remy|Emmi|Wilma)!$/.test(title)) return;
  coach.classList.add("gc26HandoffStory");
  const bridge = coach.querySelector(".gcHandoffFaces.gcClayNames > span");
  if (bridge && bridge.dataset.gc26 !== "1") {
    bridge.dataset.gc26 = "1";
    bridge.innerHTML = '<b class="gc26HandoffArrow">→</b><small>Übergabe</small>';
  }
}

function polishRemyWorking(coach) {
  const title = titleOf(coach);
  if (!["Wir bauen einen Test für Klasse 4.", "Sag mir, was dir wichtig ist."].includes(title)) return;
  if (coach.querySelector(".gc26PencilBadge")) return;
  coach.classList.add("gc26RemyWorking");
  const identity = coach.querySelector(".gcCoachIdentity");
  if (!identity) return;
  const badge = document.createElement("span");
  badge.className = "gc26PencilBadge";
  badge.setAttribute("aria-hidden", "true");
  badge.innerHTML = '✏️ <small>Remy trägt ein</small>';
  identity.appendChild(badge);
}

function ensureFriendlyNameQuestion(coach) {
  const title = titleOf(coach);
  if (!["Ach, fast vergessen!", "Wie heißt du eigentlich?"].includes(title)) return;
  const copy = coach.querySelector(":scope > p");
  if (copy) copy.textContent = "Wie unhöflich von mir – ich habe dich noch gar nicht gefragt, wie ich dich nennen darf. Ich darf doch du sagen, oder?";
}

function polishNameReveal(coach) {
  const title = titleOf(coach);
  const match = title.match(/^Freut mich,\s*(.+)!$/);
  if (!match || coach.querySelector(".gc26NameSign")) return;
  const name = match[1].trim();
  const identity = coach.querySelector(".gcCoachIdentity");
  const image = identity?.querySelector("img");
  if (!identity || !image || !name) return;
  coach.classList.add("gc26NameReveal");
  const sign = document.createElement("div");
  sign.className = "gc26NameSign";
  sign.setAttribute("aria-label", `Coco begrüßt ${name}`);
  const heart = document.createElement("span");
  heart.className = "gc26NameHeart";
  heart.textContent = "♥";
  const label = document.createElement("strong");
  label.textContent = name;
  sign.append(heart, label);
  image.insertAdjacentElement("afterend", sign);
}

function patchCoach(coach) {
  if (!(coach instanceof Element) || !coach.classList.contains("gcRealCoach")) return;
  // The approved "Danke, Remy!" scene is intentionally left untouched.
  if (titleOf(coach) === "Danke, Remy!") return;
  polishHandoff(coach);
  polishRemyWorking(coach);
  ensureFriendlyNameQuestion(coach);
  polishNameReveal(coach);
}

function installObserver() {
  document.querySelectorAll(".gcRealCoach").forEach(patchCoach);
  const observer = new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches?.(".gcRealCoach")) queueMicrotask(() => patchCoach(node));
        node.querySelectorAll?.(".gcRealCoach").forEach(coach => queueMicrotask(() => patchCoach(coach)));
      }
    }
  });
  if (document.body) observer.observe(document.body, { childList: true, subtree: true });
}

export function installGc26StoryPolish() {
  if (installed || typeof document === "undefined") return;
  installed = true;
  installStyles();
  installObserver();
}

installGc26StoryPolish();
