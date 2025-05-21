const express = require("express");
const router = express.Router();
const OrderController = require("../../controllers/order/index.js");
const { user } = require("../../middleware/auth/userMiddleware.js");
const {
  admin,
  superAdmin,
  adminOrSuperAdmin,
} = require("../../middleware/auth/adminMiddleware.js");

router.get("/export", superAdmin, OrderController.exportOrders);
router.get("/", adminOrSuperAdmin, OrderController.getAllOrders);
router.get("/overview", adminOrSuperAdmin, OrderController.getOrderOverview);

router.post("/", user, OrderController.createOrder);
router.get("/history", user, OrderController.getOrderHistory);
router.patch("/:id", adminOrSuperAdmin, OrderController.updateOrder);
router.get("/:id", adminOrSuperAdmin, OrderController.getOrderById);

module.exports = router;
