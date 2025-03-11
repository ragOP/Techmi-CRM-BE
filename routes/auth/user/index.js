const express = require("express");
const {
  getAllUsers,
  registerUser,
  updateUser,
  deleteUser,
  loginUser,
  getUserById,
  // logoutUser,
} = require("../../../controllers/auth/user/index");

const router = express.Router();

router.get("/", getAllUsers);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/:id", getUserById);
// router.post("/logout", logoutUser);

// DEVELOPMENT API's
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
