const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: {
    // unique : true permet de s'assurer que 2 users ne peuvent pas avoir le même email
    unique: true,
    type: String,
  },
  newsletter: Boolean,
  hash: String,
  salt: String,
  token: String,
  account: {
    username: { required: true, type: String },
    avatar: Object,
  },
});

module.exports = User;
