"use strict";

const base = require("./index");
const { submitAssessmentAttempt } = require("./lib/secure-submit");

module.exports = {
  ...base,
  submitAssessmentAttempt
};
