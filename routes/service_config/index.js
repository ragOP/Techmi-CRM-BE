const express = require("express");
const {
  getServicepageConfig,
  updateServicepageField,
} = require("../../controllers/service_config/index.js");

const router = express.Router();
const multer = require("multer");
const { storage } = require("../../config/multer.js");

const upload = multer({ storage: storage });

router.get("/", getServicepageConfig);
router.post("/", upload.single("file"), updateServicepageField);

module.exports = router;
