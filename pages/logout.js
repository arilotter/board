const consts = require("../consts");

const login = (req, res) => {
  if (req.url !== `${consts.BASE_PATH}/logout`) {
    return false;
  }
  // Clear the password
  res.setHeader("Set-Cookie", [`password=logged_out`]);
  res.end(
    `<p>Logged out.</p><a href="${consts.BASE_PATH}/password">Log in</a>`
  );
  return true;
};

module.exports = login;
