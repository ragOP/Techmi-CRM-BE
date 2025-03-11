const express = require("express");
const {
  getPharmaInternalPage,
  updatePharmaInternalPage,
} = require("../../controllers/internal_config/index");
const multer = require("multer");
const { storage } = require("../../config/multer.js");

const upload = multer({ storage: storage });

const router = express.Router();

router.get("/", getPharmaInternalPage);
router.post("/", upload.any(), updatePharmaInternalPage);

module.exports = router;
