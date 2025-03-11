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
const { admin } = require("../../../middleware/auth/adminMiddleware");

const router = express.Router();

router.get("/", getAllAdmins);
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/sub-admin", admin, getAllSubAdmins);
router.post("/sub-admin", admin, registerSubAdmin);
// router.post("/logout", logoutAdmin);

// DEVELOPMENT API's
router.patch("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

module.exports = router;
