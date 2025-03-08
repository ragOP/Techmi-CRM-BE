const { asyncHandler } = require("../../common/asyncHandler");
const Coupon = require("../../models/couponModel");

const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find();
  res.json(coupons);
});

// Delete coupon
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOneAndDelete({ code: req.params.code });
  if (!coupon) return res.status(404).json({ error: "Coupon not found" });
  res.json({ message: "Coupon deleted successfully" });
  res.status(500).json({ error: error.message });
});

// Create new coupon
const createCoupon = asyncHandler(async (req, res) => {
  const coupon = new Coupon(req.body);
  await coupon.save();
  res.status(201).json(coupon);
});

// Validate coupon
const validateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({ code: req.params.code });
  if (!coupon) return res.status(404).json({ error: "Coupon not found" });

  const validation = await validateCouponRules(coupon);
  if (!validation.valid) return res.status(400).json(validation);

  res.json(validation);
});

// Apply coupon to order
const applyCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({ code: req.params.code });
  if (!coupon) return res.status(404).json({ error: "Coupon not found" });

  const validation = await validateCouponRules(coupon);
  if (!validation.valid) return res.status(400).json(validation);

  const { items } = req.body;
  const applicableItems = items.filter((item) =>
    isItemApplicable(item, coupon)
  );

  const subtotal = applicableItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = calculateDiscount(subtotal, coupon);

  res.json({
    valid: true,
    discountApplied: discount,
    finalAmount: subtotal - discount,
    couponDetails: coupon,
  });
});

// Get coupon by code
const getCouponByCode = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({ code: req.params.code });
  if (!coupon) return res.status(404).json({ error: "Coupon not found" });
  res.json(coupon);
});

// Helper functions
async function validateCouponRules(coupon) {
  const now = new Date();
  const response = { valid: true, message: "Coupon is valid" };

  if (!coupon.active) {
    response.valid = false;
    response.message = "Coupon is not active";
  } else if (now < coupon.startDate) {
    response.valid = false;
    response.message = "Coupon not yet available";
  } else if (now > coupon.endDate) {
    response.valid = false;
    response.message = "Coupon has expired";
  } else if (coupon.totalUseLimit && coupon.totalUseLimit <= 0) {
    response.valid = false;
    response.message = "Coupon usage limit reached";
  }

  return response;
}

function isItemApplicable(item, coupon) {
  const isInExcludedProducts = coupon.excludedProducts.includes(item.productId);
  const isInExcludedCategories = item.categoryIds.some((cat) =>
    coupon.excludedCategories.includes(cat)
  );

  if (isInExcludedProducts || isInExcludedCategories) return false;

  const hasApplicableProducts = coupon.applicableProducts.length > 0;
  const hasApplicableCategories = coupon.applicableCategories.length > 0;

  const matchesProduct = coupon.applicableProducts.includes(item.productId);
  const matchesCategory = item.categoryIds.some((cat) =>
    coupon.applicableCategories.includes(cat)
  );

  return (
    (!hasApplicableProducts && !hasApplicableCategories) ||
    matchesProduct ||
    matchesCategory
  );
}

function calculateDiscount(subtotal, coupon) {
  let discount = 0;

  if (coupon.discountType === "percentage") {
    discount = subtotal * (coupon.discountValue / 100);
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = Math.min(coupon.discountValue, subtotal);
  }

  return Number(discount.toFixed(2));
}

module.exports = {
  createCoupon,
  validateCoupon,
  applyCoupon,
  getAllCoupons,
  deleteCoupon,
  getCouponByCode,
};
