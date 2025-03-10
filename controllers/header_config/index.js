const { asyncHandler } = require("../../common/asyncHandler");
const headerService = require("../../services/header_config/index");
const ApiResponse = require("../../utils/ApiResponse");
const { uploadSingleFile } = require("../../utils/upload");

const getHeaderConfig = asyncHandler(async (req, res) => {
  const config = await headerService.getHeaderConfig();
  return res.json(new ApiResponse(200, config, "All Data Fetched", true));
});

const updateHeaderField = asyncHandler(async (req, res) => {
  const { field, value } = req.body;

  if (!field) {
    return res.json(new ApiResponse(404, null, "Fields are missing", false));
  }

  let updatedValue = value;

  if (req.file) {
    updatedValue = await uploadSingleFile(req.file.path, "uploads/images");
  }

  const updatedConfig = await headerService.updateHeaderField(
    field,
    updatedValue
  );

  return res.json(
    new ApiResponse(200, updatedConfig, "Updated Sucessfully", true)
  );
});

module.exports = { getHeaderConfig, updateHeaderField };
