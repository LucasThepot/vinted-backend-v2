const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Offer = require("../models/Offer");
const isAuthenticated = require("../middlewares/isAuthenticated");
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");
const convertToBase64 = require("../utils/convertToBase64");

router.get("/offers", async (req, res) => {
  try {
    // Création d'un objet dans lequel on va sotcker nos différents filtres
    let filters = {};

    // Si on reçoit un query title
    if (req.query.title) {
      // On rajoute une clef product_name contenant une RegExp créée à partir du query title
      filters.product_name = new RegExp(req.query.title, "i");
    }
    // Si on reçoit un query priceMin
    if (req.query.priceMin) {
      // On rajoute une clef à filter contenant { $gte: req.query.priceMin }
      filters.product_price = {
        $gte: req.query.priceMin,
      };
    }
    // Si on reçoit un query priceMax
    if (req.query.priceMax) {
      // Si on a aussi reçu un query priceMin
      if (filters.product_price) {
        // On rajoute une clef $lte contenant le query en question
        filters.product_price.$lte = req.query.priceMax;
      } else {
        // Sinon on fait comme avec le query priceMax
        filters.product_price = {
          $lte: req.query.priceMax,
        };
      }
    }
    // Création d'un objet sort qui servira à gérer le tri
    let sort = {};
    // Si on reçoit un query sort === "price-desc"
    if (req.query.sort === "price-desc") {
      // On réassigne cette valeur à sort
      sort = { product_price: -1 };
    } else if (req.query.sort === "price-asc") {
      // Si la valeur du query est "price-asc" on réassigne cette autre valeur
      sort = { product_price: 1 };
    }
    // Création de la variable page qui vaut, pour l'instant, undefined
    let page;
    // Si le query page n'est pas un nombre >= à 1
    if (Number(req.query.page) < 1) {
      // page sera par défaut à 1
      page = 1;
    } else {
      // Sinon page sera égal au query reçu
      page = Number(req.query.page);
    }
    // La variable limit sera égale au query limit reçu
    let limit = Number(req.query.limit);
    // On va chercher les offres correspondant aux query de filtre reçus grâce à filters, sort et limit. On populate la clef owner en n'affichant que sa clef account
    const offers = await Offer.find(filters)
      .populate({
        path: "owner",
        select: "account",
      })
      .sort(sort)
      .skip((page - 1) * limit) // ignorer les x résultats
      .limit(limit); // renvoyer y résultats

    // cette ligne va nous retourner le nombre d'annonces trouvées en fonction des filtres
    const count = await Offer.countDocuments(filters);

    res.json({
      count: count,
      offers: offers,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

// Route qui permet de récupérer les informations d'une offre en fonction de son id. Cette route necessite un params
router.get("/offer/:id", async (req, res) => {
  try {
    // On va chercher l'offre correspondante à l'id reçu et on populate sa clef owner en sélectionnant uniquement les clefs username, phone et avatar de la clef account
    const offer = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account.username account.phone account.avatar",
    });
    res.json(offer);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

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
        owner: req.user,
        product_image: pictureToUpload,
      });
      await newOffer.save();
      res.status(201).json(newOffer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
