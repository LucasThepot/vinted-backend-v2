const express = require("express");
const app = express();
app.use(express.json());
const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/vinted");
const userRoutes = require("./routes/user");
app.use(userRoutes);
const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

require("dotenv").config();
app.listen(3000, () => console.log("Server started"));
