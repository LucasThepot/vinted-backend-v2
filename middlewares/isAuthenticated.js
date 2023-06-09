const User = require("../models/User");
const Offer = require("../models/Offer");

const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    console.log(req.headers);
    const user = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
    }).select("account _id");

    if (!user) {
      return res.status(401).json({ error: "Unauthorized1" });
    } else {
      req.user = user;
      // On crée une clé "user" dans req. La route dans laquelle le middleware est appelé     pourra avoir accès à req.user
      return next();
    }
  } else {
    return res.status(401).json({ error: "Unauthorized2" });
  }
};

module.exports = isAuthenticated;
