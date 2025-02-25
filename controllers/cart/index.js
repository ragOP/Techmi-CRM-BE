const { asyncHandler } = require("../../common/asyncHandler.js");
const ApiResponse = require("../../utils/ApiResponse.js");
const CartService = require("../../services/cart/index.js");
const mongoose = require("mongoose");

const getCart = asyncHandler(async (req, res) => {
  const { user_id } = req.query;

  const cart = await CartService.getCart({ user_id });

  res.json(new ApiResponse(200, cart, "Cart fetched successfully", true));
});

const addToCart = asyncHandler(async (req, res) => {
  const { user_id, product_id, quantity } = req.body;

  const cartItem = await CartService.updateCart(user_id, product_id, quantity);
  res.json(
    new ApiResponse(201, cartItem, "Item added to cart successfully", true)
  );
});

const deleteCartItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const cartItem = await CartService.deleteCartItem(id);
  res.json(
    new ApiResponse(200, cartItem, "Item removed from cart successfully", true)
  );
});

module.exports = {
  getCart,
  addToCart,
  deleteCartItem,
};
