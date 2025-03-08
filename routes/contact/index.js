const express = require("express");
const router = express.Router();
const ContactController = require("../../controllers/contact/index")
const { admin } = require("../../middleware/authMiddleware");

router.post("/", ContactController.postUserQuery);
router.get("/", admin, ContactController.getUserQueries);

module.exports = router;