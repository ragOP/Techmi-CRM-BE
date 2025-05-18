const { asyncHandler } = require("../../common/asyncHandler");
const DashboardService = require("../../services/dashboard");

const getDashboardOverview = asyncHandler(async (req, res) => {
  const { start_date, end_date } = req.query;

  const filterStart = start_date
    ? start_date
    : new Date("1900-01-01T00:00:00.000Z");
  const filterEnd = end_date ? end_date : new Date();

  const dashboardData = await DashboardService.getDashboardOverview({
    start_date: filterStart,
    end_date: filterEnd,
  });

  res.status(200).json({
    status: "success",
    data: dashboardData,
  });
});

const getSalesOverviewByMonth = async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  const data = await DashboardService.getSalesOverviewByMonth(year);
  res.json({ status: "success", data });
};

const getSalesAndOrdersByDateRange = async (req, res) => {
  const { start_date, end_date } = req.query;
  const data = await DashboardService.getSalesAndOrdersByDateRange(
    start_date,
    end_date
  );
  res.json({ status: "success", data });
};

module.exports = {
  getDashboardOverview,
  getSalesOverviewByMonth,
  getSalesAndOrdersByDateRange,
};
