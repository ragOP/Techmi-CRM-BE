const express = require("express");
const {
  getHomePageConfig,
  updateHomePageField,
} = require("../../controllers/home_config/index");

const router = express.Router();
const multer = require("multer");
const { storage } = require("../../config/multer.js");

const upload = multer({ storage: storage });

router.get("/", getHomePageConfig);
router.post("/", upload.single("file"), updateHomePageField);

module.exports = router;
