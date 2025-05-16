const express = require("express");
const router = express.Router();
const InventoryController = require("../../controllers/inventory");
const {
  adminOrSubAdminOrSuperAdmin,
} = require("../../middleware/auth/adminMiddleware.js");

router.get(
  "/",
  adminOrSubAdminOrSuperAdmin,
  InventoryController.getAllInventories
);
router.get(
  "/:id",
  adminOrSubAdminOrSuperAdmin,
  InventoryController.getInventoryById
);
router.post(
  "/",
  adminOrSubAdminOrSuperAdmin,
  InventoryController.createInventory
);
router.put(
  "/:id",
  adminOrSubAdminOrSuperAdmin,
  InventoryController.updateInventory
);
router.delete(
  "/:id",
  adminOrSubAdminOrSuperAdmin,
  InventoryController.deleteInventory
);

module.exports = router;
