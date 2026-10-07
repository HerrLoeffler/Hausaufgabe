"use strict";

module.exports = [{
  files: ["index.js", "main.js", "review-mode-callables.js", "lib/**/*.js", "test/**/*.js"],
  languageOptions: {
    sourceType: "commonjs",
    globals: {
      Buffer: "readonly",
      console: "readonly",
      process: "readonly",
      setTimeout: "readonly",
      clearTimeout: "readonly"
    }
  },
  rules: { "no-undef": "error" }
}];
