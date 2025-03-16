const ApiResponse = require("../../utils/ApiResponse.js");
const BlogRepositiories = require("../../repositories/blogs/index.js");
const { asyncHandler } = require("../../common/asyncHandler.js");

const addNewBlog = async (
  title,
  short_description,
  content,
  bannerImageUrl,
  service,
  isFeatured,
  adminId
) => {
  const data = {
    title,
    short_description,
    content,
    bannerImageUrl,
    published: true,
    service,
    isFeatured,
    author: adminId,
  };
  let blogs = await BlogRepositiories.createNewBlog(data);
  if (!blogs) {
    throw new ApiResponse(400, null, "Form not submitted", false);
  }
  return blogs;
};

const updateBlog = asyncHandler(async (id, data) => {
  const blog = await BlogRepositiories.getSingleBlogById(id);
  if (!blog) {
    throw new Error("Blog not found"); 
  }

  const updatedBlog = await BlogRepositiories.updateBlogById(id, data);
  return updatedBlog;
});

module.exports = {
  addNewBlog,
  updateBlog,
};
