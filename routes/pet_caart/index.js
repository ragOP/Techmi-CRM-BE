const express = require("express");
const router = express.Router();
const PetCartController = require("../../controllers/pet_caart/index.js");

router.get("/", PetCartController.getPetCartResponse);
router.post("/", PetCartController.createPetCartResponse);

module.exports = router;