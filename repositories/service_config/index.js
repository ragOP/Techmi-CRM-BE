const servicepageConfigModel = require("../../models/servicepageConfigModel");

const getConfig = async () => {
  return await servicepageConfigModel.findOne({}) || new servicepageConfigModel();
};

const updateField = async (field, value) => {
  const existingConfig = await servicepageConfigModel.findOne({});

  if (existingConfig) {
    existingConfig[field] = value;
    return await existingConfig.save();
  } else {
    const newConfig = new servicepageConfigModel({ [field]: value });
    return await newConfig.save();
  }
};

module.exports = { getConfig, updateField };