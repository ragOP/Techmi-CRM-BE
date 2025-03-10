const servicepageRepo = require("../../repositories/service_config/index");

const getServicepageConfig = async () => {
  return await servicepageRepo.getConfig();
};

const updateServicepageField = async (field, value) => {
  return await servicepageRepo.updateField(field, value);
};

module.exports = { getServicepageConfig, updateServicepageField };