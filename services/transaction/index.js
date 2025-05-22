const TransactionRepository = require("../../repositories/transaction");

const getAllTransactionsWithCount = async ({ filters }) => {
  const [transactions, total] = await Promise.all([
    TransactionRepository.getAllTransactions(filters),
    TransactionRepository.countTransactions(filters),
  ]);
  return { transactions, total };
};

const getTransactionById = async (id) => {
  return await TransactionRepository.getTransactionById(id);
};

const createTransaction = async (payload) => {
  return await TransactionRepository.createTransaction(payload);
};

const updateTransaction = async (id, payload) => {
  return await TransactionRepository.updateTransaction(id, payload);
};

const deleteTransaction = async (id) => {
  return await TransactionRepository.deleteTransaction(id);
};

module.exports = {
  getAllTransactionsWithCount,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
