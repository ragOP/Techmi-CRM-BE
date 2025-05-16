const { asyncHandler } = require("../../common/asyncHandler.js");
const ApiResponse = require("../../utils/ApiResponse.js");
const ConatactService = require("../../services/contact/index.js");
const ContactRepositories = require("../../repositories/contact/index.js");
const postUserQuery = asyncHandler(async (req, res) => {
  const { name, email, subject } = req.body;

  if (!name || !email || !subject) {
    throw new ApiResponse(404, null, "Required Filled are missing", false);
  }
  const userMessage = await ConatactService.submitUserForm(
    name,
    email,
    subject
  );
  return res.json(
    new ApiResponse(201, userMessage, "Form submitted successfully", true)
  );
});

const getUserQueries = asyncHandler(async (req, res) => {
  const userQueries = await ContactRepositories.getAllUserQueries();
  if (userQueries.length === 0) {
    throw new ApiResponse(500, null, "Error while fetching the form", false);
  }
  return res.json(
    new ApiResponse(201, userQueries, "Form submitted successfully", true)
  );
});

const deleteUserQueries = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!id) {
    throw new ApiResponse(404, null, "Required Filled are missing", false);
  }
  const userMessage = await ContactRepositories.deleteUserQueries(id);
  return res.json(
    new ApiResponse(201, userMessage, "Form submitted successfully", true)
  );
});

module.exports = {
  postUserQuery,
  getUserQueries,
  deleteUserQueries,
};
