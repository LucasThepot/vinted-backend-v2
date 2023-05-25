const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: String,
  newsletter: Boolean,
  hash: String,
  salt: String,
  token: String,
  account: {
    username: String,
  },
});

module.exports = User;
