const express = require("express");
const router = express.Router();
const OrderController = require("../../controllers/order/index.js");
const { admin } = require("../../middleware/authMiddleware.js");

router.post("/", admin, OrderController.createOrder);
router.get("/history", admin, OrderController.getOrderHistory);

module.exports = router;
