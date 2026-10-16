"use strict";
const { digest } = require("./wissensreise-core");
const QUESTION_FIELDS = ["id","type","text","options","acceptedAnswers","manualReview","correctBoolean","pairs","items","acceptedOrders","groups","passage","targetWords","markGroups","gapColors","numericAnswer","tolerance","unit"];
function questionData(question) {
  const out = Object.fromEntries(QUESTION_FIELDS.filter(key=>question[key]!==undefined).map(key=>[key,question[key]]));
  if(Array.isArray(out.options))out.options=out.options.map(option=>({text:option.text,correct:option.correct===true}));
  return out;
}
function sourceQuestion(question) {
  const media = { imageUrl:question.imageUrl||null,imageDataUrl:question.imageDataUrl||null,audioPresentation:question.audioPresentation||null,audioAnswerMode:question.audioAnswerMode||null,audioIntent:question.audioIntent||null,optionMedia:(Array.isArray(question.options)?question.options:[]).map(option=>({imageUrl:option.imageUrl||null,imageDataUrl:option.imageDataUrl||null})) };
  return { ...questionData(question), hasMedia:Boolean(media.imageUrl||media.imageDataUrl||media.optionMedia.some(option=>option.imageUrl||option.imageDataUrl)||media.audioPresentation==="listening-only"||media.audioIntent?.presentation==="listening-only"||media.audioAnswerMode==="audio-only"), mediaFingerprint:digest(media) };
}
module.exports={QUESTION_FIELDS,questionData,sourceQuestion};
