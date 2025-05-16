const mongoose = require("mongoose");

const { Schema } = mongoose;

const inventorySchema = new Schema(
  {
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    last_modified_by: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    last_modified_reason: {
      type: String,
      trim: true,
    },
    last_restocked_at: {
      type: Date,
    },
    low_stock_threshold: {
      type: Number,
      default: 5,
    },
    warehouse_location: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Inventory = mongoose.model("Inventory", inventorySchema);

module.exports = Inventory;
