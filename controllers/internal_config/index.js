const {
  fetchPharmaInternalPage,
  modifyPharmaInternalPage,
} = require("../../services/internal_config/index");
const { uploadMultipleFiles, uploadSingleFile } = require("../../utils/upload");

const getPharmaInternalPage = async (req, res) => {
  try {
    const config = await fetchPharmaInternalPage();
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching pharma page",
      error: error.message,
    });
  }
};

const updatePharmaInternalPage = async (req, res) => {
  try {
    let { field, value } = req.body;

    if (req.files) {
      if (field === "flyer1" || field === "aboutUsImage") {
        const tempValue = await uploadMultipleFiles(
          req.files,
          "uploads/images"
        );
        value = tempValue[0];
      } else {
        value = await uploadMultipleFiles(req.files, "uploads/images");
      }
    }
    if (!field || value === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Field and value are required" });
    }

    const updatedConfig = await modifyPharmaInternalPage(field, value);
    res.status(200).json({
      success: true,
      message: "Pharma internal page updated successfully",
      data: updatedConfig,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating pharma page",
      error: error.message,
    });
  }
};

module.exports = { getPharmaInternalPage, updatePharmaInternalPage };
