const fs = require("fs").promises;
const os = require("os");
const path = require("path");
const { asyncHandler } = require("../../common/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const mongoose = require("mongoose");
const Cart = require("../../models/cartModel");
const Address = require("../../models/addressModel");
const Product = require("../../models/productsModel");
const Order = require("../../models/orderModel");
const Coupon = require("../../models/couponModel");
const Category = require("../../models/categoryModel");
const Services = require("../../models/servicesModel");
const { uploadPDF } = require("../../utils/upload");
const { convertToXLSX } = require("../../helpers/products/convertToXSLV");
const { convertToCSV } = require("../../helpers/products/convertToCSV");
const Transaction = require("../../models/transactionModel");
const Inventory = require("../../models/inventoryModel");

const getAllOrders = asyncHandler(async (req, res) => {
  const adminId = req.admin._id;
  if (!adminId) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Unauthorized", false));
  }

  const {
    service_id,
    page = 1,
    per_page = 50,
    search = "",
    start_date,
    end_date,
  } = req.query;

  try {
    let query = {};

    if (service_id) {
      if (!mongoose.Types.ObjectId.isValid(service_id)) {
        return res
          .status(400)
          .json(new ApiResponse(400, null, "Invalid service_id format", false));
      }

      const serviceObjectId = new mongoose.Types.ObjectId(service_id);

      const categoryIds = await Category.find({
        service: serviceObjectId,
      }).distinct("_id");

      if (categoryIds.length === 0) {
        return res
          .status(404)
          .json(
            new ApiResponse(
              404,
              null,
              "No categories found for this service",
              false
            )
          );
      }

      const productIds = await Product.find({
        category: { $in: categoryIds },
      }).distinct("_id");

      if (productIds.length === 0) {
        return res
          .status(404)
          .json(
            new ApiResponse(
              404,
              null,
              "No products found in these categories",
              false
            )
          );
      }

      query["items.product._id"] = { $in: productIds };
    }

    // Search filter
    if (search.trim()) {
      const productIdsByName = await Product.find({
        name: { $regex: search, $options: "i" },
      }).distinct("_id");

      query["$or"] = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { "items.product._id": { $in: productIdsByName } },
      ];
    }

    // Date filter
    if (start_date || end_date) {
      query.createdAt = {};
      if (start_date) query.createdAt.$gte = new Date(start_date);
      if (end_date) query.createdAt.$lte = new Date(end_date);
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * per_page)
        .limit(parseInt(per_page, 10)),
      Order.countDocuments(query),
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { data: orders, total },
          "Orders fetched successfully",
          true
        )
      );
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Server error", false));
  }
});

const getChange = (current, previous) => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
};

const getOrderOverview = asyncHandler(async (req, res) => {
  const { start_date, end_date, service_id, compare = "last_week" } = req.query;

  let serviceCategoryIds = [];

  if (service_id) {
    const categories = await Category.find({ service: service_id }, "_id");
    serviceCategoryIds = categories.map((cat) => cat._id.toString());

    if (serviceCategoryIds.length === 0) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            null,
            "No categories found for this service",
            false
          )
        );
    }
  }

  console.log("serviceCategoryIds", serviceCategoryIds);

  const orderFilter = {};

  if (start_date && end_date) {
    orderFilter.createdAt = {
      $gte: new Date(start_date),
      $lte: new Date(end_date),
    };
  }

  const orders = await Order.find(orderFilter).populate({
    path: "items.product",
    populate: {
      path: "category",
      select: "_id",
    },
  });

  // Step 3: Compute current stats
  let currentStats = {
    totalRevenue: 0,
    totalOrders: 0,
    totalDelivered: 0,
  };

  for (const order of orders) {
    let includeOrder = false;

    for (const item of order.items) {
      const product = item.product;

      if (!product || !product.category) continue;

      const matchesCategory = serviceCategoryIds.includes(
        product.category?.[0]?._id?.toString?.()
      );
      if (matchesCategory) {
        includeOrder = true;
        break;
      }
    }

    if (!includeOrder) continue;

    currentStats.totalRevenue += parseFloat(order.totalAmount || 0);
    currentStats.totalOrders += 1;

    if (order.status === "delivered") {
      currentStats.totalDelivered += 1;
    }
  }

  let prevStats = {
    totalRevenue: 0,
    totalOrders: 0,
    totalDelivered: 0,
  };

  if (compare === "last_week") {
    const now = new Date();
    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(now.getDate() - 14);
    const lastWeekEnd = new Date(now);
    lastWeekEnd.setDate(now.getDate() - 7);

    const prevFilter = {
      createdAt: {
        $gte: lastWeekStart,
        $lte: lastWeekEnd,
      },
    };

    const prevOrders = await Order.find(prevFilter).populate({
      path: "items.product",
      populate: {
        path: "category",
        select: "_id",
      },
    });

    for (const order of prevOrders) {
      let includeOrder = false;

      for (const item of order.items) {
        const product = item.product;

        if (!product || !product.category) continue;

        let productCategoryIds = [];

        if (Array.isArray(product.category)) {
          productCategoryIds = product.category.map((cat) =>
            cat._id?.toString?.()
          );
        } else if (product.category?._id) {
          productCategoryIds = [product.category._id.toString()];
        }

        const matchesCategory =
          serviceCategoryIds.length === 0 ||
          productCategoryIds.some((catId) =>
            serviceCategoryIds.includes(catId)
          );

        if (matchesCategory) {
          includeOrder = true;
          break;
        }
      }

      if (!includeOrder) continue;

      prevStats.totalRevenue += parseFloat(order.totalAmount || 0);
      prevStats.totalOrders += 1;

      if (order.status === "delivered") {
        prevStats.totalDelivered += 1;
      }
    }
  }

  // Step 5: Build overview object
  const overview = {
    totalRevenue: {
      label: "Total Revenue",
      value: currentStats.totalRevenue,
      changes: getChange(currentStats.totalRevenue, prevStats.totalRevenue),
    },
    totalOrders: {
      label: "Total Orders",
      value: currentStats.totalOrders,
      changes: getChange(currentStats.totalOrders, prevStats.totalOrders),
    },
    totalDelivered: {
      label: "Delivered Orders",
      value: currentStats.totalDelivered,
      changes: getChange(currentStats.totalDelivered, prevStats.totalDelivered),
    },
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { overview },
        "Order overview fetched successfully",
        true
      )
    );
});

const validateId = (id, name) => {
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${name} ID`);
  }
};

const createOrder = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const role = req.user.role;

    const { cartId, addressId, couponId, orderId, orderedBy, orderedForUser } =
      req.body;
    const userId = req.user._id;

    const currentUserId = orderedBy ? orderedForUser : userId;
    // Validate input IDs

    validateId(cartId, "cart");
    validateId(addressId, "address");
    validateId(couponId, "coupon");
    validateId(userId, "userId");

    if (orderedBy) {
      validateId(orderedBy, "orderedBy");
    }

    if (orderedForUser) {
      validateId(orderedForUser, "orderedForUser");
    }

    // Fetch and validate coupon
    let coupon = null;
    if (couponId) {
      coupon = await Coupon.findById(couponId).session(session);
      if (!coupon) throw new Error("Coupon not found");

      const now = new Date();
      if (!coupon.active) throw new Error("Coupon is inactive");
      if (now < coupon.startDate) throw new Error("Coupon not yet valid");
      if (now > coupon.endDate) throw new Error("Coupon expired");
      if (coupon.totalUseLimit !== null && coupon.totalUseLimit <= 0) {
        throw new Error("Coupon usage limit reached");
      }
    }

    // Validate cart
    const cart = await Cart.findOne({ _id: cartId, user: userId }).session(
      session
    );
    if (!cart) throw new Error("Cart not found");
    if (cart.items.length === 0) throw new Error("Cart is empty");

    // Validate address
    let address;

    if (orderedBy) {
      address = await Address.findOne({
        user: orderedForUser,
        isPrimary: true,
      }).session(session);

      if (!address) {
        throw new Error("No primary address found for the ordered user");
      }
    } else {
      address = await Address.findOne({
        _id: addressId,
        user: userId,
      }).session(session);
    }

    if (!address) throw new Error("Address not found");

    // Process cart items
    let totalAmount = 0;
    let discountedPrice = 0;
    const orderItems = [];

    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.product).session(session);
      if (!product) throw new Error(`Product ${cartItem.product} not found`);
      // if (!product.instock) throw new Error(`${product.name} is out of stock`);

      const inventory = await Inventory.findOne({
        product_id: product._id,
      }).session(session);
      if (!inventory || inventory.quantity < cartItem.quantity) {
        throw new Error(
          `${product.name} does not have enough stock. Available: ${
            inventory ? inventory.quantity : 0
          }`
        );
      }

      inventory.quantity -= cartItem.quantity;
      await inventory.save({ session });

      let currentPrice;

      if (role === "salesperson") {
        currentPrice =
          product.salesperson_discounted_price !== null
            ? product.salesperson_discounted_price
            : product.discounted_price !== null
            ? product.discounted_price
            : product.price;
      } else if (role === "dnd") {
        currentPrice =
          product.dnd_discounted_price !== null
            ? product.dnd_discounted_price
            : product.discounted_price !== null
            ? product.discounted_price
            : product.price;
      } else {
        currentPrice =
          product.discounted_price !== null
            ? product.discounted_price
            : product.price;
      }

      const withoutDiscountPrice =
        parseFloat(product.price.toString()) * cartItem.quantity;
      totalAmount += withoutDiscountPrice;

      const itemTotal = parseFloat(currentPrice.toString()) * cartItem.quantity;
      discountedPrice += itemTotal;

      orderItems.push({
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          discounted_price: product.discounted_price,
          salesperson_discounted_price: product.salesperson_discounted_price,
          dnd_discounted_price: product.dnd_discounted_price,
          banner_image: product.banner_image,
        },
        quantity: cartItem.quantity,
        priceAtOrder: currentPrice,
      });
    }

    // Apply coupon discount
    let couponDiscountAmount = 0;
    let couponDetails = null;

    if (coupon) {
      if (coupon.userUseLimit && userUsage >= coupon.userUseLimit) {
        throw new Error("Coupon usage limit exceeded for user");
      }

      // Calculate discount
      if (coupon.discountType === "percentage") {
        couponDiscountAmount = discountedPrice * (coupon.discountValue / 100);
        if (coupon.maxDiscount) {
          couponDiscountAmount = Math.min(
            couponDiscountAmount,
            coupon.maxDiscount
          );
        }
      } else {
        couponDiscountAmount = Math.min(coupon.discountValue, discountedPrice);
      }

      // Update coupon usage
      if (coupon.totalUseLimit !== null) {
        await Coupon.findByIdAndUpdate(
          coupon._id,
          { $inc: { totalUseLimit: -1 } },
          { session }
        );
      }

      // Create coupon usage record
      couponDetails = {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: couponDiscountAmount,
      };
    }

    // Create address snapshot
    const addressSnapshot = { ...address.toObject() };
    delete addressSnapshot._id;
    delete addressSnapshot.user;
    delete addressSnapshot.createdAt;
    delete addressSnapshot.updatedAt;
    delete addressSnapshot.__v;

    // Create order
    const order = new Order({
      user: orderedForUser ? orderedForUser : userId,
      items: orderItems,
      address: addressSnapshot,
      totalAmount: totalAmount,
      discountedPrice: discountedPrice,
      discountedPriceAfterCoupon: discountedPrice - couponDiscountAmount,
      coupon: couponDetails,
      orderedBy: userId,
      couponId: couponId,
      cashfree_order: {
        id: orderId,
      },
    });

    // Save order and clear cart
    await order.save({ session });
    await Transaction.create(
      [
        {
          order: order._id,
          user: order.user,
          type: "payment",
          amount: order.discountedPriceAfterCoupon,
          payment_method: "cashfree",
          status: "success",
          transaction_id: order.cashfree_order?.id || null,
        },
      ],
      { session }
    );

    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();

    return res
      .status(201)
      .json(new ApiResponse(201, order, "Order created successfully", true));
  } catch (error) {
    await session.abortTransaction();
    return res
      .status(400)
      .json(new ApiResponse(400, null, error.message, false));
  } finally {
    session.endSession();
  }
});

const getOrderHistory = asyncHandler(async (req, res) => {
  try {
    if (!req.user._id) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Unauthorized", false));
    }

    let orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    orders = orders.filter((order) => order && typeof order === "object");

    return res
      .status(200)
      .json(new ApiResponse(200, orders, "Orders fetched successfully", true));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, error.message, false));
  }
});

const updateOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const adminId = req.admin._id;

  if (!adminId) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Unauthorized", false));
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid order ID", false));
  }

  const order = await Order.findById(id);

  if (!order) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Order not found", false));
  }

  const { status } = req.body;

  if (!status) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Status is required", false));
  }

  const ORDER_STATUSES = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (!ORDER_STATUSES.includes(status)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid status", false));
  }

  order.status = status;
  await order.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, order, "Order status updated successfully", true)
    );
});

const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const adminId = req.admin._id;

  if (!adminId) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Unauthorized", false));
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid order ID", false));
  }

  const order = await Order.findById(id);

  if (!order) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Order not found", false));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order fetched successfully", true));
});

const exportOrders = asyncHandler(async (req, res) => {
  const adminId = req.admin._id;
  if (!adminId) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Unauthorized", false));
  }

  const {
    service_id,
    search = "",
    start_date,
    end_date,
    fileType = "xlsx",
  } = req.query;

  try {
    let query = {};

    if (service_id) {
      if (!mongoose.Types.ObjectId.isValid(service_id)) {
        return res
          .status(400)
          .json(new ApiResponse(400, null, "Invalid service_id format", false));
      }

      const serviceObjectId = new mongoose.Types.ObjectId(service_id);

      const categoryIds = await Category.find({
        service: serviceObjectId,
      }).distinct("_id");

      if (categoryIds.length === 0) {
        return res
          .status(404)
          .json(
            new ApiResponse(
              404,
              null,
              "No categories found for this service",
              false
            )
          );
      }

      const productIds = await Product.find({
        category: { $in: categoryIds },
      }).distinct("_id");

      if (productIds.length === 0) {
        return res
          .status(404)
          .json(
            new ApiResponse(
              404,
              null,
              "No products found in these categories",
              false
            )
          );
      }

      query["items.product"] = { $in: productIds };
    }

    // Search filter
    if (search.trim()) {
      const productIdsByName = await Product.find({
        name: { $regex: search, $options: "i" },
      }).distinct("_id");

      query["$or"] = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { "items.product": { $in: productIdsByName } },
      ];
    }

    // Date filter
    if (start_date || end_date) {
      query.createdAt = {};
      if (start_date) query.createdAt.$gte = new Date(start_date);
      if (end_date) query.createdAt.$lte = new Date(end_date);
    }

    // Populate the necessary fields
    const orders = await Order.find(query)
      .populate("items.product")
      .populate("customer")
      .sort({ createdAt: -1 })
      .lean();

    const serializedOrders = orders.map((order) => {
      return {
        id: order._id?.toString() || "",
        orderNumber: order.orderNumber || "",
        customerName: order.customer?.name || "",
        customerEmail: order.customer?.email || "",
        customerPhone: order.customer?.phone || "",
        items: (order.items || []).map((item) => ({
          productName: item.product?.name || "N/A",
          quantity: item.quantity || 0,
          price: item.price || 0,
        })),
        totalAmount: order.totalAmount || 0,
        status: order.status || "",
        paymentStatus: order.paymentStatus || "",
        createdAt: order.createdAt
          ? new Date(order.createdAt).toISOString()
          : "",
        updatedAt: order.updatedAt
          ? new Date(order.updatedAt).toISOString()
          : "",
      };
    });

    let buffer;
    let mimeType = "";
    let filename = `orders_${Date.now()}.${fileType}`;

    if (fileType.toLowerCase() === "csv") {
      // Flatten the items array for CSV export
      const flattenedOrders = serializedOrders.map((order) => {
        const flatOrder = {
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          totalAmount: order.totalAmount,
          status: order.status,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          products: order.items.map((item) => item.productName).join(", "),
          quantities: order.items.map((item) => item.quantity).join(", "),
          prices: order.items.map((item) => item.price).join(", "),
        };
        return flatOrder;
      });

      const content = convertToCSV(flattenedOrders);
      buffer = Buffer.from(content, "utf-8");
      mimeType = "text/csv";
    } else if (fileType.toLowerCase() === "xlsx") {
      buffer = convertToXLSX(serializedOrders);
      mimeType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    } else {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Unsupported file type", false));
    }

    // Write buffer to a temp file
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, filename);
    await fs.writeFile(tempFilePath, buffer);

    // Upload to Cloudinary
    const url = await uploadPDF(tempFilePath, "exports");

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          url,
          mimeType,
          filename,
          total: orders.length,
        },
        "Orders exported and uploaded successfully",
        true
      )
    );
  } catch (error) {
    console.error("Error exporting orders:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Server error", false));
  }
});
module.exports = {
  createOrder,
  getOrderHistory,
  getAllOrders,
  updateOrder,
  getOrderById,
  getOrderOverview,
  exportOrders,
};
