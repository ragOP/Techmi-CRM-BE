const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: mongoose.Schema.Types.Decimal128,
          required: true,
        },
        total: {
          type: mongoose.Schema.Types.Decimal128,
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    total_price: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ✅ Auto-calculate total for each item before saving
CartSchema.pre("save", function (next) {
  this.items.forEach((item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price.toString()) || 0; // Convert Decimal128 to string, then parseFloat

    item.total = mongoose.Types.Decimal128.fromString(
      (quantity * price).toString()
    ); // Convert back to Decimal128
  });

  // ✅ Calculate total_price for the cart
  const totalPrice = this.items.reduce((sum, item) => {
    const itemTotal = parseFloat(item.total.toString()) || 0; // Convert Decimal128 to string, then parseFloat
    return sum + itemTotal;
  }, 0);

  this.total_price = mongoose.Types.Decimal128.fromString(
    totalPrice.toString()
  ); // Convert back to Decimal128

  next();
});

// ✅ Transform Decimal128 fields to numbers in JSON responses
CartSchema.set("toJSON", {
  transform: (doc, ret) => {
    // Convert total_price from Decimal128 to a number
    ret.total_price = parseFloat(ret.total_price.toString());

    // Ensure items' total and price are also numbers
    ret.items = ret.items.map((item) => ({
      ...item,
      price: parseFloat(item.price.toString()),
      total: parseFloat(item.total.toString()),
    }));

    return ret;
  },
});

const Cart = mongoose.model("Cart", CartSchema);
module.exports = Cart;
