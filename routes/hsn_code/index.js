const express = require("express");
const router = express.Router();

const HsnCodeController = require("../../controllers/hsn_code/index.js");

router.get("/", HsnCodeController.getAllHSNCodes);
router.get("/:id", HsnCodeController.getHSNById);
router.post("/", HsnCodeController.createHSNCode);
router.put("/:id", HsnCodeController.updateHSNCode);
router.delete("/:id", HsnCodeController.deleteHSNCode);

module.exports = router