/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input data
 *
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     description: Authenticates a user and returns an access token.
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
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh authentication token
 *     description: Refreshes the access token using a refresh token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       403:
 *         description: Invalid or expired refresh token
 *
 * /api/auth/logout:
 *   post:
 *     summary: Logout a user
 *     description: Logs out the user by invalidating the refresh token.
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized request
 */

const express = require("express");
const {
  registerUser,
  userLogin,
  refreshToken,
  logoutUser,
  getAllUsers,
  adminLogin,
  superAdminLogin,
  getAllAdmins,
  updateUser,
  deleteUser,
} = require("../../controllers/authController");
const { superAdmin } = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/", getAllUsers);
router.get("/admins", superAdmin, getAllAdmins);
router.post("/register", registerUser);
router.post("/login", userLogin);
router.post("/admin-login", adminLogin);
router.post("/super-admin-login", superAdminLogin);
router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
