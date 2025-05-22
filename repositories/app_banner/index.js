const appBannerModel = require("../../models/appBannerModel");

const getAllAppBanner = async () => {
  return await appBannerModel.find();
};

const updateAppBanners = async (dataTOAddTODb) => {
  let appBanner = await appBannerModel.findOne({});
  if (!appBanner) {
    appBanner = new appBannerModel({});
  }

    // Rebuild banner array properly
  const { name = [], url = [] } = dataTOAddTODb;

  if (name.length !== url.length) {
    throw new Error("Name and URL array lengths do not match.");
  }

  const bannerData = name.map((n, i) => ({
    name: n,
    url: url[i]
  }));

   appBanner.banner = [...appBanner.banner, ...bannerData];

  return await appBanner.save();
};

const deleteAppBanner = async (id) => {
  const appBanner = await appBannerModel.findOne();
  if (!appBanner) {
    throw new Error("AppBanner document not found.");
  }

  // Remove banner with matching _id from the array
  appBanner.banner = appBanner.banner.filter(
    (b) => b._id.toString() !== id
  );

  return await appBanner.save();
};

module.exports = { getAllAppBanner, updateAppBanners, deleteAppBanner };
