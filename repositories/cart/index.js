const Cart = require("../../models/cartModel");

const getCart = async () => {
  return await Cart.find();
};

const getCartByUserId = async (user_id) => {
    return await Cart.findOne({ user: user_id });
  };

const addToCart = async (data) => {
  return await Cart.create(data);
};

const updateCartItem = async (id, data) => {
  return await Cart.findByIdAndUpdate(id, data, { new: true });
};

const removeCartItem = async (id) => {
  return await Cart.findByIdAndDelete(id);
};

module.exports = {
  getCart,
  getCartByUserId,
  addToCart,
  updateCartItem,
  removeCartItem,
};
