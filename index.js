const main = require("./pages/main");
const login = require("./pages/login");
const logout = require("./pages/logout");

const http = require("http");

const port = process.env.PORT || 3000;

// A route is a function `(req, res) => boolean`.
// It should return true if it handled the request, false otherwise.
const routes = [
  login,
  logout,
  main,
  (_, r, __) => {
    r.statusCode = 404;
    r.end(`{"error": "${http.STATUS_CODES[404]}"}`);
    return true;
  },
];

const server = http.createServer(async (req, res) => {
  // Run each route in order.
  for (let route of routes) {
    // Stop if a route signals that it's handled the request.
    if (route(req, res)) {
      return;
    }
  }
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
