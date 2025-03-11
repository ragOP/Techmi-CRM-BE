const mongoose = require("mongoose");

const InternalPageSchema = new mongoose.Schema(
  {
    flyer1: { type: String },
    sliderImages: [{ type: String }],
    aboutUsImage: { type: String },
    aboutDescription: { type: String, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("InternalPageSchema", InternalPageSchema);
