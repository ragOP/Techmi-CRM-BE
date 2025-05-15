const express = require("express");
const DashboardController = require("../../controllers/dashboard/index.js");
const {
  adminOrSuperAdmin,
} = require("../../middleware/auth/adminMiddleware.js");

const router = express.Router();

router.get("/", adminOrSuperAdmin, DashboardController.getDashboardData);

module.exports = router;
