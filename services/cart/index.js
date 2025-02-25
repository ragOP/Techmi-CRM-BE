const Cart = require("../../models/cartModel.js");
const CartRepository = require("../../repositories/cart/index.js");
const ProductRepository = require("../../repositories/product/index.js");
const ApiResponse = require("../../utils/ApiResponse.js");

const getCart = async ({ user_id }) => {
  return await CartRepository.getCartByUserId({ user_id });
};

const updateCart = async (user_id, product_id, quantity) => {
  let cart = await CartRepository.getCartByUserId({ user_id });

  if (quantity < 0) {
    throw new ApiResponse(400, null, "Invalid quantity", false);
  }

  const productData = await ProductRepository.getProductById(product_id);
  if (!productData) {
    throw new ApiResponse(404, null, "Product not found", false);
  }

  const finalPrice = parseFloat(
    productData.discounted_price || productData.price
  );

  if (!cart) {
    if (quantity > 0) {
      cart = await CartRepository.addToCart({
        user: user_id,
        total_price: finalPrice * quantity,
        items: [
          {
            product: product_id,
            quantity,
            price: finalPrice,
            total: finalPrice * quantity,
            discount: productData.discount || 0,
            name: productData.name,
            images: productData.images,
            description: productData.description,
          },
        ],
        is_active: true,
      });
    }
    return cart;
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === product_id
  );

  if (existingItem) {
    if (quantity > 0) {
      existingItem.quantity = quantity;
      existingItem.total = finalPrice * quantity; 
    } else {
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== product_id
      );
    }
  } else if (quantity > 0) {
    cart.items.push({
      product: product_id,
      quantity,
      price: finalPrice,
      total: finalPrice * quantity, 
      discount: productData.discount || 0,
      name: productData.name,
      images: productData.images,
      description: productData.description,
    });
  }

  cart.total_price = cart.items.reduce((sum, item) => sum + item.total, 0);

  cart.is_active = cart.items.length > 0;

  await cart.save();
  return cart;
};

const deleteCartItem = async (user_id) => {
  const cart = await CartRepository.getCartByUserId({ user_id });

  console.log(cart, ">>>>>>>>>>>>>>>>>>>")
  if (!cart) {
    throw new ApiResponse(404, null, "Cart not found", false);
  }
  return await CartRepository.removeCartItem(user_id);
};

module.exports = {
  getCart,
  updateCart,
  deleteCartItem
};
