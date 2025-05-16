const { getChange } = require("../../helpers/dashboard/getChanges");
const DashboardRepository = require("../../repositories/dashboard");

const getDashboardOverview = async ({
  start_date,
  end_date,
  compare = "last_week",
}) => {
  let mainStart = start_date ? new Date(start_date) : null;
  let mainEnd = end_date ? new Date(end_date) : null;

  let stats, lastStats;

  if (!mainStart && !mainEnd) {
    // All-time stats for totals
    stats = await DashboardRepository.getDashboardOverview({
      start_date: null,
      end_date: null,
    });

    // Last 7 days for "current" period
    const last7End = new Date();
    const last7Start = new Date();
    last7Start.setDate(last7End.getDate() - 7);

    // 7 days before that for "previous" period
    const prev7End = new Date(last7Start);
    prev7End.setDate(prev7End.getDate() - 1);
    const prev7Start = new Date(prev7End);
    prev7Start.setDate(prev7End.getDate() - 6);

    const last7Stats = await DashboardRepository.getDashboardOverview({
      start_date: last7Start,
      end_date: last7End,
    });
    const prev7Stats = await DashboardRepository.getDashboardOverview({
      start_date: prev7Start,
      end_date: prev7End,
    });

    // Use last7Stats and prev7Stats for changes
    stats = { ...stats, ...last7Stats };
    lastStats = prev7Stats;
  } else if (compare === "last_week") {
    // Use provided dates for current period
    stats = await DashboardRepository.getDashboardOverview({
      start_date: mainStart,
      end_date: mainEnd,
    });

    // Previous week for comparison
    let lastPeriodEnd = new Date(mainStart);
    lastPeriodEnd.setDate(lastPeriodEnd.getDate() - 1);
    let lastPeriodStart = new Date(lastPeriodEnd);
    lastPeriodStart.setDate(lastPeriodEnd.getDate() - 6);

    lastStats = await DashboardRepository.getDashboardOverview({
      start_date: lastPeriodStart,
      end_date: lastPeriodEnd,
    });
  }

  return {
    totalUsers: {
      label: "Total Users",
      key: "totalUsers",
      value: stats.totalUsers,
      changes: getChange(stats.usersLastWeek, lastStats.usersLastWeek),
    },
    totalOrders: {
      label: "Total Orders",
      key: "totalOrders",
      value: stats.totalOrders,
      changes: getChange(stats.ordersLastWeek, lastStats.ordersLastWeek),
    },
    totalRevenue: {
      label: "Total Revenue",
      key: "totalRevenue",
      value: stats.totalRevenue,
      changes: getChange(stats.revenueLastWeek, lastStats.revenueLastWeek),
    },
  };
};

const getSalesOverviewByMonth = async (year) => {
  const data = await DashboardRepository.getMonthlySalesOverview(year);
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Get current month index (0-based) for the selected year
  const now = new Date();
  const isCurrentYear = Number(year) === now.getFullYear();
  const maxMonth = isCurrentYear ? now.getMonth() + 1 : 12; // 1-based

  // Create a map for quick lookup
  const dataMap = {};
  data.forEach((item) => {
    dataMap[item.month] = item;
  });

  // Always return months up to current month (or all 12 for past years)
  return Array.from({ length: maxMonth }, (_, idx) => {
    const monthNum = idx + 1;
    const item = dataMap[monthNum];
    return {
      month: monthNames[idx],
      totalOrders: item ? item.totalOrders : 0,
      totalRevenue: item ? item.totalRevenue : 0,
    };
  });
};

const getSalesAndOrdersByDateRange = async (start_date, end_date) => {
  return await DashboardRepository.getSalesAndOrdersByDateRange(
    start_date,
    end_date
  );
};

module.exports = {
  getDashboardOverview,
  getSalesOverviewByMonth,
  getSalesAndOrdersByDateRange,
};
