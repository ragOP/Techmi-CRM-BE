const express = require("express");
const ServiceController = require("../../controllers/service/index.js");
const { admin } = require("../../middleware/authMiddleware.js");
const multer = require("multer");
const { storage } = require("../../config/multer.js");
const router = express.Router();
const upload = multer({ storage: storage });

router.route("/").post(admin, upload.array("images"), ServiceController.createService);
router.route("/:id").get(ServiceController.getServiceById);
router.route("/:id").get(admin, ServiceController.getServiceById);
router.route("/:id").put(admin, ServiceController.updateService);
router.route("/:id").delete(admin, ServiceController.deleteService);

module.exports = router;
