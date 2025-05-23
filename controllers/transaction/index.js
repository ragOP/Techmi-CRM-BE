const mongoose = require("mongoose");
const ApiResponse = require("../../utils/ApiResponse.js");
const TransactionService = require("../../services/transaction");
const { asyncHandler } = require("../../common/asyncHandler.js");

const getAllTransactions = asyncHandler(async (req, res) => {
      console.log("User ID:\ 1111111", userId);

  const { search, start_date, end_date } = req.query;
  const filters = {
    ...(search && {
      $or: [
        { transaction_id: { $regex: search, $options: "i" } },
        { payment_method: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
        // Add more fields as needed
      ],
    }),
    ...(start_date || end_date
      ? {
          createdAt: {
            ...(start_date && { $gte: new Date(start_date) }),
            ...(end_date && { $lte: new Date(end_date) }),
          },
        }
      : {}),
  };
  const { transactions, total } =
    await TransactionService.getAllTransactionsWithCount({
      filters,
    });
  res.json(
    new ApiResponse(
      200,
      { data: transactions, total },
      "Transactions fetched successfully",
      true
    )
  );
});

const getUserTransactions = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  console.log("User ID:", userId);
  const { search, start_date, end_date } = req.query;
  const filters = {
    user: userId,
    ...(search && {
      $or: [
        { transaction_id: { $regex: search, $options: "i" } },
        { payment_method: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
      ],
    }),
    ...(start_date || end_date
      ? {
          createdAt: {
            ...(start_date && { $gte: new Date(start_date) }),
            ...(end_date && { $lte: new Date(end_date) }),
          },
        }
      : {}),
  };
  const { transactions, total } =
    await TransactionService.getAllTransactionsWithCount({ filters });
  res.json(
    new ApiResponse(
      200,
      { data: transactions, total },
      "User transactions fetched successfully",
      true
    )
  );
});

const getTransactionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.json(
      new ApiResponse(400, null, "Invalid transaction ID", false)
    );
  }
  const transaction = await TransactionService.getTransactionById(id);
  if (!transaction) {
    return res.json(new ApiResponse(404, null, "Transaction not found", false));
  }
  res.json(
    new ApiResponse(200, transaction, "Transaction fetched successfully", true)
  );
});

const createTransaction = asyncHandler(async (req, res) => {
  const adminId = req.admin?._id;
  const payload = {
    ...req.body,
    created_by_admin: adminId,
  };

  const transaction = await TransactionService.createTransaction(payload);
  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        transaction,
        "Transaction created successfully",
        true
      )
    );
});

const updateTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.json(
      new ApiResponse(400, null, "Invalid transaction ID", false)
    );
  }
  const transaction = await TransactionService.updateTransaction(id, req.body);
  if (!transaction) {
    return res.json(new ApiResponse(404, null, "Transaction not found", false));
  }
  res.json(
    new ApiResponse(200, transaction, "Transaction updated successfully", true)
  );
});

const deleteTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.json(
      new ApiResponse(400, null, "Invalid transaction ID", false)
    );
  }
  const transaction = await TransactionService.deleteTransaction(id);
  if (!transaction) {
    return res.json(new ApiResponse(404, null, "Transaction not found", false));
  }
  res.json(
    new ApiResponse(200, null, "Transaction deleted successfully", true)
  );
});

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getUserTransactions,
};
