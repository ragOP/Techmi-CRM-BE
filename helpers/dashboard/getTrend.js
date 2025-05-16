function getTrend(current, prev) {
  if (current > prev) return "up";
  if (current < prev) return "down";
  return "no_change";
}

module.exports = {
  getTrend,
};
