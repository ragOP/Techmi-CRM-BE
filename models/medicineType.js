const mongoose = require("mongoose");

const { Schema } = mongoose;

const medicineTypeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    created_by_admin: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

const MedicineType = mongoose.model("MedicineType", medicineTypeSchema);

module.exports = MedicineType;
