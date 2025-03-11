const express = require("express");
const {
  getAllAdmins,
  registerAdmin,
  updateAdmin,
  deleteAdmin,
  // logoutAdmin,
  loginAdmin,
} = require("../../../controllers/auth/admin/index");

const router = express.Router();

router.get("/", getAllAdmins);
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
// router.post("/logout", logoutAdmin);

// DEVELOPMENT API's
router.patch("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

module.exports = router;
