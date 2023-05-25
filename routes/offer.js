const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Offer = require("../models/Offer");
const isAuthenticated = require("../middlewares/isAuthenticated");
const fileUpload = require("express-fileupload");

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    const newOffer = new Offer({
      product_name: req.body.title,
      product_description: req.body.description,
      product_price: req.body.price,
      product_details: [
        {
          condition: req.body.condition,
          city: req.body.city,
          brand: req.body.brand,
          size: req.body.size,
          color: req.body.color,
        },
      ],
      owner: { account: req.user },
      product_image: { secure_url: req.files.product_image.secure_url },
    });
    await newOffer.save();
    res.status(201).json(newOffer);
  }
);

module.exports = router;
