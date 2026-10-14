function escapeMathText(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

export function formatMathText(value) {
  const text = String(value ?? "");
  const pattern = /([\^_])\{([^{}]{1,80})\}/g;
  let html = "";
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    html += escapeMathText(text.slice(cursor, match.index));
    const tag = match[1] === "^" ? "sup" : "sub";
    html += `<${tag}>${escapeMathText(match[2])}</${tag}>`;
    cursor = match.index + match[0].length;
  }
  return html + escapeMathText(text.slice(cursor));
}
