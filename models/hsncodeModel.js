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
      min: 0,
      max: 100,
      default: null,
    },
    sgst_rate: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    igst_rate: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    cess: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    created_by_admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    updated_by_admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

const HSNCode = mongoose.model("HSNCode", HSNCodeSchema);

module.exports = HSNCode;
