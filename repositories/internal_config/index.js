const internalPageConfig = require("../../models/internalPageConfig");

const getPharmaInternalPage = async () => {
  return await internalPageConfig.findOne();
};

const updatePharmaInternalPage = async (field, value) => {
  let config = await internalPageConfig.findOne({});
  if (!config) {
    config = new internalPageConfig({});
  }

  if (field === "sliderImages" && Array.isArray(value)) {
    config.sliderImages = value;
  } else {
    config[field] = value;
  }

  return await config.save();
};

module.exports = { getPharmaInternalPage, updatePharmaInternalPage };
