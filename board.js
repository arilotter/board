const consts = require("./consts");
const validations = require("./validations");

class Board {
  // The filter is applied to each potential submission.
  // It's a function that takes an object as an argument,
  // and throws a string as an error if there's a problem.
  // It returns the validated object. It should remove any extra properties.
  constructor(name, fields = {}) {
    this.name = name;

    if (typeof fields !== "object") {
      throw new Error(
        `Developer Error: Invalid fields list. Expected \`{
  'field': (data) => {
    /* throw if error */
  },
  ...
}\`, got ${fields}`
      );
    }
    this.fields = {
      Username: validations.username,
      ...fields,
    };
    this.posts = [];
  }

  add(originalPost) {
    const validFieldNames = Object.keys(this.fields);
    for (const validFieldName of validFieldNames) {
      if (!(validFieldName in originalPost)) {
        throw `Post is missing field ${validFieldName}`;
      }

      // validate the field
      const validationFunction = this.fields[validFieldName];
      validationFunction(originalPost[validFieldName]);
    }

    // Make a post object with only the validated fields
    // + a timestamp.
    const post = validFieldNames.reduce(
      (p, field) => {
        p[field] = originalPost[field];
        return p;
      },
      {
        timestamp: Date.now(),
      }
    );

    this.posts.push(post);

    // If there are now too many posts,
    if (this.posts.length > consts.POST_LIMIT) {
      // Remove the oldest.
      this.posts.shift();
    }
  }

  reset() {
    this.posts = [];
  }
}

module.exports = Board;
