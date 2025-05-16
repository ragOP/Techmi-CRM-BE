const mongoose = require("mongoose");

const { Schema } = mongoose;

const brandSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    logo_url: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    is_active: {
      type: Boolean,
      default: true,
    },
    created_by_admin: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

const Brand = mongoose.model("Brand", brandSchema);

module.exports = Brand;
