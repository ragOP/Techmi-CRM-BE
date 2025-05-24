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

const bulkUpdateFaq = async (faqList) => {
  if (faqList.length === 0) return;
  const bulkOperations = faqList.map((faq) => ({
    updateOne: {
      filter: { _id: faq._id },
      update: {
        $set: {
          question: faq.question,
          answer: faq.answer,
          created_by_admin: faq.created_by_admin,
           order: faq.order,
        },
      },
    },
  }));

  return await repository.bulkUpdateFaq(bulkOperations);
};

module.exports = {
  getFaq,
  createFaq,
  updateFaq,
  deleteFaq,
  bulkUpdateFaq,
};
