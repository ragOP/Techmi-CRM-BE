const express = require("express");
const router = express.Router();
const ContactController = require("../../controllers/contact/index");
const { admin, superAdmin } = require("../../middleware/auth/adminMiddleware");

router.post("/", ContactController.postUserQuery);
router.get("/", superAdmin, ContactController.getUserQueries);

module.exports = router;