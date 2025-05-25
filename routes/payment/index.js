const express = require("express");
const router = express.Router();
const { user } = require("../../middleware/auth/userMiddleware.js");
const PaymentController = require("../../controllers/payment/index.js");

router.post("/create-session", user, PaymentController.createCashfreeSession);

router.get("/details/:id", user, PaymentController.getCashfreePaymentDetails);

module.exports = router;
