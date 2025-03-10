const mongoose = require("mongoose");

const ServicePageConfigSchema = new mongoose.Schema(
  {
    heading: { type: String, trim: true },
    subheading: { type: String, trim: true },

    houseCleaningImage: { type: String },
    houseCleaningDescription: { type: String, trim: true },
    houseCleaningReviews: { type: Number, min: 1, max: 5 },

    pharmaImage: { type: String },
    pharmaDescription: { type: String, trim: true },
    pharmaReviews: { type: Number, min: 1, max: 5 },

    laundryImage: { type: String },
    laundryDescription: { type: String, trim: true },
    laundryReviews: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServicePageConfig", ServicePageConfigSchema);
