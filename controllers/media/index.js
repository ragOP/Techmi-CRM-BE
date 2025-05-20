const { asyncHandler } = require("../../common/asyncHandler.js");
const ApiResponse = require("../../utils/ApiResponse.js");
const { uploadFileBuffer } = require("../../utils/upload/index.js");

// For single file upload via multipart/form-data (e.g., from a form)
const uploadMedia = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "No file uploaded", false));
  }
  const url = await uploadFileBuffer(
    file.buffer,
    file.originalname,
    file.mimetype
  );
  return res
    .status(200)
    .json(new ApiResponse(200, { url }, "File uploaded successfully", true));
});

// For buffer upload (e.g., from product export)
const uploadBuffer = async (buffer, filename, mimetype) => {
  // This function can be imported and used in other controllers
  return await uploadFileBuffer(buffer, filename, mimetype);
};

module.exports = {
  uploadMedia,
  uploadBuffer,
};
