const express = require("express");
const router = express.Router();
const OrderController = require("../../controllers/order/index.js");
const { user } = require("../../middleware/auth/userMiddleware.js");

router.post("/", user, OrderController.createOrder);
router.get("/", OrderController.getAllOrders);
router.get("/history", user, OrderController.getOrderHistory);

module.exports = router;
