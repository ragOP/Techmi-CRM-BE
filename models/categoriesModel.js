import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 255,
    },
    description: {
      type: String,
      maxlength: 2056,
    },
    discount_label_text: {
      type: String,
      maxlength: 255,
    },
    meta_data: {
      type: mongoose.Schema.Types.Mixed,
    },
    newly_launched: {
      type: Boolean,
      default: false,
    },
    is_active: {
      type: Boolean,
      default: true,
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
    created_by_super_admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      required: true,
    },
    services: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Services",
      required: true,
    },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", CategorySchema);
export default Category;
