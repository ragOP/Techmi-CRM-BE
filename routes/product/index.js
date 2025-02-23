const express = require("express");
const ProductsController = require("../../controllers/products/index.js");
const { admin } = require("../../middleware/authMiddleware.js");
const multer = require("multer");
const { storage } = require("../../config/multer.js");
const router = express.Router();

const upload = multer({ storage: storage });

router.post("/", admin, upload.array("images"), ProductsController.createProduct);
router.get("/", ProductsController.getAllProducts);
router.get("/:id", admin, ProductsController.getProductById);
router.put("/:id", admin, ProductsController.updateProduct);
router.delete("/:id", admin, ProductsController.deleteProduct);

module.exports = router;
