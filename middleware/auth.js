const { getUser } = require("../service/auth");

async function restrictToLoggedinUserOnly(req, res, next) {
  console.log(req);
  const userUid = req.cookies?.uid;
  console.log("userUid", userUid);
  if (!userUid) return res.redirect("/login");
  const user = getUser(userUid);
  console.log("user", user);
  if (!user) return res.redirect("/login");

  req.user = user;
  next();
}

async function checkAuth(req, res, next) {
  const userUid = req.cookies?.uid;
  const user = getUser(userUid);
  req.user = user;
  next();
}

module.exports = {
  restrictToLoggedinUserOnly,
  checkAuth,
};
