const express = require("express");
const CategoryController = require("../../controllers/category/index.js");
const multer = require("multer");
const { storage } = require("../../config/multer.js");
const { admin } = require("../../middleware/auth/adminMiddleware.js");
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
router.put(
  "/:id",
  admin,
  upload.array("images"),
  CategoryController.updateCategory
);
router.delete("/:id", admin, CategoryController.deleteCategory);

module.exports = router;
