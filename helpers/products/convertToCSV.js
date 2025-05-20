const convertToCSV = (data) => {
  const fields = Object.keys(data[0] || {});
  const header = fields.join(",");
  const rows = data.map((item) =>
    fields
      .map((f) => `"${(item[f] ?? "").toString().replace(/"/g, '""')}"`)
      .join(",")
  );
  return [header, ...rows].join("\n");
};

module.exports = { convertToCSV };
