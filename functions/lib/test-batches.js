"use strict";

function planTestBatches(input, batchSize = 10) {
  const count = input.count;
  const units = Math.round(input.points * 2);
  if (!Number.isInteger(count) || count < 1 || count > 100 || !Number.isFinite(units) || units < count) throw new RangeError("Ungültige Testgröße oder Punkte");
  if (!Number.isInteger(batchSize) || batchSize < 1) throw new RangeError("Ungültige Blockgröße");
  const size = count > 20 ? batchSize : count;
  const imageCount = input.exactImageCounts ? input.imageQuestionCount : input.maxVisualQuestions || 0;
  const plannedImages = input.imageMode === "none" ? 0 : imageCount;
  const batches = [];
  for (let offset = 0; offset < count; offset += size) {
    const end = Math.min(count, offset + size);
    const images = Math.floor(end * plannedImages / count) - Math.floor(offset * plannedImages / count);
    batches.push({ ...input, count: end - offset,
      points: (Math.floor(end * units / count) - Math.floor(offset * units / count)) / 2,
      ...(input.exactImageCounts ? { imageQuestionCount: images, imageAnswerQuestionCount: 0 } : {}),
      imageMode: images ? input.imageMode : "none", maxVisualQuestions: images,
      batchOffset: offset, totalCount: count
    });
  }
  return batches;
}

async function generateTestInBatches(input, generate) {
  const batches = planTestBatches(input);
  const questions = [];
  const usage = {};
  let metadata;
  for (const batch of batches) {
    const result = await generate(batch, questions);
    if (!Array.isArray(result?.data?.questions)) throw new Error("Die KI-Antwort enthält keine Aufgabenliste.");
    metadata ||= result.data;
    questions.push(...result.data.questions);
    for (const key of ["input_tokens", "output_tokens", "total_tokens"]) usage[key] = Number(usage[key] || 0) + Number(result.usage?.[key] || 0);
  }
  return { data: { ...metadata, questions }, usage };
}
module.exports = { planTestBatches, generateTestInBatches };
