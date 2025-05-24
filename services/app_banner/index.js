const { getAllAppBanner, updateAppBanners, deleteAppBanner } = require("../../repositories/app_banner");

const fetchAllAppBanner = async () => {
    return await getAllAppBanner();
};

const modifyAllAppBanner = async (data) => {
    return await updateAppBanners(data);
};

const deleteAppBannerUsingId = async (id) => {
    return await deleteAppBanner(id);
};

module.exports = { fetchAllAppBanner, modifyAllAppBanner, deleteAppBannerUsingId };