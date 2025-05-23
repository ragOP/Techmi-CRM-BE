const mongoose = require("mongoose");

const InventoryHistorySchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    inventory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },
    change: { type: Number, required: true }, 
    old_quantity: { type: Number, required: true },
    new_quantity: { type: Number, required: true },
    action: {
      type: String,
      enum: ["add", "remove", "order", "restock", "manual_adjust"],
      required: true,
    },
    reason: { type: String }, 
    changed_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model("InventoryHistory", InventoryHistorySchema);
