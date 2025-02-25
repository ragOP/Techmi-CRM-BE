const express = require("express");

const CartController = require("../../controllers/cart/index.js");
const { admin } = require("../../middleware/authMiddleware");

const router = express.Router();


router.get("/", admin, CartController.getCart);
router.post("/", admin, CartController.addToCart);
router.delete("/:id", admin, CartController.deleteCartItem);

module.exports = router;