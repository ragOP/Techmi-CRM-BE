const { default: mongoose } = require("mongoose");
const Category = require("../../models/categoryModel.js");
const ProductsRepository = require("../../repositories/product/index.js");
const Product = require("../../models/productsModel.js");
const InventoryService = require("../inventory/index.js");

const getAllProducts = async ({
  page,
  per_page,
  service_id,
  category_id,
  is_best_seller,
  is_super_selling,
  is_most_ordered,
  search,
  price_range,
  sort_by,
  start_date,
  end_date,
}) => {
  return await ProductsRepository.getAllProducts({
    page,
    per_page,
    category_id,
    service_id,
    is_best_seller,
    is_super_selling,
    is_most_ordered,
    search,
    price_range,
    sort_by,
    start_date,
    end_date,
  });
};

const getProductById = async (id) => {
  return await ProductsRepository.getProductById(id);
};

const createProduct = async (data, adminId) => {
  const { quantity, ...productData } = data;
  const product = await ProductsRepository.createProduct(productData);

  await InventoryService.createInventory({
    product_id: product._id,
    quantity: quantity || 0,
    last_modified_by: adminId,
    last_modified_reason: "Initial stock on product creation",
    last_restocked_at: new Date(),
    low_stock_threshold: 5,
  });

  return product;
};

const updateProduct = async (id, data, adminId) => {
  const { quantity, ...productData } = data;

  const product = await ProductsRepository.updateProduct(id, productData);

  if (quantity !== undefined) {
    const inventory = await InventoryService.getInventoryByProductId(id);

    if (inventory) {
      await InventoryService.updateInventory(inventory._id, {
        quantity: Number(inventory.quantity) + Number(quantity),
        last_modified_by: adminId,
        last_modified_reason: "Stock updated on product update",
      });
    } else {
      await InventoryService.createInventory({
        product_id: product._id,
        quantity: quantity,
        last_modified_by: adminId,
        last_modified_reason: "Stock created on product update",
        last_restocked_at: new Date(),
        low_stock_threshold: 5,
      });
    }
  }

  return product;
};

const deleteProduct = async (id) => {
  await ProductsRepository.deleteProduct(id);
};

const getProductsByAdmin = async ({
  id,
  page,
  per_page,
  search,
  start_date,
  end_date,
}) => {
  const filters = {
    ...(search && { name: { $regex: search, $options: "i" } }),
    ...((start_date || end_date) && {
      createdAt: {
        ...(start_date && { $gte: new Date(start_date) }),
        ...(end_date && { $lte: new Date(end_date) }),
      },
    }),
  };

  return await ProductsRepository.getProductsByAdmin({
    id,
    filters,
    page,
    per_page,
  });
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
