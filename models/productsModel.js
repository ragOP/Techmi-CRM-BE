const mongoose = require("mongoose");

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
      default: null,
      validate: {
        validator: function (value) {
          return value === null || value >= 0;
        },
        message: "Discounted price must be a non-negative number or null",
      },
    },
    salesperson_discounted_price: {
      type: mongoose.Schema.Types.Decimal128,
      default: null,
      validate: {
        validator: function (value) {
          return value === null || value >= 0;
        },
        message: "Discounted price must be a non-negative number or null",
      },
    },
    dnd_discounted_price: {
      type: mongoose.Schema.Types.Decimal128,
      default: null,
      validate: {
        validator: function (value) {
          return value === null || value >= 0;
        },
        message: "Discounted price must be a non-negative number or null",
      },
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
    medicine_type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicineType",
    },
    is_best_seller: {
      type: Boolean,
      default: false,
    },
    category: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Category",
      default: [],
    },
    created_by_admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    hsn_code: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HSNCode",
      required: false,
    },
    updated_by_admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    is_prescription_required: {
      type: Boolean,
      default: false,
    },
    product_type: {
      type: String,
      enum: ["service", "product"],
      required: true,
      default: "product",
    },
  },
  { timestamps: true }
);

ProductSchema.set("toJSON", {
  transform: (_, ret) => {
    if (ret.price) ret.price = parseFloat(ret.price.toString());
    if (ret.discounted_price)
      ret.discounted_price = parseFloat(ret.discounted_price.toString());
    if (ret.dnd_discounted_price)
      ret.dnd_discounted_price = parseFloat(
        ret.dnd_discounted_price.toString()
      );
    if (ret.salesperson_discounted_price)
      ret.salesperson_discounted_price = parseFloat(
        ret.salesperson_discounted_price.toString()
      );
    if (ret.gst) ret.gst = parseFloat(ret.gst.toString());
    if (ret.csgt) ret.csgt = parseFloat(ret.csgt.toString());
    if (ret.sgst) ret.sgst = parseFloat(ret.sgst.toString());
    if (ret.igst) ret.igst = parseFloat(ret.igst.toString());
    return ret;
  },
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
