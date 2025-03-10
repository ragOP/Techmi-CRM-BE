const { asyncHandler } = require("../../common/asyncHandler");
const homepageService = require("../../services/home_config/index");
const ApiResponse = require("../../utils/ApiResponse");
const { uploadSingleFile } = require("../../utils/upload");

const getHomePageConfig = asyncHandler(async (req, res) => {
  const config = await homepageService.getHomepageConfig();
  return res.json(new ApiResponse(200, config, "All Data Fetched", true));
});

const updateHomePageField = asyncHandler(async (req, res) => {
  const { field, value } = req.body;

  if (!field) {
    return res.json(new ApiResponse(404, null, "Fields are missing", false));
  }

  let updatedValue = value;

  if (req.file) {
    updatedValue = await uploadSingleFile(req.file.path, "uploads/images");
  }

  const updatedConfig = await homepageService.updateHomepageField(
    field,
    updatedValue
  );

  return res.json(
    new ApiResponse(200, updatedConfig, "Updated Sucessfully", true)
  );
});

module.exports = { getHomePageConfig, updateHomePageField };
