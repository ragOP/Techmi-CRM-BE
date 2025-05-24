const mongoose = require("mongoose");

const termsConditionSchema = new mongoose.Schema(
  {
    terms_and_conditions: {
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

const TermsCondition = mongoose.model("TermsCondition", termsConditionSchema);
module.exports = TermsCondition;
