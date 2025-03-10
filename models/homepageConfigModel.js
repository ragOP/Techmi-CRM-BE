const mongoose = require("mongoose");

const HomepageConfigSchema = new mongoose.Schema(
  {
    heading: { type: String, trim: true },
    subheading: { type: String, trim: true },
    flyer1: { type: String },
    banner1: { type: String },
    banner2: { type: String },
    banner3: { type: String },
    banner4: { type: String },
    banner5: { type: String },
    banner6: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HomepageConfig", HomepageConfigSchema);