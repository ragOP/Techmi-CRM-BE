const express = require("express");
const CategoryController = require("../../controllers/category/index.js");
const { admin } = require("../../middleware/authMiddleware.js");
const multer = require("multer");
const { storage } = require("../../config/multer.js");
const router = express.Router();

const upload = multer({ storage: storage });

router.post(
  "/",
  admin,
  upload.array("images"),
  CategoryController.createCategory
);
router.get("/", CategoryController.getAllCategory);
router.get("/:id", admin, CategoryController.getCategoryById);
router.patch("/:id", admin, CategoryController.updateCategory);
router.delete("/:id", admin, CategoryController.deleteCategory);

module.exports = router;
