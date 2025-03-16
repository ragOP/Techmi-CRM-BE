const express = require("express");
const router = express.Router();
const OrderController = require("../../controllers/order/index.js");
const { user } = require("../../middleware/auth/userMiddleware.js");
const {
  admin,
  superAdmin,
} = require("../../middleware/auth/adminMiddleware.js");

router.get("/", superAdmin, OrderController.getAllOrders);

router.post("/", user, OrderController.createOrder);
router.get("/history", user, OrderController.getOrderHistory);
router.patch("/:id", superAdmin, OrderController.updateOrder);

module.exports = router;
