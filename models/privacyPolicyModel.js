const mongoose = require("mongoose");

const privacyPolicySchema = new mongoose.Schema(
  {
    privacy_policy: {
      type: String,
      required: true,
      trim: true,
    },
    created_by_admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

const PrivacyPolicy = mongoose.model("PrivacyPolicy", privacyPolicySchema);
module.exports = PrivacyPolicy;
