const Faq = require("../../models/faqModel");

const getFaq = async () => {
  return await Faq.find();
};

const createFaq = async (data) => {
  return await Faq.create(data);
};

const updateFaq = async (id, data) => {
  return await Faq.findByIdAndUpdate(id, data, { new: true });
};

const deleteFaq = async (id) => {
  return await Faq.findByIdAndDelete(id);
};

const bulkUpdateFaq = async (bulkOperations) => {
  if (bulkOperations.length === 0) return;
  return await Faq.bulkWrite(bulkOperations);
};

module.exports = {
  getFaq,
  createFaq,
  updateFaq,
  deleteFaq,
  bulkUpdateFaq
};
