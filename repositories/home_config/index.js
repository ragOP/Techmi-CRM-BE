const homepageConfigModel = require("../../models/homepageConfigModel");

const getConfig = async () => {
  return await homepageConfigModel.findOne({}) || new homepageConfigModel();
};

const updateField = async (field, value) => {
  const existingConfig = await homepageConfigModel.findOne({});

  if (existingConfig) {
    existingConfig[field] = value;
    return await existingConfig.save();
  } else {
    const newConfig = new homepageConfigModel({ [field]: value });
    return await newConfig.save();
  }
};

module.exports = { getConfig, updateField };
