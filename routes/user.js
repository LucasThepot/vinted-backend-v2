const express = require("express");
const router = express.Router();
const uid2 = require("uid2"); // Package qui sert à créer des string aléatoires
const SHA256 = require("crypto-js/sha256"); // Sert à encripter une string
const encBase64 = require("crypto-js/enc-base64"); // Sert à transformer l'encryptage en string
const User = require("../models/User");
const Offer = require("../models/Offer");

router.post("/user/signup", async (req, res) => {
  try {
    const useremail = await User.findOne({ email: req.body.email });
    if (useremail) {
      res.status(400).json({ message: "email already linked to an account" });
    } else {
      if (
        req.body.username &&
        req.body.email &&
        req.body.password &&
        req.body.newsletter
      ) {
        const password = req.body.password;
        const salt = uid2(16);
        const hash = SHA256(salt + password).toString(encBase64);
        const token = uid2(64);

        const newUser = new User({
          email: req.body.email,
          newsletter: req.body.newsletter,
          hash,
          salt,
          token,
          account: { username: req.body.username },
        });
        await newUser.save();
        res.status(201).json({
          _id: newUser._id,
          token: newUser.token,
          account: newUser.account,
        });
      } else {
        res.status(400).json({ message: "You must send all credentials" });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    if (req.body.email && req.body.password) {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        res.status(400).json({ message: "wrong credentials" });
      } else {
        const hash = SHA256(user.salt + req.body.password).toString(encBase64);
        if (hash !== user.hash) {
          res.status(400).json({ message: "wrong credentials" });
        } else {
          res.status(201).json({ message: "successfully logged in" });
        }
      }
    } else {
      res.status(400).json({ message: "please fill out all fields" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
