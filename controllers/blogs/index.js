const { asyncHandler } = require("../../common/asyncHandler.js");
const mongoose = require("mongoose");
const ApiResponse = require("../../utils/ApiResponse.js");
const BlogService = require("../../services/blogs/index.js");
const BlogRepositories = require("../../repositories/blogs/index.js");
const { uploadSingleFile } = require("../../utils/upload/index.js");

const postBlogs = asyncHandler(async (req, res) => {
  const adminId = req.admin.id;

  if (!adminId) {
    return res.json(new ApiResponse(404, null, "Not authorized"));
  }

  const { title, short_description, content, service, isFeatured } = req.body;
  const bannerImageFile = req.file;

  if (
    !title ||
    !short_description ||
    !content ||
    !bannerImageFile ||
    !service
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
    service,
    isFeatured,
    adminId
  );
  return res.json(
    new ApiResponse(201, userMessage, "Blog created successfully", true)
  );
});

const getBlogs = asyncHandler(async (req, res) => {
  const {
    search,
    page,
    per_page = 50,
    featured = false,
    published = false,
  } = req.query;

  const filters = {
    ...(search && { title: { $regex: search, $options: "i" } }),
    ...(featured && { isFeatured: featured === "true" }),
    ...(published && { published: published === "true" }),
  };
  
  const blogs = await BlogRepositories.getAllBlogs({
    filters,
    page: parseInt(page),
    per_page: parseInt(per_page),
  });

  if (!blogs || blogs.length === 0) {
    return next(new ApiError(404, "No blogs found"));
  }

  return res.json(
    new ApiResponse(201, blogs, "Blogs Fetched successfully", true)
  );
});

const getSingleBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.json(
      new ApiResponse(400, null, "Invalid blog ID format", false)
    );
  }
  const blog = await BlogRepositories.getSingleBlogById(id);
  if (!blog) {
    return res.json(new ApiResponse(404, null, "No Blog Found", false));
  }
  return res.json(
    new ApiResponse(201, blog, "Blog Fetched successfully", true)
  );
});

const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.json(
      new ApiResponse(400, null, "Invalid blog ID format", false)
    );
  }

  const bannerImageFile = req.file;

  const bannerImageUrl = await uploadSingleFile(
    bannerImageFile.path,
    "uploads/images"
  );

  const data = {
    ...req.body,
    bannerImageUrl,
  };

  const blog = await BlogService.updateBlog(id, data);

  return res.json(
    new ApiResponse(201, blog, "Blog Updated successfully", true)
  );
});

const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.json(
      new ApiResponse(400, null, "Invalid blog ID format", false)
    );
  }
  const blog = await BlogRepositories.getSingleBlogById(id);

  if (!blog) {
    return res.json(new ApiResponse(404, null, "No Blog Found", false));
  }
  await BlogRepositories.deleteBlogById(id);
  return res.json(
    new ApiResponse(201, null, "Blog Deleted successfully", true)
  );
});

module.exports = {
  postBlogs,
  getBlogs,
  getSingleBlog,
  updateBlog,
  deleteBlog,
};
