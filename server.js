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
const contactRoute = require("./routes/contact/index.js");
const blogRoute = require("./routes/blogs/index.js");
const reviewRoute = require("./routes/reviews/index.js");
const homeConfigRoutes = require("./routes/home_config/index.js");
const sericeConfigRoutes = require("./routes/service_config/index.js");
const headerConfigRoute = require("./routes/header_config/index.js");
const internalPageConfigRoute = require("./routes/internal_config/index.js");
const paymentRoute = require("./routes/payment/index.js");
const dashboardRoute = require("./routes/dashboard/index.js");
const brandRoute = require("./routes/brand/index.js");
const medicineTypeRoute = require("./routes/medicine_type/index.js");
const inventoryRoute = require("./routes/inventory/index.js");
const hsncodesRoute = require("./routes/hsn_code/index.js");

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
app.use("/api/contact", contactRoute);
app.use("/api/blog", blogRoute);
app.use("/api/review", reviewRoute);
app.use("/api/home", homeConfigRoutes);
app.use("/api/service-page", sericeConfigRoutes);
app.use("/api/header", headerConfigRoute);
app.use("/api/internal", internalPageConfigRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/dashboard", dashboardRoute);
app.use("/api/brand", brandRoute);
app.use("/api/medicine-type", medicineTypeRoute);
app.use("/api/inventory", inventoryRoute);
app.use("/api/hsn", hsncodesRoute);

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
