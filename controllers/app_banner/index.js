const { fetchAllAppBanner, modifyAllAppBanner, deleteAppBannerUsingId } = require("../../services/app_banner");
const { uploadMultipleFiles, uploadSingleFile } = require("../../utils/upload");
const mongoose = require("mongoose");
const ApiResponse = require("../../utils/ApiResponse");

const getAllAppBanner = async (req, res) => {
  try {
    const appBanners = await fetchAllAppBanner();
    res.status(200).json({ success: true, data: appBanners });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching app banner",
      error: error.message,
    });
  }
};

const updateAppBanners = async (req, res) => {
  try {
    let {fileArray} = req.files;

    let imageUrls = [];

    if(req.files.length > 0){
      imageUrls = await uploadMultipleFiles(req.files, "uploads/images");
    } else {
      imageUrls = await uploadSingleFile(req.files[0].path, "uploads/images");
    }

    let namesOfFiles = [];
    for (let i = 0; i < req.files.length; i++) {
      namesOfFiles.push(req.files[i].originalname);
    }

    const dataTOAddTODb = {
      url: imageUrls,
      name: namesOfFiles
    };

     const appBanners = await modifyAllAppBanner(dataTOAddTODb);

     res.status(200).json({
      success: true,
      message: "App Banners updated successfully",
      data: appBanners || [],
    });

  } catch (error) {
     res.status(500).json({
      success: false,
      message: "Error updating app banners",
      error: error.message,
    });
  }
}

const deleteAppBanner = async (req, res) => {
  try {
    let { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.json(new ApiResponse(400, null, "Invalid banner ID", false));

  }
  const banner = await deleteAppBannerUsingId(id);
  if (!banner) {
    return res.json(new ApiResponse(404, null, "Banner not found", false));
  }
  res.json(new ApiResponse(200, banner, "Banner deleted successfully", true));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting banners",
      error: error.message,
    });
  }
}

module.exports = {
  getAllAppBanner,
  updateAppBanners,
  deleteAppBanner
};
