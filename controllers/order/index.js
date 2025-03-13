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
    let query = {}; // Default query to fetch all orders

    // Apply filters only if service_id is provided
    if (service_id) {
      // Check if service_id is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(service_id)) {
        return res
          .status(400)
          .json(new ApiResponse(400, null, "Invalid service_id format", false));
      }

      // Convert service_id to ObjectId
      const serviceObjectId = new mongoose.Types.ObjectId(service_id);

      // Step 1: Get categories linked to the service
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

      // Step 2: Get products in these categories
      const productIds = await Product.find({
        category: { $in: categoryIds },
      }).distinct("_id");

      console.log("Product IDs:", productIds);

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

      // Update query to filter orders containing these products
      query = { "items.product._id": { $in: productIds } };
    }

    // Step 3: Find orders based on the query
    const orders = await Order.find(query)
      .sort({ createdAt: -1 }) // Sort by latest orders
      .skip((page - 1) * per_page) // Pagination
      .limit(parseInt(per_page, 10));

    console.log("Orders found:", orders.length);

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

const createOrder = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const role = req.user.role;

    const { cartId, addressId, couponId } = req.body;
    const userId = req.user._id;

    // Validate input IDs
    const validateId = (id, name) => {
      if (id && !mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid ${name} ID`);
      }
    };

    validateId(cartId, "cart");
    validateId(addressId, "address");
    validateId(couponId, "coupon");
    validateId(userId, "userId");

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
    const address = await Address.findOne({
      _id: addressId,
      user: userId,
    }).session(session);
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

module.exports = { createOrder, getOrderHistory, getAllOrders };
