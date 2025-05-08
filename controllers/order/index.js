const { asyncHandler } = require("../../common/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const mongoose = require("mongoose");
const Cart = require("../../models/cartModel");
const Address = require("../../models/addressModel");
const Product = require("../../models/productsModel");
const Order = require("../../models/orderModel");
const Coupon = require("../../models/couponModel");
const Category = require("../../models/categoryModel");

const getAllOrders = asyncHandler(async (req, res) => {
  const adminId = req.admin._id;
  if (!adminId) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Unauthorized", false));
  }

  const { service_id, page = 1, per_page = 50, search = "" } = req.query;

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
      console.log("Category IDs:", categoryIds);

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

      query = { "items.product._id": { $in: productIds } };
    }

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

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * per_page)
      .limit(parseInt(per_page, 10));

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { data: orders },
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

    // Validate input IDs

    validateId(cartId, "cart");
    validateId(addressId, "address");
    validateId(couponId, "coupon");
    validateId(userId, "userId");

    if(orderedBy) {
      validateId(orderedBy, "orderedBy");
    }

    if(orderedForUser) {
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
        _id: addressId,
        user: userId,
      }).session(session);
    } else {
      address = await Address.findOne({
        _id: addressId,
        user: userId,
      }).session(session);
    }

    if (!address) throw new Error("Address not found");

    // Process cart items
    let totalAmount = 0;
    const orderItems = [];

    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.product).session(session);
      if (!product) throw new Error(`Product ${cartItem.product} not found`);
      if (!product.instock) throw new Error(`${product.name} is out of stock`);

      let currentPrice;

      if (role === "salesperson") {
        currentPrice =
          product.salesperson_discounted_price !== null
            ? product.salesperson_discounted_price
            : product.price;
      } else if (role === "dnd") {
        currentPrice =
          product.dnd_discounted_price !== null
            ? product.dnd_discounted_price
            : product.price;
      } else {
        currentPrice =
          product.discounted_price !== null
            ? product.discounted_price
            : product.price;
      }

      const itemTotal = parseFloat(currentPrice.toString()) * cartItem.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          discounted_price: product.discounted_price,
          banner_image: product.banner_image,
        },
        quantity: cartItem.quantity,
        priceAtOrder: currentPrice,
      });
    }

    // Apply coupon discount
    let discountAmount = 0;
    let couponDetails = null;

    if (coupon) {
      if (coupon.userUseLimit && userUsage >= coupon.userUseLimit) {
        throw new Error("Coupon usage limit exceeded for user");
      }

      // Calculate discount
      if (coupon.discountType === "percentage") {
        discountAmount = totalAmount * (coupon.discountValue / 100);
        if (coupon.maxDiscount) {
          discountAmount = Math.min(discountAmount, coupon.maxDiscount);
        }
      } else {
        discountAmount = Math.min(coupon.discountValue, totalAmount);
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
        discountAmount,
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
      user: userId,
      items: orderItems,
      address: addressSnapshot,
      totalAmount: totalAmount - discountAmount,
      coupon: couponDetails,
      originalAmount: totalAmount,
      discountAmount,
      cashfree_order: {
        id: orderId,
      },
    });

    // Save order and clear cart
    await order.save({ session });
    cart.items = [];
    await cart.save({ session });

    // // Save coupon usage if applied
    // if (coupon) {
    //   await CouponUsage.create(
    //     [
    //       {
    //         user: userId,
    //         coupon: coupon._id,
    //         order: order._id,
    //         discountAmount,
    //       },
    //     ],
    //     { session }
    //   );
    // }

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
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

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

module.exports = { createOrder, getOrderHistory, getAllOrders, updateOrder };
