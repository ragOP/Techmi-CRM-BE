const mongoose = require("mongoose");

const ServicesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 255,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      maxlength: 255,
    },
    description: {
      type: String,
    },
    meta_data: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    images: {
      type: [String],
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
  },
  { timestamps: true }
);

const Services = mongoose.model("Services", ServicesSchema);
module.exports = Services;
