const express = require("express");
const { admin } = require("../../middleware/authMiddleware.js");
const multer = require("multer");
const router = express.Router();
const AddressController = require("../../controllers/address/index.js");

router.get("/", admin, AddressController.getAllAddresses);
router.get("/user/:id", admin, AddressController.getAddressByUserId);
router.get("/:id", admin, AddressController.getAddressById);
router.post("/", admin, AddressController.createAddress);
router.put("/:id", admin, AddressController.updateAddress);
router.delete("/:id", admin, AddressController.deleteAddress);

module.exports = router;
