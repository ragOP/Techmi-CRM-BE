import mongoose from "mongoose";

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
      type: mongoose.Schema.Types.Mixed,
    },
    images: {
      type: [String],
      default: [],
    },
    categories: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    created_by_admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

const Services = mongoose.model("Services", ServicesSchema);
export default Services;
