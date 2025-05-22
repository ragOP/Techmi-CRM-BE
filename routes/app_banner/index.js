const express = require("express");
const {
  getAllAppBanner,
  updateAppBanners,
  deleteAppBanner,
} = require("../../controllers/app_banner");
const multer = require("multer");
const { storage } = require("../../config/multer.js");

const upload = multer({ storage: storage });

const router = express.Router();

router.get("/", getAllAppBanner);
router.post("/", upload.any(), updateAppBanners);
router.delete("/:id", deleteAppBanner);

module.exports = router;
