const User = require("../../models/userModel");
const Order = require("../../models/orderModel");

const getDashboardOverview = async ({ start_date, end_date }) => {
  const [totalUsers, totalOrders, totalRevenueAgg] = await Promise.all([
    User.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
  ]);
  const totalRevenue = totalRevenueAgg[0]?.total
    ? parseFloat(totalRevenueAgg[0].total.toString())
    : 0;

  // Last week stats
  const lastWeekFilter = {};
  if (start_date)
    lastWeekFilter.createdAt = {
      ...lastWeekFilter.createdAt,
      $gte: new Date(start_date),
    };
  if (end_date)
    lastWeekFilter.createdAt = {
      ...lastWeekFilter.createdAt,
      $lte: new Date(end_date),
    };

  const [usersLastWeek, ordersLastWeek, revenueLastWeekAgg] = await Promise.all(
    [
      User.countDocuments(lastWeekFilter),
      Order.countDocuments(lastWeekFilter),
      Order.aggregate([
        { $match: lastWeekFilter },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]
  );
  const revenueLastWeek = revenueLastWeekAgg[0]?.total
    ? parseFloat(revenueLastWeekAgg[0].total.toString())
    : 0;

  return {
    totalUsers,
    totalOrders,
    totalRevenue,
    usersLastWeek,
    ordersLastWeek,
    revenueLastWeek,
  };
};

const getMonthlySalesOverview = async (year = new Date().getFullYear()) => {
  const pipeline = [
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01T00:00:00.000Z`),
          $lte: new Date(`${year}-12-31T23:59:59.999Z`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
    {
      $project: {
        month: "$_id",
        totalOrders: 1,
        totalRevenue: 1,
        _id: 0,
      },
    },
  ];

  const data = await Order.aggregate(pipeline);

  const result = Array.from({ length: 12 }, (_, i) => {
    const found = data.find((d) => d.month === i + 1);
    return {
      month: i + 1,
      totalOrders: found ? found.totalOrders : 0,
      totalRevenue: found ? parseFloat(found.totalRevenue) : 0,
    };
  });

  return result;
};

async function getSalesAndOrdersByDateRange(start_date, end_date) {
  const filter = {};
  if (start_date)
    filter.createdAt = { ...filter.createdAt, $gte: new Date(start_date) };
  if (end_date)
    filter.createdAt = { ...filter.createdAt, $lte: new Date(end_date) };

  const [totalOrders, revenueAgg] = await Promise.all([
    Order.countDocuments(filter),
    Order.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
  ]);
  const totalRevenue = revenueAgg[0]?.total
    ? parseFloat(revenueAgg[0].total.toString())
    : 0;

  return {
    totalOrders,
    totalRevenue,
  };
}

module.exports = {
  getDashboardOverview,
  getMonthlySalesOverview,
  getSalesAndOrdersByDateRange,
};
