const mongoose = require("mongoose");
const { type } = require("os");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 255,
    },
    small_desc: {
      type: String,
    },
    full_desc: {
      type: String,
    },
    price: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    discounted_price: {
      type: mongoose.Schema.Types.Decimal128,
    },
    instock: {
      type: Boolean,
      default: true,
    },
    manufacturer: {
      type: String,
      maxlength: 255,
    },
    consumed_type: {
      type: String,
      maxlength: 255,
    },
    banner_image: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
    },
    expiry_date: {
      type: Date,
    },
    meta_data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    uploaded_by_brand: {
      type: String,
      maxlength: 255,
    },
    is_best_seller: {
      type: Boolean,
      default: false,
    },
    category: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
