const express = require("express");
const ProductsController = require("../../controllers/products/index.js");
const multer = require("multer");
const { storage } = require("../../config/multer.js");
const {
  admin,
  adminOrSubAdmin,
  adminOrSuperAdmin,
} = require("../../middleware/auth/adminMiddleware.js");
const router = express.Router();

const upload = multer({ storage: storage });

router.post(
  "/",
  adminOrSuperAdmin,
  upload.fields([
    { name: "banner_image", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  ProductsController.createProduct
);

router.get("/admin", adminOrSubAdmin, ProductsController.getProductsByAdmin);
router.post("/batch", admin, ProductsController.bulkCreateProducts);

router.get("/", ProductsController.getAllProducts);
router.get("/:id", ProductsController.getProductById);
router.put(
  "/:id",
  admin,
  upload.fields([
    { name: "banner_image", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  ProductsController.updateProduct
);
router.delete("/:id", admin, ProductsController.deleteProduct);

module.exports = router;
