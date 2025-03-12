const express = require("express");
const {
  getAllUsers,
  registerUser,
  updateUser,
  deleteUser,
  loginUser,
  getUserById,
  getUsersByRole,
  // logoutUser,
} = require("../../../controllers/auth/user/index");
const { user } = require("../../../middleware/auth/userMiddleware");
const router = express.Router();

router.get("/", getAllUsers);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/role", user, getUsersByRole);
router.get("/:id", getUserById);

// router.post("/logout", logoutUser);

// DEVELOPMENT API's
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
