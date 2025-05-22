const express = require("express");
const {
  getAllUsers,
  registerUser,
  updateUser,
  deleteUser,
  loginUser,
  getUserById,
  getUsersByRole,
  exportUsers,
  forgotPassword,
  resetPassword,
} = require("../../../controllers/auth/user/index");
const { user } = require("../../../middleware/auth/userMiddleware");
const {
  superAdmin,
  adminOrSuperAdmin,
} = require("../../../middleware/auth/adminMiddleware");
const router = express.Router();

router.get("/", adminOrSuperAdmin, getAllUsers);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/role", user, getUsersByRole);
router.get("/export", superAdmin, exportUsers);
router.get("/:id", getUserById);
router.patch("/:id", adminOrSuperAdmin, updateUser);
router.delete("/:id", adminOrSuperAdmin, deleteUser);

module.exports = router;
