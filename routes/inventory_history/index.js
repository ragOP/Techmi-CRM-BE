const express = require("express");
const router = express.Router();
const InventoryHistoryController = require("../../controllers/inventory_history/index.js");
const {
  adminOrSubAdminOrSuperAdmin,
} = require("../../middleware/auth/adminMiddleware.js");

router.get(
  "/",
  adminOrSubAdminOrSuperAdmin,
  InventoryHistoryController.getAllHistory
);

router.get(
  "/product/:productId",
  adminOrSubAdminOrSuperAdmin,
  InventoryHistoryController.getHistoryByProduct
);

router.get(
  "/inventory/:inventoryId",
  adminOrSubAdminOrSuperAdmin,
  InventoryHistoryController.getHistoryByInventory
);

module.exports = router;
