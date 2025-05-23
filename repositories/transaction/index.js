const Transaction = require("../../models/transactionModel.js");

const getAllTransactions = (filters = {}) =>
  Transaction.find(filters).sort({ createdAt: -1 });

const countTransactions = (filters = {}) => Transaction.countDocuments(filters);

const getTransactionById = (id) => Transaction.findById(id);

const createTransaction = (payload) => Transaction.create(payload);

const updateTransaction = (id, payload) =>
  Transaction.findByIdAndUpdate(id, payload, { new: true });

const deleteTransaction = (id) => Transaction.findByIdAndDelete(id);

module.exports = {
  getAllTransactions,
  countTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
