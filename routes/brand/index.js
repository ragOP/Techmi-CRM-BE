const express = require("express");
const router = express.Router();
const BrandController = require("../../controllers/brand/index.js");
const {
  adminOrSubAdminOrSuperAdmin,
} = require("../../middleware/auth/adminMiddleware.js");

router.get("/", adminOrSubAdminOrSuperAdmin, BrandController.getAllBrands);

router.get("/:id", adminOrSubAdminOrSuperAdmin, BrandController.getBrandById);

router.post("/", adminOrSubAdminOrSuperAdmin, BrandController.createBrand);

router.put("/:id", adminOrSubAdminOrSuperAdmin, BrandController.updateBrand);

router.delete("/:id", adminOrSubAdminOrSuperAdmin, BrandController.deleteBrand);

module.exports = router;

/**
 * @swagger
 * /api/brand:
 *   get:
 *     summary: Get all brands
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     summary: Create a new brand
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               logo_url:
 *                 type: string
 *               website:
 *                 type: string
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Brand created
 *
 * /api/brand/{id}:
 *   get:
 *     summary: Get a brand by ID
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Brand ID
 *     responses:
 *       200:
 *         description: Success
 *   put:
 *     summary: Update a brand by ID
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Brand ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               logo_url:
 *                 type: string
 *               website:
 *                 type: string
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Brand updated
 *   delete:
 *     summary: Delete a brand by ID
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Brand ID
 *     responses:
 *       200:
 *         description: Brand deleted
 */
