const express = require("express");
const PrivacyPolicyController = require("../../controllers/privacy_policy");
const {
  admin,
  adminOrSuperAdmin,
} = require("../../middleware/auth/adminMiddleware.js");
const router = express.Router();

router.post(
  "/",
  adminOrSuperAdmin,
  PrivacyPolicyController.createPrivacyPolicy
);
router.get(
  "/users",
  PrivacyPolicyController.getLatestPrivacyPolicy
);
router.get(
  "/",
  adminOrSuperAdmin,
  PrivacyPolicyController.getLatestPrivacyPolicy
);
router.put(
  "/:id",
  adminOrSuperAdmin,
  PrivacyPolicyController.updatePrivacyPolicy
);

module.exports = router;
