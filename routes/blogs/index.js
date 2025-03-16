const express = require("express");
const router = express.Router();
const BlogController = require("../../controllers/blogs/index.js");
const multer = require("multer");
const { storage } = require("../../config/multer.js");
const {
  admin,
  superAdmin,
} = require("../../middleware/auth/adminMiddleware.js");

const upload = multer({ storage: storage });

router.post(
  "/",
  superAdmin,
  upload.single("bannerImageUrl"),
  BlogController.postBlogs
);
router.get("/", BlogController.getBlogs);
router.get("/:id", BlogController.getSingleBlog);
router.put(
  "/:id",
  superAdmin,
  upload.single("bannerImageUrl"),
  BlogController.updateBlog
);
router.delete("/:id", superAdmin, BlogController.deleteBlog);

module.exports = router;
