const CategoryRepository = require("../../repositories/category/index.js");

const getAllCategory = async ({ service_id }) => {
  return await CategoryRepository.getAllCategory({ service_id });
};

const getCategoryById = async (id) => {
  return await CategoryRepository.getCategoryById(id);
};

const createCategory = async (data) => {
  return await CategoryRepository.createCategory(data);
};

const updateCategory = async (id, data) => {
  return await CategoryRepository.updateCategory(id, data);
};

const deleteCategory = async (id) => {
  return await CategoryRepository.deleteCategory(id);
};

module.exports = {
  getAllCategory,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
