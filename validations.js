const consts = require("./consts");

module.exports = {
  url: function (s) {
    const MIN_VALID_URL_LENGTH = "http://x.x".length;
    if (typeof s !== "string" || s.length < MIN_VALID_URL_LENGTH) {
      throw "Enter a URL.";
    }
    if (s.length > consts.URL_CHAR_LIMIT) {
      throw `URL length ${s.length} exceeds limit of ${consts.URL_CHAR_LIMIT} characters.`;
    }
    const url = new URL(s);
    if (
      !s.startsWith("http://") &&
      !s.startsWith("https://") &&
      s.includes("://")
    ) {
      throw `Invalid protocol ${url.protocol}`;
    }
  },
  title: function (s) {
    if (typeof s !== "string" || s.trim().length < 1) {
      throw `Enter a title.`;
    }
    if (s.length > consts.TITLE_CHAR_LIMIT) {
      throw `Post title length ${s.length} exceeds limit of ${consts.TITLE_CHAR_LIMIT} characters.`;
    }
  },
  username: function (s) {
    if (typeof s !== "string") {
      throw `Invalid username ${s}`;
    }
    if (s.trim().length < 1) {
      throw `Username ${s} too short!`;
    }
    if (s.length > consts.USERNAME_CHAR_LIMIT) {
      throw `Username length ${s} exceeds limit of ${consts.USERNAME_CHAR_LIMIT} characters.`;
    }
  },
  text: function (s) {
    if (typeof s !== "string") {
      throw `Invalid text ${s}`;
    }
    if (s.trim().length < 1) {
      throw `Text ${s} too short!`;
    }
    if (s.length > consts.BODY_CHAR_LIMIT) {
      throw `Text length ${s} exceeds limit of ${consts.BODY_CHAR_LIMIT} characters.`;
    }
  },
};
