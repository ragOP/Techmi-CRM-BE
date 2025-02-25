const CartRepository = require("../../repositories/cart/index.js");
const ProductRepository = require("../../repositories/product/index.js");
const ApiResponse = require("../../utils/ApiResponse.js");

const getCart = async ({ user_id }) => {
  return await CartRepository.getCartByUserId({ user_id });
};

const updateCart = async (user_id, product_id, quantity) => {
  let cart = await CartRepository.getCartByUserId(user_id);

  // 🔥 If no product_id is provided, deactivate or remove the cart
  if (!product_id) {
    if (cart) {
      await CartRepository.deleteCart(cart._id);
    }
    return null;
  }

  // Fetch product details
  const productData = await ProductRepository.getProductById(product_id);
  if (!productData) {
    throw new ApiResponse(404, null, "Product not found", false);
  }

  const finalPrice = parseFloat(
    productData.discounted_price || productData.price
  );

  if (!cart) {
    // Create a new cart ONLY if an item is being added
    if (quantity > 0) {
      cart = await CartRepository.addToCart({
        user: user_id,
        total_price: finalPrice * quantity,
        items: [
          {
            product: product_id,
            quantity,
            price: finalPrice,
            discount: productData.discount || 0,
          },
        ],
        is_active: true,
      });
    }
    return cart;
  }

  // 🔍 Find the product in the cart
  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === product_id
  );

  if (existingItemIndex !== -1) {
    const existingItem = cart.items[existingItemIndex];

    if (quantity > 0) {
      existingItem.quantity = quantity;
      existingItem.price = finalPrice * quantity;
      existingItem.discount = productData.discount || 0;
    } else {
      cart.items.splice(existingItemIndex, 1); // Remove the product from cart
    }
  } else if (quantity > 0) {
    cart.items.push({
      product: product_id,
      quantity,
      price: finalPrice,
      discount: productData.discount || 0,
    });
  }

  // 🔄 Recalculate total price
  cart.total_price = cart.items.reduce((sum, item) => sum + item.price, 0);

  // 🛑 If cart is empty, deactivate it
  if (cart.items.length === 0) {
    cart.is_active = false;
    await cart.save();
    return null;
  }

  await cart.save();
  return cart;
};

module.exports = {
  getCart,
  updateCart,
};
