const express = require("express");
const ServiceController = require("../../controllers/service/index.js");
const { admin } = require("../../middleware/authMiddleware.js");
const router = express.Router();

router.post("/", admin, ServiceController.createService);
router.get("/", ServiceController.getAllServices);
router.get("/:id", admin, ServiceController.getServiceById);
router.put("/:id", admin, ServiceController.updateService);
router.delete("/:id", admin, ServiceController.deleteService);

module.exports = router;
