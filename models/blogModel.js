const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    short_description: {
      type: String,
      required: true,
      trim: true,
    },
    bannerImageUrl: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Services",
      required: true,
    },
    published: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", BlogSchema);
module.exports = Blog;
