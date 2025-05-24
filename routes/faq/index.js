const express = require("express");
const FaqController = require("../../controllers/faq");
const {
  admin,
  adminOrSuperAdmin,
} = require("../../middleware/auth/adminMiddleware.js");
const router = express.Router();

router.get(
  "/",
  adminOrSuperAdmin,
  FaqController.getFaq
);
router.post(
  "/",
  adminOrSuperAdmin,
  FaqController.createFaq
);
router.put(
  "/:id",
  adminOrSuperAdmin,
  FaqController.updateFaq
);
router.delete(
    "/:id",
    adminOrSuperAdmin,
    FaqController.deleteFaq
)

module.exports = router;
