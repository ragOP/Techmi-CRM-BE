const { asyncHandler } = require("../../common/asyncHandler");

const getDashboardData = asyncHandler(async (req, res) => {
  const { adminId } = req.params;

  const dashboardData = {
    totalUsers: 1000,
    totalOrders: 500,
    totalRevenue: 20000,
  };

  res.status(200).json({
    status: "success",
    data: dashboardData,
  });
});

module.exports = {
  getDashboardData,
};
