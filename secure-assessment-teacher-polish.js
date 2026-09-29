function patchSecureSolutionSetting() {
  const checkbox = document.getElementById("quizShowSolutions");
  const label = checkbox?.closest("label");
  if (!checkbox || !label || label.dataset.secureSolutionPolicy === "1") return;
  label.dataset.secureSolutionPolicy = "1";

  const textNode = [...label.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
  if (textNode) textNode.textContent = " Richtige Lösungen nach Testende anzeigen";

  const hint = document.createElement("small");
  hint.className = "hint secureSolutionPolicyHint";
  hint.textContent = "Sicherheitsmodus: Lösungen werden erst freigegeben, wenn du den Test beendest – nie direkt nach der Abgabe einzelner Schüler.";
  label.insertAdjacentElement("afterend", hint);
}

patchSecureSolutionSetting();

const observer = new MutationObserver(() => patchSecureSolutionSetting());
observer.observe(document.documentElement, { childList: true, subtree: true });
