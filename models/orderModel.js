// models/Order.js
const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: new mongoose.Schema({
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      price: {
        type: mongoose.Schema.Types.Decimal128,
        required: true
      },
      discounted_price: {
        type: mongoose.Schema.Types.Decimal128
      },
      banner_image: String
    }),
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const OrderAddressSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  pincode: String,
  locality: String,
  address: String,
  city: String,
  state: String,
  landmark: String,
  alternatePhone: String,
  addressType: String
});

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [OrderItemSchema],
  address: OrderAddressSchema,
  totalAmount: {
    type: mongoose.Schema.Types.Decimal128,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending"
  }
}, { timestamps: true });

OrderSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.totalAmount = parseFloat(ret.totalAmount.toString());
    ret.items = ret.items.map(item => ({
      ...item,
      product: {
        ...item.product,
        price: parseFloat(item.product.price.toString()),
        discounted_price: item.product.discounted_price ? 
          parseFloat(item.product.discounted_price.toString()) : null
      }
    }));
    return ret;
  }
});

module.exports = mongoose.model("Order", OrderSchema);