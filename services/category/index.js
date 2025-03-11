const CategoryRepository = require("../../repositories/category/index.js");

const getAllCategory = async ({ service_id, page, per_page, search, sort }) => {
  const skip = (page - 1) * per_page;
  const limit = parseInt(per_page, 10);
  const sortOrder = sort === "latest" ? { createdAt: -1 } : { createdAt: 1 };

  const categories = await CategoryRepository.getAllCategory({
    service_id,
    search,
    sortOrder,
    skip,
    limit,
  });

  const total = await CategoryRepository.countAllCategories({
    service_id,
    search,
  });

  return {
    total,
    page,
    per_page,
    total_pages: Math.ceil(total / per_page),
    categories,
  };
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
