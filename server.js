require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db.js");
const swaggerSpec = require("./swagger.js");
const swaggerUI = require("swagger-ui-express");

// Routes Import
const authAdminRoutes = require("./routes/auth/admin/index.js");
const authUserRoutes = require("./routes/auth/user/index.js");
const serviceRoutes = require("./routes/service/index.js");
const categoryRoutes = require("./routes/category/index.js");
const productRoutes = require("./routes/product/index.js");
const cartRoutes = require("./routes/cart/index.js");
const addressRoutes = require("./routes/address/index.js");
const orderRoutes = require("./routes/order/index.js");
const couponRoutes = require("./routes/coupon/index.js");
const contactRoutes = require("./routes/contact/index.js");
const blogRoutes = require("./routes/blogs/index.js");
const reviewRoutes = require("./routes/reviews/index.js");
const homeConfigRoutes = require("./routes/home_config/index.js");
const sericeConfigRoutes = require("./routes/service_config/index.js");
const headerConfigRoutes = require("./routes/header_config/index.js");
const internalPageConfigRoutes = require("./routes/internal_config/index.js");
const paymentRoutes = require("./routes/payment/index.js");
const dashboardRoutes = require("./routes/dashboard/index.js");
const brandRoutes = require("./routes/brand/index.js");
const medicineTypeRoutes = require("./routes/medicine_type/index.js");
const inventoryRoutes = require("./routes/inventory/index.js");
const inventoryHistoryRoutes = require("./routes/inventory_history/index.js");
const hsncodesRoutes = require("./routes/hsn_code/index.js");
const mediaRoutes = require("./routes/media/index.js");
const appBannerRoutes = require("./routes/app_banner/index.js");
const transactionRoutes = require("./routes/transaction/index.js");
const termsConditionRoutes = require("./routes/terms_condition/index.js");
const privacyPolicyRoutes = require("./routes/privacy_policy/index.js");
const faqRoutes = require("./routes/faq/index.js");
const testimonialRoutes = require("./routes/testimonials/index.js");

// Connect DB
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(morgan("dev"));

// Routes
app.use("/api/auth/admin", authAdminRoutes);
app.use("/api/auth/user", authUserRoutes);
app.use("/api/service", serviceRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/home", homeConfigRoutes);
app.use("/api/service-page", sericeConfigRoutes);
app.use("/api/header", headerConfigRoutes);
app.use("/api/internal", internalPageConfigRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/medicine-type", medicineTypeRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/inventory-history", inventoryHistoryRoutes);
app.use("/api/hsn-codes", hsncodesRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/app-banner", appBannerRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/terms-condition", termsConditionRoutes);
app.use("/api/privacy-policy", privacyPolicyRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/testimonials", testimonialRoutes);

// Documentation (Development)
app.use("/api-doc", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Default Route
app.use("/", (req, res) => {
  res.json({ message: "Invalid route" });
});

// Testing Deployement

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
