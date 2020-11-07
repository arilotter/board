const parseForm = require("body/form");

const consts = require("../consts");
const validations = require("../validations");
const Board = require("../board");

const boards = [
  new Board("Music", {
    Title: validations.title,
    URL: validations.url,
  }),
  new Board("Links", {
    Title: validations.title,
    URL: validations.url,
  }),
  new Board("Chat", {
    Title: validations.title,
    Text: validations.text,
  }),
];

////////////////////////////////////////////////////////////////
// fill up a board with junk
const chars = " qwerty uiop sdfg hjkl zxc vbnm";
for (let i = 0; i < 30; i++) {
  boards[0].add({
    Title: Array.from(
      { length: Math.round(Math.random() * (consts.TITLE_CHAR_LIMIT - 1)) + 1 },
      (_) => chars[Math.round(Math.random() * chars.length) - 1]
    ).join(""),
    URL: "https://example.com",
    Username: "Robot",
  });
}
////////////////////////////////////////////////////////////////

const inputTypes = {
  url: "url",
  default: "text",
  title: "text",
};

const inputElements = {
  default: "input",
  text: "textarea",
};

module.exports = function main(req, res) {
  // Main page
  if (req.url === `${consts.BASE_PATH}/`) {
    res.end(`
    <h1>Welcome!</h1>
    <a href="${consts.BASE_PATH}/logout">Log out</a>
    ${
      // For each board,
      boards.reduce((str, board) => {
        // Print its title,
        str += `<h2>${board.name}</h2>`;
        // A "post" form,
        str += `
      <h3>Post to ${board.name}</h3>
      <form method="POST" action="${consts.BASE_PATH}/post">
        <input type="hidden" name="board" value="${board.name}">
      `;
        for (let fieldName of Object.keys(board.fields)) {
          const fieldElement =
            inputElements[fieldName.toLowerCase()] || inputElements.default;

          const fieldType =
            inputTypes[fieldName.toLowerCase()] || inputTypes.default;

          str += `
            <label for="${fieldName}">${fieldName}:
            </label>

            <${fieldElement} type="${fieldType}" name="${fieldName}" required></${fieldElement}>
          `;
        }

        str += `
        <input type="submit" value="Submit Post">
      </form>`;

        // And print all the posts in the board.
        str += "<ol>";
        for (let post of [...board.posts].reverse()) {
          str += `<li>`;
          str += `<${new Date(post.timestamp).toLocaleTimeString("en-CA", {
            timeZone: "Canada/Eastern",
            hour12: true,
            hour: "numeric",
            minute: "numeric",
          })}> [${post.Username}] `;
          if ("URL" in post) {
            str += `<a href=${post.URL}>${post.Title}</a>`;
          }
          if ("Text" in post) {
            str += `<p>${post.Text}</p>`;
          }
        }
        str += "</ol>";

        return str;
      }, "")
    }
    `);
    return true;
  }

  if (
    req.url.split("?")[0] === `${consts.BASE_PATH}/post` &&
    req.method === "POST"
  ) {
    // We got a post message request!
    parseForm(req, {}, (_, post) => {
      const finish = () => {
        res.statusCode = 303;
        res.setHeader("Location", `${consts.BASE_PATH}/`);
        res.end("Redirecting...");
      };
      if (!post) {
        return finish();
      }

      const board = boards.find((b) => b.name === post.board);
      if (!board) {
        res.statusCode = 400;
        res.end(`
          <h1>post failed</h1>
          <p>unknown board ${post.board}</p>
          <a href="${consts.BASE_PATH}/">go home</a>
        `);
        return;
      }

      try {
        board.add(post);
      } catch (e) {
        res.statusCode = 400;
        res.end(`
          <h1>post failed</h1>
          <p>${e}</p>
          <a href="${consts.BASE_PATH}/">go home</a>
        `);
        return;
      }

      finish();
    });
    return true;
  }

  return false;
};
