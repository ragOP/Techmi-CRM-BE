const express = require("express");
const {
  getAllAdmins,
  registerAdmin,
  updateAdmin,
  deleteAdmin,
  // logoutAdmin,
  loginAdmin,
  getAllSubAdmins,
  registerSubAdmin,
} = require("../../../controllers/auth/admin/index");
const {
  admin,
  superAdmin,
} = require("../../../middleware/auth/adminMiddleware");

const router = express.Router();

router.get("/", superAdmin, getAllAdmins);
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/sub-admin", admin, getAllSubAdmins);
router.post("/sub-admin", admin, registerSubAdmin);
// router.post("/logout", logoutAdmin);

// DEVELOPMENT API's
router.patch("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

module.exports = router;

/**
 * @swagger
 * /api/auth/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 */

/**
 * @swagger
 * /api/auth/admin:
 *   get:
 *     summary: Get all admins (super admin only)
 *     tags: [Admin Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of admins
 */

/**
 * @swagger
 * /api/auth/admin/sub-admin:
 *   get:
 *     summary: Get all sub-admins (admin only)
 *     tags: [Admin Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sub-admins
 */
