const express = require("express");
const {
  getHeaderConfig,
  updateHeaderField,
} = require("../../controllers/header_config/index.js");

const router = express.Router();
const multer = require("multer");
const { storage } = require("../../config/multer.js");

const upload = multer({ storage: storage });

router.get("/", getHeaderConfig);
router.post("/", upload.single("file"), updateHeaderField);

module.exports = router;
