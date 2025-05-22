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
  exportAdmins,
  getAdminById,
  forgotPassword,
  resetPassword,
} = require("../../../controllers/auth/admin/index");
const {
  admin,
  superAdmin,
  adminOrSuperAdmin,
  adminOrSubAdminOrSuperAdmin,
  authenticateRoleWithoutToken,
} = require("../../../middleware/auth/adminMiddleware");

const router = express.Router();

router.get("/", superAdmin, getAllAdmins);
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/sub-admin", admin, getAllSubAdmins);
router.post("/sub-admin", admin, registerSubAdmin);
router.post("/forgot-password", authenticateRoleWithoutToken, forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/export", superAdmin, exportAdmins);
router.get("/:id", superAdmin, getAdminById);
router.patch("/:id", adminOrSuperAdmin, updateAdmin);
router.delete("/:id", adminOrSuperAdmin, deleteAdmin);
// router.post("/logout", logoutAdmin);

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
