const { formatPercentage } = require("../../utils/numbers/formatPercentage");
const { getTrend } = require("./getTrend");

function getChange(current, prev) {
  const total_changes = current - prev;
  const percentage_change =
    prev === 0 ? (current === 0 ? 0 : 100) : (total_changes / prev) * 100;
  return {
    total_changes,
    percentage_change: formatPercentage(percentage_change),
    trend: getTrend(current, prev),
  };
}

module.exports = { getChange };
