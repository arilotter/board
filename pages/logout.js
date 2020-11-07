const login = (req, res) => {
  if (req.url !== "/logout") {
    return false;
  }
  // Clear the password
  res.setHeader("Set-Cookie", [`password=logged_out`]);
  res.end(`<p>Logged out.</p><a href="/password">Log in</a>`);
  return true;
};

module.exports = login;
