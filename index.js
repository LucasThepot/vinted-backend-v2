require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json());
const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/vinted");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});
const userRoutes = require("./routes/user");
app.use(userRoutes);
const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

app.listen(3000, () => console.log("Server started"));
