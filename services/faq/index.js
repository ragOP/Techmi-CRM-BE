const repository = require("../../repositories/faq");

const getFaq = async () => {
  return await repository.getFaq();
};

const createFaq = async (payload) => {
  return await repository.createFaq(payload);
};

const updateFaq = async (id, payload) => {
  const existing = await repository.updateFaq(id, payload);
  if (!existing) {
    throw new Error("Faq not found");
  }
  return await repository.updateFaq(id, payload);
};

const deleteFaq = async (id) => {
  return await repository.deleteFaq(id);
};

module.exports = {
  getFaq,
  createFaq,
  updateFaq,
  deleteFaq,
};
