const parseForm = require("body/form");

const PASSWORD = "e";

function login(req, res) {
  const cookies = parseCookie(req.headers.cookie);
  const userSubmittedPassword = cookies.password;
  const isLoggedIn = userSubmittedPassword === PASSWORD;

  const path = req.url;

  // Redirect all non-logged-in users to the login page
  if (!isLoggedIn && path !== "/password") {
    res.statusCode = 303;
    res.setHeader("Location", "/password");
    res.end();
    return true;
  }

  if (path !== "/password") {
    return false;
  }
  if (isLoggedIn) {
    res.end(`<p>You're already logged in :)</p><a href="/"> Go Home</a>`);
    return true;
  }
  if (req.method === "GET") {
    // Print the login form
    res.end(
      `
    <form method="POST">
        Enter Password: <input type="password" name="password">
        <input type="submit" value="Log In">
    </form>`
    );
    return true;
  }

  if (req.method === "POST") {
    // We got a login request, check the password & set cookie.
    parseForm(req, {}, (_, body) => {
      const passedPassword = body && body.password;

      res.statusCode = 303;

      if (PASSWORD === passedPassword) {
        res.setHeader("Location", "/");
        res.setHeader("Set-Cookie", [`password=${passedPassword}`]);
      } else {
        res.setHeader("Location", "/password");
        res.setHeader("Method", "GET");
      }

      res.end();
    });
    return true;
  }
  return false;
}

const parseCookie = (string) => {
  const arr = ("" + string || "").split(";");
  return arr.reduceRight((cookies, cookie) => {
    const [name, ...value] = cookie.split("=");
    cookies[name.trim()] = decodeURI(value.join("="));
    return cookies;
  }, {});
};

module.exports = login;
