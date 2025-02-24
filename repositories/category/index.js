const Category = require("../../models/categoryModel");

const getAllCategory = async ({ service_id }) => {
  const filter = service_id ? { service: service_id } : {};
  return await Category.find(filter);
};

const getCategoryById = async (id) => {
  return await Category.findById(id);
};

const createCategory = async (data) => {
  return await Category.create(data);
};

const updateCategory = async (id, data) => {
  return await Category.findByIdAndUpdate(id, data, { new: true });
};

const deleteCategory = async (id) => {
  return await Category.findByIdAndDelete(id);
};

module.exports = {
  getAllCategory,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
