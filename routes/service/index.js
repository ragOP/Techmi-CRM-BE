const express = require("express");
const ServiceController = require("../../controllers/service/index.js");
const { admin } = require("../../middleware/authMiddleware.js");
const multer = require("multer");
const { storage } = require("../../config/multer.js");
const router = express.Router();

const upload = multer({ storage: storage });

router.post("/", admin, upload.array("images"), ServiceController.createService);
router.get("/", ServiceController.getAllServices);
router.get("/:id", admin, ServiceController.getServiceById);
router.put("/:id", admin, ServiceController.updateService);
router.delete("/:id", admin, ServiceController.deleteService);

module.exports = router;
