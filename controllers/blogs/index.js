const { asyncHandler } = require("../../common/asyncHandler.js");
const ApiResponse = require("../../utils/ApiResponse.js");
const BlogService = require("../../services/blogs/index.js");
const BlogRepositories = require("../../repositories/blogs/index.js");
const { uploadSingleFile } = require("../../utils/upload/index.js");

const postBlogs = asyncHandler(async (req, res) => {
  const { title, short_description, content, category, isFeatured } = req.body;
  const bannerImageFile = req.file;

  if (
    !title ||
    !short_description ||
    !content ||
    !bannerImageFile ||
    !category
  ) {
    throw new ApiResponse(404, null, "Required Filled are missing", false);
  }

  const bannerImageUrl = await uploadSingleFile(
    bannerImageFile.path,
    "uploads/images"
  );

  const userMessage = await BlogService.addNewBlog(
    title,
    short_description,
    content,
    bannerImageUrl,
    category,
    isFeatured
  );
  return res.json(
    new ApiResponse(201, userMessage, "Blog created successfully", true)
  );
});

const getBlogs = asyncHandler(async (req, res) => {
  const { featured = false } = req.query;
  const userQueries = await BlogRepositories.getAllBlogs(featured);
  if (userQueries.length === 0) {
    throw new ApiResponse(500, null, "Error while fetching the blogs", false);
  }
  return res.json(
    new ApiResponse(201, userQueries, "Form submitted successfully", true)
  );
});

module.exports = {
  postBlogs,
  getBlogs,
};
