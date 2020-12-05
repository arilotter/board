const parseForm = require("body/form");
const fs = require("fs");
const path = require("path");

const FILENAME = "./database.json";

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

loadBoards();

const inputTypes = {
  url: "url",
  default: "text",
  title: "text",
};

const inputElements = {
  default: "input",
  text: "textarea",
};

function saveBoards() {
  console.log("Saving boards...");
  const string = JSON.stringify(
    boards.map((board) => ({
      name: board.name,
      posts: board.posts,
    })),
    null,
    2
  );
  const filePath = path.join(process.cwd(), FILENAME);
  fs.writeFileSync(filePath, string);
}

function loadBoards() {
  const filePath = path.join(process.cwd(), FILENAME);
  try {
    const string = fs.readFileSync(filePath, "utf8");
    const loadedBoards = JSON.parse(string);
    for (let board of boards) {
      const loadedBoard = loadedBoards.find((b) => b.name === board.name);
      if (loadedBoard) {
        console.info("Loading board", loadedBoard.name);
        board.posts = loadedBoard.posts;
      }
    }
  } catch (err) {
    console.warn("Didn't load boards.", err);
  }
}

module.exports = function main(req, res) {
  // Main page
  if (req.url === `${consts.BASE_PATH}/`) {
    const boardsContent = boards.reduce((str, board) => {
      // For each board,
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
        str += `&lt;${new Date(post.timestamp).toLocaleTimeString("en-CA", {
          timeZone: "Canada/Eastern",
          hour12: true,
          hour: "numeric",
          minute: "numeric",
        })}&gt; [${post.Username}] `;
        if ("URL" in post) {
          str += `<a href=${post.URL}>${post.Title}</a>`;
        }
        if ("Text" in post) {
          str += `<p>${post.Text}</p>`;
        }
      }
      str += "</ol>";

      return str;
    }, "");
    res.end(`
      <h1>Welcome!</h1>
      <a href="${consts.BASE_PATH}/logout">Log out</a>
      ${boardsContent}
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
        saveBoards();
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
