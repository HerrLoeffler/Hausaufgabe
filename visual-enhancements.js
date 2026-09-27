let started = false;

export function startVisualEnhancements() {
  if (started || typeof window === "undefined") return;
  started = true;

  window.setTimeout(async () => {
    const modules = [
      ["Branding", "./gradecrew-brand.js?v=gradecrew-v1.10"],
      ["Layout", "./layout-enhancements.js?v=gradecrew-v1.10"],
      ["Varianten", "./variant-enhancements.js?v=gradecrew-v1.10"],
      ["Admin-KI-Rechte", "./admin-ai-access.js?v=gradecrew-v1.10"]
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
