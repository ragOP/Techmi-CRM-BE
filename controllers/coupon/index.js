const { asyncHandler } = require("../../common/asyncHandler");
const Coupon = require("../../models/couponModel");
const ApiResponse = require("../../utils/ApiResponse");
const mongoose = require("mongoose");

const getAllCoupons = asyncHandler(async (req, res) => {
  const {
    page = 1,
    per_page = 50,
    search = "",
    showOnlyValid = false,
  } = req.query;

  const now = new Date();

  const query = {
    ...(search && { code: { $regex: search, $options: "i" } }),
    ...(showOnlyValid === "true" && {
      startDate: { $lte: now },
      endDate: { $gt: now },
    }),
  };

  const totalCoupons = await Coupon.countDocuments(query);
  const coupons = await Coupon.find(query)
    .skip((page - 1) * per_page)
    .limit(parseInt(per_page, 10))
    .sort({ createdAt: -1 });

  res.json(
    new ApiResponse(
      200,
      { data: coupons, total: totalCoupons },
      "Coupons fetched successfully",
      true
    )
  );
});

const getAdminCoupons = asyncHandler(async (req, res) => {
  const adminId = req.admin._id;
  const role = req.admin.role;

  const { page = 1, per_page = 50, search = "" } = req.query;

  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    return res.json(new ApiResponse(400, null, "Invalid admin ID", false));
  }

  const query = {
    ...(search && { code: { $regex: search, $options: "i" } }),
    ...(role !== "super_admin" && { created_by_admin: adminId }),
  };

  const totalCoupons = await Coupon.countDocuments(query);
  const coupons = await Coupon.find(query)
    .skip((page - 1) * per_page)
    .limit(parseInt(per_page, 10))
    .sort({ createdAt: -1 });

  res.json(
    new ApiResponse(
      200,
      { data: coupons, total: totalCoupons },
      "Coupons fetched successfully",
      true
    )
  );
});

// Delete coupon
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOneAndDelete({ _id: req.params.id });

  if (!coupon) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Coupon not found", false));
  }

  res.json(new ApiResponse(200, null, "Coupon deleted successfully", true));
});

// Create new coupon
const createCoupon = asyncHandler(async (req, res) => {
  const adminId = req.admin._id;

  if (!adminId) {
    return res.json(new ApiResponse(404, null, "Admin not found", false));
  }

  if (!req.body.code) {
    return res.status(400).json({ error: "Coupon code is required" });
  }
  if (!req.body.discountValue) {
    return res.status(400).json({ error: "Discount value is required" });
  }
  if (!req.body.discountType) {
    return res.status(400).json({ error: "Discount type is required" });
  }
  if (!req.body.startDate) {
    return res.status(400).json({ error: "Start date is required" });
  }
  if (!req.body.endDate) {
    return res.status(400).json({ error: "End date is required" });
  }

  if (req.body.code) {
    const existingCoupon = await Coupon.findOne({ code: req.body.code });
    if (existingCoupon) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Coupon code already exists", false));
    }
  }

  const updatedBody = {
    ...req.body,
    created_by_admin: adminId,
  };
  const coupon = new Coupon(updatedBody);
  await coupon.save();
  res
    .status(201)
    .json(new ApiResponse(201, coupon, "Coupon created successfully", true));
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
  const coupon = await Coupon.findOne({ _id: req.params.id });
  if (!coupon) return res.status(404).json({ error: "Coupon not found" });
  res.json(new ApiResponse(200, coupon, "Coupon fetched successfully", true));
});

const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOneAndUpdate(
    { _id: req.params.id },
    { ...req.body },
    { new: true }
  );
  if (!coupon) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Coupon not found", false));
  }
  res.json(new ApiResponse(200, coupon, "Coupon updated successfully", true));
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
  updateCoupon,
  getAdminCoupons,
};
