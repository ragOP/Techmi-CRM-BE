const ProductsRepository = require("../../repositories/product/index.js");

const getAllProducts = async ({
  page,
  per_page,
  service_id,
  category_id,
  is_best_seller,
  search,
  price_range,
  sort_by,
}) => {
  return await ProductsRepository.getAllProducts({
    page,
    per_page,
    category_id,
    service_id,
    is_best_seller,
    search,
    price_range,
    sort_by,
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
