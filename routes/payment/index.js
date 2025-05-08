const express = require("express");
const router = express.Router();
const { user } = require("../../middleware/auth/userMiddleware.js");
const { default: axios } = require("axios");

router.post("/create-session", async (req, res) => {
  try {
    const {
      addressId,
      cartId,
      couponId,
      amount,
      customerId,
      customerEmail,
      customerPhone,
    } = req.body;

    const orderId = "order_" + Date.now();
    let returnUrl = `http://localhost:3000/cart?orderId=${orderId}&addressId=${addressId}&cartId=${cartId}`;
    if (couponId) {
      returnUrl += `&couponId=${couponId}`;
    }
    const response = await axios.post(
      "https://sandbox.cashfree.com/pg/orders",
      {
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: "cust_001",
          customer_email: "test@example.com",
          customer_phone: "9999999999",
        },
        order_meta: {
          return_url: returnUrl,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-client-id": process.env.CASHFREE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
          "x-api-version": "2025-01-01",
        },
      }
    );

    const data = response.data;
    res.json({ data: data });
  } catch (error) {
    console.error("Error creating session:", error.response?.data || error);
    res.status(500).json({ error: "Failed to create session" });
  }
});

router.get("/details/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const response = await axios.get(
      `https://sandbox.cashfree.com/pg/orders/${id}/payments`,
      {
        headers: {
          "x-client-id": process.env.CASHFREE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
          Accept: "application/json",
          "x-api-version": "2025-01-01",
        },
      }
    );

    const data = response.data;
    console.log(data, "Payment Details >>>>>>>>>>>>>>>>>>>>>>>>");
    res.json({ data: data });
  } catch (error) {
    console.error(
      "Error fetching payment details:",
      error.response?.data || error
    );
    res.status(500).json({ error: "Failed to fetch payment details" });
  }
});

module.exports = router;
