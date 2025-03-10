const headerConfigModel = require("../../models/headerConfigModel");

const getConfig = async () => {
  return await headerConfigModel.findOne({}) || new headerConfigModel();
};

const updateField = async (field, value) => {
  const existingConfig = await headerConfigModel.findOne({});

  if (existingConfig) {
    existingConfig[field] = value;
    return await existingConfig.save();
  } else {
    const newConfig = new headerConfigModel({ [field]: value });
    return await newConfig.save();
  }
};

module.exports = { getConfig, updateField };
