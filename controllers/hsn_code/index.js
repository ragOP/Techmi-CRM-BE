const { asyncHandler } = require("../../common/asyncHandler.js");
const HSNCodeService = require("../../services/hsn_code/index.js");
const ApiResponse = require("../../utils/ApiResponse.js");

const getAllHSNCodes = asyncHandler(async (req, res) => {
  const { start_date, end_date, search = "" } = req.query;

  const trimmedSearch = search ? search?.trim() : "";

  const query = {
    ...(start_date || end_date
      ? {
          createdAt: {
            ...(start_date && { $gte: new Date(start_date) }),
            ...(end_date && { $lte: new Date(end_date) }),
          },
        }
      : {}),
    ...(trimmedSearch
      ? {
          $or: [
            { hsn_code: { $regex: trimmedSearch, $options: "i" } },
            { description: { $regex: trimmedSearch, $options: "i" } },
          ],
        }
      : {}),
  };

  const { data, total } = await HSNCodeService.getAllHSNCodes({
    query,
  });
  res.json(
    new ApiResponse(
      200,
      { data, total },
      "HSN codes fetched successfully",
      true
    )
  );
});

const getHSNById = asyncHandler(async (req, res) => {
  const hsnCode = await HSNCodeService.getHSNById(req.params.id);
  if (!hsnCode) {
    return res
      .status(404)
      .json({ success: false, message: "HSN code not found" });
  }
  res.json(
    new ApiResponse(200, hsnCode, "HSN code fetched successfully", true)
  );
});

const createHSNCode = asyncHandler(async (req, res) => {
  const savedHSN = await HSNCodeService.createHSNCode(req.body);
  if (!savedHSN) {
    return res
      .status(400)
      .json({ success: false, message: "Failed to create HSN code" });
  }
  res.json(
    new ApiResponse(201, savedHSN, "HSN code created successfully", true)
  );
});

const updateHSNCode = asyncHandler(async (req, res) => {
  const updatedHSN = await HSNCodeService.updateHSNCode(
    req.params.id,
    req.body
  );
  if (!updatedHSN) {
    return res
      .status(404)
      .json({ success: false, message: "HSN code not found" });
  }

  res.json(
    new ApiResponse(200, updatedHSN, "HSN code updated successfully", true)
  );
});

const deleteHSNCode = asyncHandler(async (req, res) => {
  const deletedHSN = await HSNCodeService.deleteHSNCode(req.params.id);
  if (!deletedHSN) {
    return res
      .status(404)
      .json({ success: false, message: "HSN code not found" });
  }

  res.json(
    new ApiResponse(200, deletedHSN, "HSN code deleted successfully", true)
  );
});

module.exports = {
  getAllHSNCodes,
  getHSNById,
  createHSNCode,
  updateHSNCode,
  deleteHSNCode,
};
