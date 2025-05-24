const express = require("express");
const TermsConditionController = require("../../controllers/terms_condition/index.js");
const {
  admin,
  adminOrSubAdmin,
  adminOrSuperAdmin,
} = require("../../middleware/auth/adminMiddleware.js");
const router = express.Router();

router.post(
  "/",
  adminOrSuperAdmin,
  TermsConditionController.createTermsCondition
);
router.get(
  "/",
  adminOrSuperAdmin,
  TermsConditionController.getLatestTermsCondition
);
router.put(
  "/:id",
  adminOrSuperAdmin,
  TermsConditionController.updateTermsCondition
);

module.exports = router;
