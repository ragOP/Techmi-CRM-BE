const ProductsRepository = require("../../repositories/product/index.js");

const getAllProducts = async ({
  page,
  per_page,
  category_id,
  is_best_seller,
  search
}) => {
  return await ProductsRepository.getAllProducts({
    page,
    per_page,
    category_id,
    is_best_seller,
    search
  });
};

const getProductById = async (id) => {
  return await ProductsRepository.getProductById(id);
};

const createProduct = async (data) => {
  return await ProductsRepository.createProduct(data);
};

const updateProduct = async (id, data) => {
  return await ProductsRepository.updateProduct(id, data);
};

const deleteProduct = async (id) => {
  return await ProductsRepository.deleteProduct(id);
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
