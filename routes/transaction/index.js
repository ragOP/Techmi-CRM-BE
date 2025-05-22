const express = require("express");
const router = express.Router();
const TransactionController = require("../../controllers/transaction/index.js");
const {
  adminOrSubAdminOrSuperAdmin,
} = require("../../middleware/auth/adminMiddleware.js");
const { user } = require("../../middleware/auth/userMiddleware.js");

router.get(
  "/",
//   adminOrSubAdminOrSuperAdmin,
  TransactionController.getAllTransactions
);

router.get("/user", user, TransactionController.getUserTransactions);

router.get(
  "/:id",
  adminOrSubAdminOrSuperAdmin,
  TransactionController.getTransactionById
);

router.post(
  "/",
  adminOrSubAdminOrSuperAdmin,
  TransactionController.createTransaction
);

router.put(
  "/:id",
  adminOrSubAdminOrSuperAdmin,
  TransactionController.updateTransaction
);

router.delete(
  "/:id",
  adminOrSubAdminOrSuperAdmin,
  TransactionController.deleteTransaction
);

module.exports = router;

/**
 * @swagger
 * /api/transaction:
 *   get:
 *     summary: Get all transactions
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order:
 *                 type: string
 *               user:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [payment, refund]
 *               amount:
 *                 type: number
 *               payment_method:
 *                 type: string
 *                 enum: [cod, cashfree, upi, card, netbanking, wallet, other]
 *               status:
 *                 type: string
 *                 enum: [pending, success, failed, refunded]
 *               transaction_id:
 *                 type: string
 *               refund_reason:
 *                 type: string
 *               refund_date:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction created
 *
 * /api/transaction/{id}:
 *   get:
 *     summary: Get a transaction by ID
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Success
 *   put:
 *     summary: Update a transaction by ID
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order:
 *                 type: string
 *               user:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [payment, refund]
 *               amount:
 *                 type: number
 *               payment_method:
 *                 type: string
 *                 enum: [cod, cashfree, upi, card, netbanking, wallet, other]
 *               status:
 *                 type: string
 *                 enum: [pending, success, failed, refunded]
 *               transaction_id:
 *                 type: string
 *               refund_reason:
 *                 type: string
 *               refund_date:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction updated
 *   delete:
 *     summary: Delete a transaction by ID
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction deleted
 */
