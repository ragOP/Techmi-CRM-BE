const axios = require("axios");

function isDev() {
  return process.env.NODE_ENV !== "production";
}

const CASHFREE_URL = "https://sandbox.cashfree.com/pg";
const LOCALHOST_URL = "http://localhost:3000/payment-processing";
const WEB_PROD_URL = "http://fe-techmi-cre.vercel.app";

const createCashfreeSession = async (req, res) => {
  try {
    const {
      addressId,
      cartId,
      couponId,
      amount,
      customerId,
      customerEmail,
      customerPhone,
      orderedForUser,
      orderType = "normal",
      url,
      quantity = 1,
      productId,
    } = req.body;

    const orderId = "order_" + Date.now();

    const cartUrl = isDev()
      ? "https://fe-techmi-cre.vercel.app/payment-processing"
      : "https://fe-techmi-cre.vercel.app/payment-processing";
    const finalUrl = url ? url : cartUrl;

    let returnUrl = `${finalUrl}?orderId=${orderId}&addressId=${addressId}&orderType=${orderType}`;

    if (cartId) {
      returnUrl += `&cartId=${cartId}`;
    }

    if (productId) {
      returnUrl += `&productId=${productId}&quantity=${quantity}`;
    }

    if (couponId) {
      returnUrl += `&couponId=${couponId}`;
    }

    if (orderedForUser) {
      returnUrl += `&orderedForUser=${orderedForUser}`;
    }

    const response = await axios.post(
      `${CASHFREE_URL}/orders`,
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
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
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
};

const getCashfreePaymentDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await axios.get(`${CASHFREE_URL}/orders/${id}/payments`, {
      headers: {
        "x-client-id": process.env.CASHFREE_CLIENT_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        Accept: "application/json",
        "x-api-version": "2025-01-01",
      },
    });

    const data = response.data;
    res.json({ data: data });
  } catch (error) {
    console.error(
      "Error fetching payment details:",
      error.response?.data || error
    );
    res.status(500).json({ error: "Failed to fetch payment details" });
  }
};

module.exports = {
  createCashfreeSession,
  getCashfreePaymentDetails,
  CASHFREE_URL,
};
