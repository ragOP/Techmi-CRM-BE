const express = require("express");
const router = express.Router();
const couponController = require("../../controllers/coupon/index");
const { admin } = require("../../middleware/authMiddleware");

router.post("/", admin, couponController.createCoupon);
router.get("/:code/validate", admin, couponController.validateCoupon);
router.post("/:code/apply", admin, couponController.applyCoupon);
router.get("/", admin, couponController.getAllCoupons);
router.delete("/:code", admin, couponController.deleteCoupon);

module.exports = router;
