"use strict";

module.exports = [{
  files: ["index.js", "lib/**/*.js", "test/**/*.js"],
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
