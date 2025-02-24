const { asyncHandler } = require("../../common/asyncHandler.js");
const ApiResponse = require("../../utils/ApiResponse.js");
const CategoryService = require("../../services/category/index.js");
const mongoose = require("mongoose");
const { uploadMultipleFiles } = require("../../utils/upload/index.js");

const getAllCategory = asyncHandler(async (req, res) => {
  const { service_id } = req.query;

  const categories = await CategoryService.getAllCategory({ service_id });

  const result = {
    total: categories.length,
    categories,
  };
  res.json(
    new ApiResponse(200, result, "Categories fetched successfully", true)
  );
});

const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.json(new ApiResponse(400, null, "Invalid category ID", false));
  }

  const category = await CategoryService.getCategoryById(id);
  if (!category) {
    return res.json(new ApiResponse(404, null, "Category not found", false));
  }

  res.json(
    new ApiResponse(200, category, "Category fetched successfully", true)
  );
});

const createCategory = asyncHandler(async (req, res) => {
  const images = req.files;
  if (!images) {
    return res.json(new ApiResponse(404, null, "No Image Found", false));
  }
  const imageUrls = await uploadMultipleFiles(images, "uploads/images");

  let categoryData = { ...req.body, images: imageUrls };

  if (categoryData?.meta_data) {
    categoryData.meta_data = JSON.parse(categoryData.meta_data);
  }

  const category = await CategoryService.createCategory(categoryData);
  res.json(
    new ApiResponse(201, category, "Category created successfully", true)
  );
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await CategoryService.updateCategory(
    req.params.id,
    req.body
  );
  if (!category) {
    return res.json(new ApiResponse(404, null, "Category not found", false));
  }

  res.json(
    new ApiResponse(200, category, "Category updated successfully", true)
  );
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await CategoryService.deleteCategory(req.params.id);
  if (!category) {
    return res.json(new ApiResponse(404, null, "Category not found", false));
  }

  res.json(new ApiResponse(200, null, "Category deleted successfully", true));
});

module.exports = {
  getAllCategory,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
