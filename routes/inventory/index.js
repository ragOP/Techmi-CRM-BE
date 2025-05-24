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
router.post("/check", InventoryController.checkInventoryForProducts);
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

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory management
 */

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Get all inventories
 *     tags: [Inventory]
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of inventories
 *   post:
 *     summary: Create a new inventory
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Inventory'
 *     responses:
 *       201:
 *         description: Inventory created
 *
 * /inventory/{id}:
 *   get:
 *     summary: Get inventory by ID
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory found
 *   put:
 *     summary: Update inventory by ID
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Inventory'
 *     responses:
 *       200:
 *         description: Inventory updated
 *   delete:
 *     summary: Delete inventory by ID
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory deleted
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Inventory:
 *       type: object
 *       properties:
 *         product_id:
 *           type: string
 *         quantity:
 *           type: integer
 *         last_modified_by:
 *           type: string
 *         last_modified_reason:
 *           type: string
 *         last_restocked_at:
 *           type: string
 *           format: date-time
 *         low_stock_threshold:
 *           type: integer
 *         warehouse_location:
 *           type: string
 */
