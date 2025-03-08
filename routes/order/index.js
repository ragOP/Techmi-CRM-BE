const express = require("express");
const router = express.Router();
const OrderController = require("../../controllers/order/index.js");
const { user } = require("../../middleware/authMiddleware.js");

router.post("/", user, OrderController.createOrder);
router.get("/history", user, OrderController.getOrderHistory);

module.exports = router;
