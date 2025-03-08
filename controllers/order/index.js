const { asyncHandler } = require("../../common/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const mongoose = require("mongoose");
const Cart = require("../../models/cartModel");
const Address = require("../../models/addressModel");
const Product = require("../../models/productsModel");
const Order = require("../../models/orderModel");
const Coupon = require("../../models/couponModel");

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully", true));
});

const createOrder = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { cartId, addressId, couponId } = req.body;
    const userId = req.user._id;
    console.log(userId, ">>>>>>>>>>>.userId");

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

      const currentPrice = product.discounted_price || product.price;
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
