const Product = require("../../models/productsModel");

const getAllProducts = async ({
  page,
  per_page,
  category_id,
  is_best_seller,
  search,
}) => {
  const skip = (page - 1) * per_page;

  const filter = {};
  if (category_id) {
    filter.category_id = category_id;
  }

  if (is_best_seller) {
    filter.is_best_seller = is_best_seller;
  }

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const products = await Product.find(filter).skip(skip).limit(per_page);

  const total = await Product.countDocuments(filter);

  return {
    data: products,
    total,
  };
};

const getProductById = async (id) => {
  return await Product.findById(id);
};

const createProduct = async (data) => {
  return await Product.create(data);
};

const updateProduct = async (id, data) => {
  return await Product.findByIdAndUpdate(id, data, { new: true });
};

const deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
