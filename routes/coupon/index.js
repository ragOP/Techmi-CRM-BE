const express = require("express");
const router = express.Router();
const couponController = require("../../controllers/coupon/index");
const {
  admin,
  superAdmin,
  adminOrSuperAdmin,
} = require("../../middleware/auth/adminMiddleware");

router.post("/", adminOrSuperAdmin, couponController.createCoupon);
router.get("/:code/validate", admin, couponController.validateCoupon);
router.get("/:code", admin, couponController.getCouponByCode);
router.post("/:code/apply", admin, couponController.applyCoupon);
router.get("/", couponController.getAllCoupons);
router.delete("/:code", admin, couponController.deleteCoupon);

module.exports = router;
