const mongoose = require("mongoose");

const HeaderConfigSchema = new mongoose.Schema(
  {
    logo: { type: String },
    address: { type: String, trim: true },
    timming: { type: String, trim: true },
    phoneNumber: { type: Number },
    email: { type: String, lowercase: true, trim: true },
    mapLink: { type: String },
    facebookLink: { type: String },
    twitterLink: { type: String },
    instagramLink: { type: String },
    linkedInLink: { type: String },
    locations: {
      type: [
        {
          city: { type: String },
          locations: { type: [String], default: [] },
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HeaderConfig", HeaderConfigSchema);
