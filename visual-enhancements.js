let started = false;

function installCreateChoiceStyles() {
  if (document.querySelector('style[data-gradecrew-create-choice]')) return;
  const style = document.createElement("style");
  style.dataset.gradecrewCreateChoice = "1";
  style.textContent = `
    #createView .createChoiceGrid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 14px;
      align-items: stretch;
    }
    #createView #createAiBtn {
      grid-column: 1 / -1;
      order: -10;
      position: relative;
      min-height: 132px;
      padding: 24px 28px;
      border: 2px solid #2f64d6;
      background: linear-gradient(135deg, #f7faff 0%, #edf4ff 100%);
      box-shadow: 0 14px 36px rgba(47, 100, 214, .12);
    }
    #createView #createAiBtn:hover {
      border-color: #1f55ca;
      box-shadow: 0 18px 42px rgba(47, 100, 214, .17);
      transform: translateY(-1px);
    }
    #createView #createAiBtn .choiceIcon {
      width: 76px;
      height: 76px;
      border-radius: 20px;
      background: #e5efff;
      display: grid;
      place-items: center;
      flex: 0 0 auto;
    }
    #createView #createAiBtn .choiceIcon img {
      width: 68px;
      height: 68px;
      object-fit: contain;
    }
    #createView #createAiBtn .choiceText strong {
      font-size: 21px;
      line-height: 1.25;
    }
    #createView #createAiBtn .choiceText small {
      font-size: 14px;
      line-height: 1.5;
      color: #526277;
    }
    #createView .gradecrewAiBadge {
      position: absolute;
      top: 16px;
      right: 54px;
      display: inline-flex;
      align-items: center;
      min-height: 28px;
      padding: 5px 10px;
      border-radius: 999px;
      background: #2f64d6;
      color: #fff;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: .04em;
      text-transform: uppercase;
    }
    #createView #createManualBtn,
    #createView .importChoiceCard {
      min-height: 112px;
      padding: 18px 20px;
      box-shadow: none;
      border-color: #dce3ed;
      background: #fff;
    }
    #createView #createManualBtn .choiceText strong,
    #createView .importChoiceCard .choiceText strong {
      font-size: 16px;
    }
    #createView #createManualBtn .choiceIcon,
    #createView .importChoiceCard .choiceIcon {
      width: 46px;
      height: 46px;
      flex: 0 0 auto;
    }
    #createView .gcCreateSecondaryLabel {
      grid-column: 1 / -1;
      order: -5;
      margin: 4px 0 -2px;
      color: #667085;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: .02em;
    }
    #createView #createManualBtn { order: -4; }
    #createView .importChoiceCard { order: -3; }
    @media (max-width: 760px) {
      #createView .createChoiceGrid { grid-template-columns: 1fr; }
      #createView #createAiBtn,
      #createView .gcCreateSecondaryLabel { grid-column: 1; }
      #createView #createAiBtn { min-height: 120px; padding: 20px; }
      #createView .gradecrewAiBadge { position: static; margin-left: auto; }
    }
  `;
  document.head.appendChild(style);
}

function polishCreateChoices() {
  const grid = document.querySelector("#createView .createChoiceGrid");
  const ai = document.getElementById("createAiBtn");
  const manual = document.getElementById("createManualBtn");
  const template = grid?.querySelector(".importChoiceCard");
  if (!grid || !ai || !manual || !template) return;

  installCreateChoiceStyles();

  if (grid.firstElementChild !== ai) grid.insertBefore(ai, grid.firstElementChild);

  let badge = ai.querySelector(".gradecrewAiBadge");
  if (!badge) {
    badge = document.createElement("span");
    badge.className = "gradecrewAiBadge";
    badge.textContent = "Empfohlen";
    ai.appendChild(badge);
  }

  const aiText = ai.querySelector(".choiceText small");
  if (aiText) aiText.textContent = "GradeCrew erstellt deinen ersten Entwurf – du prüfst und passt ihn anschließend an.";

  const manualHint = manual.querySelector(".choiceText small, .gcTourManualHint");
  if (manualHint) manualHint.textContent = "Leeren Test starten und jede Aufgabe selbst anlegen.";

  let secondaryLabel = grid.querySelector(".gcCreateSecondaryLabel");
  if (!secondaryLabel) {
    secondaryLabel = document.createElement("div");
    secondaryLabel.className = "gcCreateSecondaryLabel";
    secondaryLabel.textContent = "Weitere Möglichkeiten";
    ai.insertAdjacentElement("afterend", secondaryLabel);
  }
}

export function startVisualEnhancements() {
  if (started || typeof window === "undefined") return;
  started = true;

  window.setTimeout(async () => {
    polishCreateChoices();
    document.addEventListener("click", event => {
      if (event.target.closest("#newQuizBtn, #emptyNewQuizBtn, #backFromCreate, #brandBtn")) {
        window.setTimeout(polishCreateChoices, 0);
      }
    }, false);

    const modules = [
      ["Startguide-Sperre", "./first-guide-guard.js?v=2.3.1-gc9"],
      ["Crew-Tour-Sperre", "./crew-tour-hardening.js?v=2.3.1-gc13"],
      ["Crew-Tour-gc23", "./crew-tour-gc23-polish.js?v=2.3.1-gc23"],
      ["Lehrertexte", "./teacher-copy-polish.js?v=2.3.1-gc12"],
      ["Navigation", "./ui-enhancements.js?v=2.3.1-gc2"],
      ["Varianten", "./variant-enhancements.js?v=2.3.1-gc21"]
    ];
    const results = await Promise.allSettled(modules.map(([, path]) => import(path)));
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.warn(`GradeCrew ${modules[index][0]} konnte nicht geladen werden. Die Kern-App läuft weiter.`, result.reason);
      }
    });
  }, 0);
}

startVisualEnhancements();
