const mongoose = require("mongoose");
const Cart = require("../../models/cartModel");

const getCart = async () => {
  return await Cart.find({});
};

const getCartByUserId = async ({ user_id }) => {
  if (user_id) {
    return await Cart.findOne({ user: user_id }).populate({
      path: "items.product",
      populate: { path: "hsn_code" },
    });
  }

  return await Cart.find().populate({
    path: "items.product",
    populate: { path: "hsn_code" },
  });
};

const addToCart = async (data) => {
  return await Cart.create(data);
};

const updateCartItem = async (id, data) => {
  return await Cart.findByIdAndUpdate(id, data, { new: true });
};

const deleteCartByUserId = async (id) => {
  return await Cart.deleteOne({ user: id });
};

module.exports = {
  getCart,
  getCartByUserId,
  addToCart,
  updateCartItem,
  deleteCartByUserId,
};
