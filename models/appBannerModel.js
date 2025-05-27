const mongoose = require("mongoose");

const AppBannerSchema = new mongoose.Schema(
  {
    banner: [
      {
        name: String,
        url: String,
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      }
    ]
  },
  { timestamps: true }
);


module.exports = mongoose.model("AppBannerSchema", AppBannerSchema);
