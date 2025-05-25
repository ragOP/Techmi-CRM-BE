const express = require("express");
const DashboardController = require("../../controllers/dashboard/index.js");
const {
  adminOrSuperAdmin,
} = require("../../middleware/auth/adminMiddleware.js");

const router = express.Router();

router.get(
  "/overview",
  adminOrSuperAdmin,
  DashboardController.getDashboardOverview
);

router.get(
  "/export",
  adminOrSuperAdmin,
  DashboardController.exportDashboardData
);

router.get(
  "/sales-overview",
  adminOrSuperAdmin,
  DashboardController.getSalesOverviewByMonth
);

router.get(
  "/sales-and-orders",
  adminOrSuperAdmin,
  DashboardController.getSalesAndOrdersByDateRange
);

module.exports = router;
