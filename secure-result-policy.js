const result = document.getElementById("secureResult");

function enforcePendingReviewPolicy() {
  if (!result || result.classList.contains("hidden")) return;
  const title = result.querySelector("h1")?.textContent?.trim() || "";
  const pendingReview = title.includes("Bewertung folgt");
  result.dataset.pendingReview = pendingReview ? "1" : "0";
  if (!pendingReview) return;

  result.querySelector(".secureResultScore")?.remove();
  result.querySelector(".secureResultMeta")?.remove();

  if (!result.querySelector(".securePendingReviewNote")) {
    const note = document.createElement("p");
    note.className = "securePendingReviewNote";
    note.textContent = "Punkte, Prozentwert und Note werden erst angezeigt, nachdem deine Lehrkraft die offenen Antworten bewertet hat.";
    const solutionNote = [...result.querySelectorAll("p")].find(node => node.textContent.includes("Lösungen werden"));
    if (solutionNote) solutionNote.before(note);
    else result.appendChild(note);
  }
}

if (result) {
  enforcePendingReviewPolicy();
  const observer = new MutationObserver(enforcePendingReviewPolicy);
  observer.observe(result, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
}
