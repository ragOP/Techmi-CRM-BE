const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["payment", "refund"], required: true },
    amount: { type: mongoose.Schema.Types.Decimal128, required: true },
    payment_method: {
      type: String,
      enum: ["cod", "cashfree", "upi", "card", "netbanking", "wallet", "other"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
    },
    transaction_id: { type: String },
    refund_reason: { type: String, default: null },
    refund_date: { type: Date, default: null },
    notes: { type: String, default: null },
  },
  { timestamps: true }
);

TransactionSchema.set("toJSON", {
  transform: (doc, ret) => {
    if (ret.amount) {
      ret.amount = parseFloat(ret.amount.toString());
    }
    return ret;
  },
});

const Transaction = mongoose.model("Transaction", TransactionSchema);
module.exports = Transaction;
