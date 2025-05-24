const Faq = require("../../models/faqModel");
const service = require("../../services/faq");
const ApiResponse = require("../../utils/ApiResponse");

const getFaq = async (req, res) => {
  const result = await service.getFaq();
  if (!result) {
    return res.json(new ApiResponse(404, null, "Faq not found", false));
  }
  res.json(new ApiResponse(200, result, "Faq fetched successfully", true));
};

const createFaq = async (req, res) => {
  const payload = {
    ...req.body,
  };
  const maxOrderFaq = await Faq.findOne().sort({ order: -1 }).limit(1);

  // Determine new order value
  const newOrder = maxOrderFaq ? maxOrderFaq.order + 1 : 1;

  payload.order = newOrder;
  const result = await service.createFaq(payload);
  res.json(new ApiResponse(200, result, "Faq created successfully", true));
};

const updateFaq = async (req, res) => {
  const { id } = req.params;
  const result = await service.updateFaq(id, req.body);
  res.json(new ApiResponse(200, result, "Faq updated successfully", true));
};

const deleteFaq = async (req, res) => {
  const { id } = req.params;
  const result = await service.deleteFaq(id);
  res.json(new ApiResponse(200, result, "Faq deleted successfully", true));
};

const batchUpdateFaq = async (req, res) => {
  const updatedFaqs = req.body;
  if (!Array.isArray(updatedFaqs)) {
    return res.json(new ApiResponse(400, null, "Invalid request data", false));
  }

  const result = await service.bulkUpdateFaq(updatedFaqs);
  res.json(new ApiResponse(200, result, "Faqs updated successfully", true));
};

module.exports = {
  getFaq,
  createFaq,
  updateFaq,
  deleteFaq,
  batchUpdateFaq,
};
