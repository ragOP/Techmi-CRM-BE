const { asyncHandler } = require("../../common/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const mongoose = require("mongoose");
const Cart = require("../../models/cartModel");
const Address = require("../../models/addressModel");
const Product = require("../../models/productsModel");
const Order = require("../../models/orderModel");

const createOrder = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { cartId, addressId } = req.body;
    const userId = req.user._id;

    // Validate cart ID
    if (!mongoose.Types.ObjectId.isValid(cartId)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid cart ID", false));
    }

    // Validate address ID
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid address ID", false));
    }

    // Get and validate cart
    const cart = await Cart.findOne({
      _id: cartId,
      user: userId,
    }).session(session);

    if (!cart) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Cart not found", false));
    }

    if (cart.items.length === 0) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Cart is empty", false));
    }

    // Validate address
    const address = await Address.findOne({
      _id: addressId,
      user: userId,
    }).session(session);

    if (!address) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Address not found", false));
    }

    // Process cart items
    let totalAmount = 0;
    const orderItems = [];

    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.product).session(session);

      if (!product) {
        throw new Error(`Product not found: ${cartItem.product}`);
      }

      if (!product.instock) {
        throw new Error(`Product out of stock: ${product.name}`);
      }

      // Get current price
      const currentPrice = product.discounted_price || product.price;
      const itemTotal = parseFloat(currentPrice.toString()) * cartItem.quantity;
      totalAmount += itemTotal;

      // Create product snapshot
      const productSnapshot = {
        _id: product._id,
        name: product.name,
        price: product.price,
        discounted_price: product.discounted_price,
        banner_image: product.banner_image,
      };

      orderItems.push({
        product: productSnapshot,
        quantity: cartItem.quantity,
        priceAtOrder: currentPrice,
      });
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
      totalAmount: totalAmount,
    });

    // Save order and clear cart
    await order.save({ session });
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

module.exports = { createOrder, getOrderHistory };
