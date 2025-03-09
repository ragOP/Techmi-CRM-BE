const express = require("express");
const ServiceController = require("../../controllers/service/index.js");
const { superAdmin } = require("../../middleware/authMiddleware.js");
const multer = require("multer");
const { storage } = require("../../config/multer.js");
const router = express.Router();

const upload = multer({ storage: storage });

router.post(
  "/",
  superAdmin,
  upload.array("images"),
  ServiceController.createService
);
router.get("/", ServiceController.getAllServices);
router.get("/:id", superAdmin, ServiceController.getServiceById);
router.put(
  "/:id",
  superAdmin,
  upload.array("images"),
  ServiceController.updateService
);
router.delete("/:id", superAdmin, ServiceController.deleteService);

module.exports = router;
