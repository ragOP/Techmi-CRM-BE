const express = require("express");
const router = express.Router();
const MedicineTypeController = require("../../controllers/medicine_type");
const {
  adminOrSubAdminOrSuperAdmin,
} = require("../../middleware/auth/adminMiddleware.js");

router.get(
  "/",
  adminOrSubAdminOrSuperAdmin,
  MedicineTypeController.getAllMedicineTypes
);

router.get(
  "/:id",
  adminOrSubAdminOrSuperAdmin,
  MedicineTypeController.getMedicineTypeById
);
router.post(
  "/",
  adminOrSubAdminOrSuperAdmin,
  MedicineTypeController.createMedicineType
);
router.put(
  "/:id",
  adminOrSubAdminOrSuperAdmin,
  MedicineTypeController.updateMedicineType
);
router.delete(
  "/:id",
  adminOrSubAdminOrSuperAdmin,
  MedicineTypeController.deleteMedicineType
);

module.exports = router;

/**
 * @swagger
 * /api/medicine-type:
 *   get:
 *     summary: Get all medicine types
 *     tags: [MedicineType]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     summary: Create a new medicine type
 *     tags: [MedicineType]
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
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Medicine type created
 *
 * /api/medicine-type/{id}:
 *   get:
 *     summary: Get a medicine type by ID
 *     tags: [MedicineType]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Medicine type ID
 *     responses:
 *       200:
 *         description: Success
 *   put:
 *     summary: Update a medicine type by ID
 *     tags: [MedicineType]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Medicine type ID
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
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Medicine type updated
 *   delete:
 *     summary: Delete a medicine type by ID
 *     tags: [MedicineType]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Medicine type ID
 *     responses:
 *       200:
 *         description: Medicine type deleted
 */