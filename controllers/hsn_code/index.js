const HSNCodeService = require("../../services/hsn_code/index.js");

const getAllHSNCodes = async (req, res) => {
  try {
    const hsnCodes = await HSNCodeService.getAllHSNCodes();
    res.json({ success: true, data: hsnCodes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getHSNById = async (req, res) => {
  try {
    const hsnCode = await HSNCodeService.getHSNById(req.params.id);
    if (!hsnCode) {
      return res
        .status(404)
        .json({ success: false, message: "HSN code not found" });
    }
    res.json({ success: true, data: hsnCode });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createHSNCode = async (req, res) => {
  try {
    const savedHSN = await HSNCodeService.createHSNCode(req.body);
    res.status(201).json({ success: true, data: savedHSN });
  } catch (error) {
    const status = error.message === "HSN code already exists" ? 400 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

const updateHSNCode = async (req, res) => {
  try {
    const updatedHSN = await HSNCodeService.updateHSNCode(
      req.params.id,
      req.body
    );
    if (!updatedHSN) {
      return res
        .status(404)
        .json({ success: false, message: "HSN code not found" });
    }
    res.json({ success: true, data: updatedHSN });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteHSNCode = async (req, res) => {
  try {
    const deletedHSN = await HSNCodeService.deleteHSNCode(req.params.id);
    if (!deletedHSN) {
      return res
        .status(404)
        .json({ success: false, message: "HSN code not found" });
    }
    res.json({ success: true, message: "HSN code deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllHSNCodes,
  getHSNById,
  createHSNCode,
  updateHSNCode,
  deleteHSNCode,
};
