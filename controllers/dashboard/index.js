const { asyncHandler } = require("../../common/asyncHandler");
const { convertToCSV } = require("../../helpers/products/convertToCSV");
const { convertToXLSX } = require("../../helpers/products/convertToXSLV");
const DashboardService = require("../../services/dashboard");
const { uploadPDF } = require("../../utils/upload");
const path = require("path");
const os = require("os");
const fs = require("fs/promises");
const ApiResponse = require("../../utils/ApiResponse");

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

const User = require("../../models/userModel"); // Adjust path as needed

const exportDashboardData = asyncHandler(async (req, res) => {
  const fileType = req.query.fileType?.toLowerCase() || "xlsx";
  const startDate = req.query.start_date
    ? new Date(req.query.start_date)
    : null;
  const endDate = req.query.end_date ? new Date(req.query.end_date) : null;
  const year = req.query.year || new Date().getFullYear();

  // Fetch all dashboard data
  const overview =
    (await DashboardService.getDashboardOverview({
      start_date: startDate || new Date("1900-01-01T00:00:00.000Z"),
      end_date: endDate || new Date(),
    })) || {};

  const salesByMonth =
    (await DashboardService.getSalesOverviewByMonth(year)) || [];
  let salesAndOrders = await DashboardService.getSalesAndOrdersByDateRange(
    startDate,
    endDate
  );
  // Ensure salesAndOrders is always an array
  if (!Array.isArray(salesAndOrders)) {
    salesAndOrders = salesAndOrders ? [salesAndOrders] : [];
  }

  // Fetch total users
  const totalUsers = await User.countDocuments();

  // Flatten and combine data for export
  const exportData = [
    { section: "Overview", ...overview },
    { section: "TotalUsers", totalUsers },
    ...salesByMonth.map((item) => ({ section: "SalesByMonth", ...item })),
    ...salesAndOrders.map((item) => ({
      section: "SalesAndOrders",
      ...item,
    })),
  ];

  let buffer;
  let mimeType = "";
  let filename = `dashboard_${Date.now()}.${fileType}`;

  if (fileType === "csv") {
    const content = convertToCSV(exportData);
    buffer = Buffer.from(content, "utf-8");
    mimeType = "text/csv";
  } else if (fileType === "xlsx") {
    buffer = convertToXLSX(exportData);
    mimeType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  } else {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Unsupported file type", false));
  }

  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, filename);
  await fs.writeFile(tempFilePath, buffer);

  const url = await uploadPDF(tempFilePath, "exports");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { url, mimeType, filename },
        "Dashboard data exported and uploaded successfully",
        true
      )
    );
});

module.exports = {
  getDashboardOverview,
  getSalesOverviewByMonth,
  getSalesAndOrdersByDateRange,
  exportDashboardData,
};
