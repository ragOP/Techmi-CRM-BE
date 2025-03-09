const express = require("express");
const router = express.Router();
const BlogController = require("../../controllers/blogs/index.js")
const { admin } = require("../../middleware/authMiddleware");
const multer = require("multer");
const { storage } = require("../../config/multer.js");

const upload = multer({ storage: storage });

router.post("/", admin, upload.single("banner"), BlogController.postBlogs);
router.get("/", BlogController.getBlogs);
router.get("/:id", BlogController.getSingleBlog)

module.exports = router;