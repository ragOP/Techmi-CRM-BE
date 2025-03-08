require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db.js");
const swaggerSpec = require("./swagger.js");
const swaggerUI = require("swagger-ui-express");
const authRoutes = require("./routes/auth/index.js");
const serviceRoutes = require("./routes/service/index.js");
const categoryRoutes = require("./routes/category/index.js");
const productRoutes = require("./routes/product/index.js");
const cartRoutes = require("./routes/cart/index.js");
const addressRoutes = require("./routes/address/index.js");
const orderRoutes = require("./routes/order/index.js");
const couponRoutes = require("./routes/coupon/index.js");
const contactRoute = require("./routes/contact/index.js")

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/service", serviceRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/contact", contactRoute);

app.use("/api-doc", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.use("/", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
