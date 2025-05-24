const express = require("express");
const router = express.Router();
const TestimonialsController = require("../../controllers/testimonials");
const multer = require("multer");
const { storage } = require("../../config/multer.js");
const { adminOrSuperAdmin } = require("../../middleware/auth/adminMiddleware");

const upload = multer({ storage: storage });

router.get("/", TestimonialsController.getAllTestimonials);
router.get("/:id", TestimonialsController.getTestimonialById);

router.post(
  "/",
  adminOrSuperAdmin,
  upload.single("image"),
  TestimonialsController.createTestimonial
);

router.put(
  "/:id",
  adminOrSuperAdmin,
  upload.single("image"),
  TestimonialsController.updateTestimonial
);

router.delete(
  "/:id",
  adminOrSuperAdmin,
  TestimonialsController.deleteTestimonial
);

module.exports = router;
