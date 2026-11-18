// Completion describes participation only. It never reads the solution or awards points.
export function answerIsComplete(question, value, { orderingTouched = true } = {}) {
  const filled = item => ["string", "number", "boolean"].includes(typeof item) && String(item).trim() !== "";
  const record = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const values = Object.values(record);
  if (["text", "number", "dropdown", "single", "truefalse"].includes(question.type)) return filled(value);
  if (question.type === "multi") return Array.isArray(value) && value.length > 0;
  if (question.type === "gapfill") {
    const expected = Array.isArray(question.segments)
      ? question.segments.filter(segment => segment.type === "gap").length
      : [...String(question.text || "").matchAll(/\[([^\]]+)\]/g)].length;
    return expected > 0 && Array.isArray(value) && value.length === expected && value.every(filled);
  }
  if (question.type === "matching") {
    const expected = (question.leftItems || question.pairs || []).length;
    return expected > 0 && values.length === expected && values.every(filled);
  }
  if (question.type === "grouping") {
    const expected = Array.isArray(question.items) ? question.items.length
      : (question.groups || []).reduce((sum, group) => sum + (group.items || []).length, 0);
    return expected > 0 && values.length === expected && values.every(filled);
  }
  if (question.type === "ordering") return orderingTouched && Array.isArray(value)
    && value.length > 0 && value.length === (question.items || []).length;
  if (question.type === "markwords") return (question.markGroups || []).length
    ? values.length > 0 && values.every(filled)
    : Array.isArray(value) && value.length > 0;
  return false;
}

export function paintAnswerCompletion(button, index, complete) {
  button.classList.toggle("complete", complete);
  button.dataset.answerState = complete ? "answered" : "open";
  button.textContent = complete ? `${index + 1} ✓` : String(index + 1);
  const label = `Aufgabe ${index + 1} · ${complete ? "beantwortet" : "offen"}`;
  button.setAttribute("aria-label", label);
  button.title = label;
}
