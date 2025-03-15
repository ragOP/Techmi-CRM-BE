const { default: mongoose } = require("mongoose");
const Category = require("../../models/categoryModel.js");
const ProductsRepository = require("../../repositories/product/index.js");
const Product = require("../../models/productsModel.js");

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

const getProductsByAdmin = async (id) => {
  return await ProductsRepository.getProductsByAdmin(id);
};

const bulkCreateProducts = async (products, adminId) => {
  const results = {
    success: [],
    failed: [],
  };

  const validProducts = [];

  for (const [index, productData] of products.entries()) {
    try {
      if (!productData.name || !productData.price || !productData.category) {
        throw new Error("Missing required fields (name, price, or category)");
      }

      const isValidCategory = await Category.exists({
        _id: { $in: productData.category },
      });

      if (!isValidCategory) {
        throw new Error("Invalid category ID(s)");
      }

      const existingProduct = await Product.findOne({
        name: productData.name,
        category: productData.category,
      });

      if (existingProduct) {
        throw new Error(
          "Duplicate product: Product with the same name and category already exists."
        );
      }

      const priceFields = [
        "price",
        "discounted_price",
        "salesperson_discounted_price",
        "dnd_discounted_price",
      ];

      const processedProduct = { ...productData };
      for (const field of priceFields) {
        if (processedProduct[field]) {
          processedProduct[field] = mongoose.Types.Decimal128.fromString(
            processedProduct[field].toString()
          );
        }
      }

      if (
        processedProduct.discounted_price &&
        parseFloat(processedProduct.discounted_price.toString()) >
          parseFloat(processedProduct.price.toString())
      ) {
        throw new Error("Discounted price cannot be higher than regular price");
      }

      validProducts.push({
        ...processedProduct,
        created_by_admin: adminId,
      });

      results.success.push({
        index,
        name: productData.name,
      });
    } catch (error) {
      results.failed.push({
        index,
        name: productData.name || "Unnamed Product",
        error: error.message,
      });
    }
  }

  if (validProducts.length > 0) {
    try {
      const insertedProducts = await ProductsRepository.bulkCreateProducts(
        validProducts
      );
      results.success = insertedProducts.map((product, i) => ({
        index: i,
        _id: product._id,
        name: product.name,
      }));
    } catch (error) {
      results.failed.push({ error: error.message });
    }
  }

  return results;
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByAdmin,
  bulkCreateProducts,
};
