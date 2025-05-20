const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer(); // memory storage for buffer access
const MediaController = require("../../controllers/media/index.js");

router.post("/upload", upload.single("file"), MediaController.uploadMedia);

module.exports = router;
