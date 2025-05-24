const mongoose = require("mongoose");

const AppBannerSchema = new mongoose.Schema(
  {
    banner: [
      {
        name: String,
        url: String
      }
    ]
  },
  { timestamps: true }
);


module.exports = mongoose.model("AppBannerSchema", AppBannerSchema);
