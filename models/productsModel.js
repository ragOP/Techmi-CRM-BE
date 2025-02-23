const mongoose = require("mongoose");
const { type } = require("os");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 255,
    },
    small_description: {
      type: String,
    },
    full_description: {
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
      type: Map,
      of: mongoose.Schema.Types.Mixed,
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

ProductSchema.set("toJSON", {
  transform: (_, ret) => {
    if (ret.price) ret.price = parseFloat(ret.price.toString());
    if (ret.discounted_price)
      ret.discounted_price = parseFloat(ret.discounted_price.toString());
    return ret;
  },
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
