const mongoose = require("mongoose");
const ApiResponse = require("../../utils/ApiResponse.js");
const BrandService = require("../../services/brand/index.js");
const { asyncHandler } = require("../../common/asyncHandler.js");

const getAllBrands = asyncHandler(async (req, res) => {
  const { search, start_date, end_date } = req.query;
  const filters = {
    ...(search && {
      name: {
        $regex: search,
        $options: "i",
      },
    }),
    ...(start_date || end_date
      ? {
          createdAt: {
            ...(start_date && { $gte: new Date(start_date) }),
            ...(end_date && { $lte: new Date(end_date) }),
          },
        }
      : {}),
  };
  const { brands, total } = await BrandService.getAllBrandsWithCount({
    filters,
  });
  res.json(
    new ApiResponse(
      200,
      { data: brands, total },
      "Brands fetched successfully",
      true
    )
  );
});

const getBrandById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.json(new ApiResponse(400, null, "Invalid brand ID", false));
  }
  const brand = await BrandService.getBrandById(id);
  if (!brand) {
    return res.json(new ApiResponse(404, null, "Brand not found", false));
  }
  res.json(new ApiResponse(200, brand, "Brand fetched successfully", true));
});

const createBrand = asyncHandler(async (req, res) => {
  const adminId = req.admin?._id;
  const payload = {
    ...req.body,
    created_by_admin: adminId,
  };

  const brand = await BrandService.createBrand(payload);
  res
    .status(201)
    .json(new ApiResponse(201, brand, "Brand created successfully", true));
});

const updateBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.json(new ApiResponse(400, null, "Invalid brand ID", false));
  }
  const brand = await BrandService.updateBrand(id, req.body);
  if (!brand) {
    return res.json(new ApiResponse(404, null, "Brand not found", false));
  }
  res.json(new ApiResponse(200, brand, "Brand updated successfully", true));
});

const deleteBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.json(new ApiResponse(400, null, "Invalid brand ID", false));
  }
  const brand = await BrandService.deleteBrand(id);
  if (!brand) {
    return res.json(new ApiResponse(404, null, "Brand not found", false));
  }
  res.json(new ApiResponse(200, null, "Brand deleted successfully", true));
});

module.exports = {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
};
