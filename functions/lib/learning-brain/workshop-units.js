"use strict";
// Equal fixed-size wholes. Private target values never enter public configs.
const {rational} = require("./exact");
const keys = ["tool", "version", "role", "goal", "denominator", "wholeCount", "instruction"];
const integer = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
function bad(message) { const e = new Error(message); e.code = "invalid-argument"; throw e; }
function config(value) {
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).length !== keys.length || keys.some((k) => !Object.hasOwn(value, k)) || value.tool !== "fraction-units" || value.version !== 1 || !["answer", "support"].includes(value.role) || value.goal !== "represent" || !integer(value.denominator, 2, 12) || !integer(value.wholeCount, 1, 4) || typeof value.instruction !== "string" || !value.instruction.trim() || value.instruction.length > 240) return null;
  return Object.fromEntries(keys.map((key) => [key, value[key]]));
}
function supports(topic) { return topic?.subject === "math" && /Br[üu]ch|Anteil|gemischt|Ganz/i.test([topic.title, topic.goal, topic.area].join(" ")); }
function validate(value, topic, task) {
  const c = config(value);
  if (!c || !supports(topic) || (task?.input === "workshop") !== (c.role === "answer")) bad("Das Mehrganzen-Modell passt nicht zur Aufgabe und ihrem Antwortweg.");
  if (c.role === "answer") {
    const answer = task.answer;
    if (!["rational", "exact-fraction"].includes(answer?.kind) || !Array.isArray(answer.values) || !answer.values.length || answer.values.some((value) => {
      const r = rational(value); if (!r) return true;
      const [a, b] = r[1] < 0n ? [-r[0], -r[1]] : r;
      if (a < 0n || a > BigInt(c.wholeCount) * b || a * BigInt(c.denominator) % b !== 0n) return true;
      return answer.kind === "exact-fraction" && (r[1] !== BigInt(c.denominator) || !integer(Number(r[0]), 0, c.wholeCount * c.denominator));
    })) bad("Die private Bruchlösung liegt nicht auf der sichtbaren gleichmäßigen Unterteilung.");
  }
  return c;
}
function observe(task, payload) {
  const c = config(task?.workshop);
  if (!c || typeof task.id !== "string" || !task.id || !payload || typeof payload !== "object" || Array.isArray(payload) || Object.keys(payload).length !== 4 || !["tool", "version", "taskId", "actions"].every((k) => Object.hasOwn(payload, k)) || payload.tool !== c.tool || payload.version !== 1 || payload.taskId !== task.id || !Array.isArray(payload.actions) || payload.actions.length > 60) bad("Diese Darstellung gehört nicht zur aktuellen Aufgabe.");
  let selected = [];
  const changes = [];
  for (const a of payload.actions) {
    if (!a || typeof a !== "object" || Array.isArray(a) || Object.keys(a).length !== 2 || !Object.hasOwn(a, "type") || !Object.hasOwn(a, "value") || !Number.isInteger(a.value)) bad("Ungültiger Schritt im Mehrganzen-Modell.");
    const before = {numerator:selected.length,denominator:c.denominator};
    if (a.type === "toggle-part" && integer(a.value, 0, c.wholeCount * c.denominator - 1)) selected = selected.includes(a.value) ? selected.filter((i) => i !== a.value) : [...selected, a.value].sort((x, y) => x - y);
    else if (a.type === "reset" && a.value === 0) selected = [];
    else bad("Nur ein vorhandenes Teilstück oder Zurücksetzen ist zulässig.");
    changes.push({type:a.type,value:a.value,before,after:{numerator:selected.length,denominator:c.denominator}});
  }
  return {tool:c.tool,version:1,role:c.role,goal:c.goal,wholeCount:c.wholeCount,final:{numerator:selected.length,denominator:c.denominator},selection:[...selected],selected:[...selected],answer:`${selected.length}/${c.denominator}`,actionCount:payload.actions.length,changes:changes.slice(-12)};
}
module.exports = {config, supports, validate, observe};
