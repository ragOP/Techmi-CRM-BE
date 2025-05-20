const mongoose = require("mongoose");

const HSNCodeSchema = new mongoose.Schema(
  {
    hsn_code: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    cgst_rate: {
      type: Number,
      required: true,
    },
    sgst_rate: {
      type: Number,
      required: true,
    },
    igst_rate: {
      type: Number,
      required: true,
    },
    cess_ad_valorem: {
      type: Number,
      default: 0,
    },
    cess_fixed: {
      type: Number,
      default: 0,
    },
    cess_unit: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const HSNCode = mongoose.model("HSNCode", HSNCodeSchema);

module.exports = HSNCode;
