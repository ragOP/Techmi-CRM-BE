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
  },
  { timestamps: true }
);

module.exports = mongoose.model("HeaderConfig", HeaderConfigSchema);
