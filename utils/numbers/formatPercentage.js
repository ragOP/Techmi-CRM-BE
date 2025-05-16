function formatPercentage(num) {
  if (Number.isInteger(num)) return num;
  return Number(num.toFixed(2));
}

module.exports = { formatPercentage };
