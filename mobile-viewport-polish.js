function installMobileViewportPolish() {
  if (typeof document === "undefined") return;
  if (document.querySelector("style[data-gradecrew-mobile-viewport]")) return;

  const style = document.createElement("style");
  style.dataset.gradecrewMobileViewport = "1";
  style.textContent = `
    html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }

    @media (max-width: 760px), (pointer: coarse) and (max-width: 900px) {
      :root { --gc-mobile-safe-gap: 12px; }

      body { min-width: 0; }

      .shell {
        padding-left: max(12px, env(safe-area-inset-left, 0px)) !important;
        padding-right: max(12px, env(safe-area-inset-right, 0px)) !important;
        padding-bottom: max(55px, calc(28px + env(safe-area-inset-bottom, 0px))) !important;
      }

      .topbar {
        padding-left: max(14px, env(safe-area-inset-left, 0px)) !important;
        padding-right: max(14px, env(safe-area-inset-right, 0px)) !important;
      }

      input:not([type="checkbox"]):not([type="radio"]),
      select,
      textarea {
        font-size: 16px !important;
        line-height: 1.35;
        min-height: 44px;
      }

      textarea { min-height: 88px; }

      .button,
      .iconButton,
      .linkButton,
      .tab,
      .segment,
      button.createChoiceCard {
        min-height: 44px;
      }

      .iconButton { min-width: 44px; }

      dialog:not(.gcTourVariantDialog) {
        max-width: calc(100vw - 20px);
        max-height: calc(100dvh - 24px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px));
        overflow: auto;
        overscroll-behavior: contain;
      }

      .toast {
        left: max(12px, env(safe-area-inset-left, 0px));
        right: max(12px, env(safe-area-inset-right, 0px));
        width: auto;
        max-width: none;
      }

      .reportableErrorHost {
        right: max(12px, env(safe-area-inset-right, 0px));
        left: max(12px, env(safe-area-inset-left, 0px));
        bottom: max(12px, env(safe-area-inset-bottom, 0px));
        max-width: none;
      }

      .reportableErrorCard { width: 100%; max-width: none; }

      .pageHead,
      .sectionHead,
      .reviewHeader { min-width: 0; }

      .card,
      .createChoiceCard,
      .quizCard,
      .questionCard { min-width: 0; }

      img, svg, canvas { max-width: 100%; }
    }

    @media (max-height: 520px) and (orientation: landscape) {
      .shell { padding-top: 14px !important; }
      .topbar { min-height: 56px; height: auto; }
      .brand small { display: none; }
    }
  `;
  document.head.appendChild(style);
}

installMobileViewportPolish();
export { installMobileViewportPolish };
