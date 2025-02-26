const Product = require("../../models/productsModel");

const getAllProducts = async ({
  page,
  per_page,
  category_id,
  is_best_seller,
  search,
  price_range,
  sort_by,
}) => {
  const skip = (page - 1) * per_page;

  const filter = {};

  if (Array.isArray(category_id) && category_id.length > 0) {
    filter.category = { $in: category_id };
  } else if (category_id) {
    filter.category = category_id;
  }

  if (is_best_seller) {
    filter.is_best_seller = is_best_seller;
  }

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  if (price_range) {
    const prices = price_range.split("_").map(Number);

    if (prices.length === 2 && !isNaN(prices[0]) && !isNaN(prices[1])) {
      filter.price = { $gte: prices[0], $lte: prices[1] };
    } else if (prices.length === 1 && !isNaN(prices[0])) {
      filter.price = { $gte: prices[0] };
    }
  }

  let sortOptions = {};
  if (sort_by === "asc") {
    sortOptions = { price: 1 };
  } else if (sort_by === "dec") {
    sortOptions = { price: -1 };
  } else {
    sortOptions = { createdAt: -1 };
  }

  const products = await Product.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(per_page);

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
