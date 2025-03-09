const express = require("express");
const ReviewController = require("../../controllers/review/index.js");
const { user } = require("../../middleware/authMiddleware.js");
const router = express.Router();

router.get("/", user, ReviewController.getAllReviews);
router.post("/", user, ReviewController.postReviews);

module.exports = router;