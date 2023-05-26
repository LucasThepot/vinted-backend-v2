const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Offer = require("../models/Offer");
const isAuthenticated = require("../middlewares/isAuthenticated");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dhqsibpx0",
  api_key: "519398527249577",
  api_secret: "HuRn-sYF_F-N0zLlxbJ8Xntg1lo",
  secure: true,
});
const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};
router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      const pictureToUpload = await cloudinary.uploader.upload(
        convertToBase64(req.files.picture)
      );
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
        product_image: { secure_url: pictureToUpload },
      });
      await newOffer.save();
      res.status(201).json(newOffer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
