const ApiResponse = require("../../utils/ApiResponse.js");
const BlogRepositiories = require("../../repositories/blogs/index.js");
const { asyncHandler } = require("../../common/asyncHandler.js");

const addNewBlog = async (
  title,
  short_description,
  content,
  bannerImageUrl,
  service,
  isFeatured
) => {
  const data = {
    title,
    short_description,
    content,
    bannerImageUrl,
    author: "admin",
    published: true,
    service,
    isFeatured,
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
    return res.json(new ApiResponse(404, null, "No Blog Found", false));
  }
  const updatedBlog = await BlogRepositiories.updateBlogById(id, data);
  return res.json(
    new ApiResponse(201, updatedBlog, "Blog Updated successfully", true)
  );
});

module.exports = {
  addNewBlog,
  updateBlog,
};
