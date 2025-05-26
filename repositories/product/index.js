const Category = require("../../models/categoryModel");
const Product = require("../../models/productsModel");
const mongoose = require("mongoose");
const Order = require("../../models/orderModel");
const { attachInventoryToProducts } = require("../../services/inventory");

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
  is_active,
}) => {
  const skip = (page - 1) * per_page;

  const filter = {};

  let serviceCategoryIds = [];

  if (service_id) {
    const services = Array.isArray(service_id)
      ? service_id
      : service_id.split(",");
    const serviceObjectIds = services
      .map((s) =>
        mongoose.isValidObjectId(s)
          ? mongoose.Types.ObjectId.createFromHexString(s)
          : null
      )
      .filter(Boolean);

    if (serviceObjectIds.length > 0) {
      const serviceCategories = await Category.find({
        service: { $in: serviceObjectIds },
      });
      serviceCategoryIds = serviceCategories.map((category) =>
        category._id.toString()
      );
    }
  }

  let finalCategoryIds = [
    ...new Set([
      ...(Array.isArray(category_id)
        ? category_id
        : [category_id].filter(Boolean)),
      ...serviceCategoryIds,
    ]),
  ];

  if (finalCategoryIds.length > 0) {
    filter.category = { $in: finalCategoryIds };
  }

  // if (Array.isArray(category_id) && category_id.length > 0) {
  //   filter.category = { $in: category_id };
  // } else if (category_id) {
  //   filter.category = category_id;
  // }

  if (is_best_seller) {
    filter.is_best_seller = is_best_seller;
  }

  if (is_active) {
    filter.is_active = is_active;
  }

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  if (price_range) {
    const priceRanges = Array.isArray(price_range)
      ? price_range
      : [price_range];

    let minPrice = Infinity;
    let maxPrice = -Infinity;

    priceRanges.forEach((range) => {
      if (typeof range === "string") {
        const prices = range.split("_").map(Number);

        if (prices.length === 2 && !isNaN(prices[0]) && !isNaN(prices[1])) {
          minPrice = Math.min(minPrice, prices[0]);
          maxPrice = Math.max(maxPrice, prices[1]);
        } else if (prices.length === 1 && !isNaN(prices[0])) {
          minPrice = Math.min(minPrice, prices[0]);
        }
      }
    });

    if (minPrice !== Infinity && maxPrice !== -Infinity) {
      filter.price = { $gte: minPrice, $lte: maxPrice };
    } else if (minPrice !== Infinity) {
      filter.price = { $gte: minPrice };
    }
  }

  if (start_date || end_date) {
    filter.createdAt = {};
    if (start_date) {
      filter.createdAt.$gte = new Date(start_date);
    }
    if (end_date) {
      filter.createdAt.$lte = new Date(end_date);
    }
  }

  // Super Selling Products
  let superSellingProductIds = [];
  if (is_super_selling) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product._id",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 50 },
      { $project: { _id: 1 } },
    ]);

    superSellingProductIds = result.map((item) => item._id.toString());

    if (superSellingProductIds.length === 0) {
      return { data: [], total: 0 };
    }

    filter._id = { $in: superSellingProductIds };
  }

  // Most Ordered Products
  let mostOrderedProductIds = [];
  if (is_most_ordered) {
    const result = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product._id",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      { $project: { _id: 1 } },
    ]);

    mostOrderedProductIds = result.map((item) => item._id.toString());

    if (mostOrderedProductIds.length === 0) {
      return { data: [], total: 0 };
    }

    if (filter._id) {
      // intersect with existing _id filter
      filter._id.$in = filter._id.$in.filter((id) =>
        mostOrderedProductIds.includes(id.toString())
      );
    } else {
      filter._id = { $in: mostOrderedProductIds };
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
    .limit(per_page)
    .populate(["medicine_type", "hsn_code"]);

  const total = await Product.countDocuments(filter);

  const productsWithInventory = await attachInventoryToProducts(products);
  return {
    data: productsWithInventory,
    total,
  };
};

const Inventory = require("../../models/inventoryModel");

const getProductById = async (id) => {
  const product = await Product.findById(id).populate([
    "medicine_type",
    "hsn_code",
  ]);
  if (!product) return null;

  const inventory = await Inventory.findOne({ product_id: product._id });
  const productObj = product.toJSON();

  productObj.inventory = inventory ? inventory.quantity : 0;

  return productObj;
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

const getProductsByAdmin = async ({ id, filters, page, per_page }) => {
  const skip = (page - 1) * per_page;
  const limit = parseInt(per_page);

  const query = { ...filters, created_by_admin: id };

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate(["medicine_type", "hsn_code"]),
    Product.countDocuments(query),
  ]);

  const productsWithInventory = await attachInventoryToProducts(products);

  return { products: productsWithInventory, total };
};

const bulkCreateProducts = async (productsData) => {
  try {
    if (!Array.isArray(productsData)) {
      throw new Error("Input must be an array of product data");
    }

    const createdProducts = await Product.insertMany(productsData, {
      ordered: false,
    });

    return createdProducts;
  } catch (error) {
    if (error.writeErrors) {
      const errors = error.writeErrors.map((err) => ({
        index: err.index,
        error: err.errmsg,
      }));
      throw new Error(
        `Bulk create failed for some products: ${JSON.stringify(errors)}`
      );
    } else {
      throw new Error(`Bulk create failed: ${error.message}`);
    }
  }
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
