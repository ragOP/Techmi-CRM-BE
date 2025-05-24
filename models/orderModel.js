const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: new mongoose.Schema({
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      price: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
      },
      discounted_price: {
        type: mongoose.Schema.Types.Decimal128,
        default: null,
      },
      salesperson_discounted_price: {
        type: mongoose.Schema.Types.Decimal128,
        default: null,
      },
      dnd_discounted_price: {
        type: mongoose.Schema.Types.Decimal128,
        default: null,
      },
      banner_image: String,
    }),
    required: true,
    ref: "Product",
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  tax_amount: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
  },
  cess_amount: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
  },
  coupon_discount: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
  },
  total_amount: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
  },
});

const OrderAddressSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  pincode: String,
  locality: String,
  address: String,
  city: String,
  state: String,
  landmark: String,
  alternatePhone: String,
  addressType: String,
});

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [OrderItemSchema],
    address: OrderAddressSchema,
    totalAmount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    discountedPrice: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    discountedPriceAfterCoupon: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    priceAfterTax: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    cashfree_order: {
      id: {
        type: String,
        required: true,
      },
    },
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: false,
    },
    orderedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

OrderSchema.set("toJSON", {
  transform: (doc, ret) => {
    // Convert totalAmount to number
    ret.totalAmount = ret.totalAmount
      ? parseFloat(ret.totalAmount.toString())
      : 0;

    ret.discountedPrice = ret.discountedPrice
      ? parseFloat(ret.discountedPrice.toString())
      : 0;

    ret.discountedPriceAfterCoupon = ret.discountedPriceAfterCoupon
      ? parseFloat(ret.discountedPriceAfterCoupon.toString())
      : 0;

    ret.priceAfterTax = ret.priceAfterTax
      ? parseFloat(ret.priceAfterTax.toString())
      : 0;

    // Ensure ret.items is an array before mapping
    if (Array.isArray(ret.items)) {
      ret.items = ret.items.map((item) => ({
        ...item,
        product: {
          ...item.product,
          price: parseFloat(item.product.price.toString()),
          discounted_price: item.product.discounted_price
            ? parseFloat(item.product.discounted_price.toString())
            : null,
          salesperson_discounted_price: item.product
            .salesperson_discounted_price
            ? parseFloat(item.product.salesperson_discounted_price.toString())
            : null,
          dnd_discounted_price: item.product.dnd_discounted_price
            ? parseFloat(item.product.dnd_discounted_price.toString())
            : null,
          tax_amount: item.tax_amount
            ? parseFloat(item.tax_amount.toString())
            : 0,
          cess_amount: item.cess_amount
            ? parseFloat(item.cess_amount.toString())
            : 0,
          total_amount: item.total_amount
            ? parseFloat(item.total_amount.toString())
            : 0,
          coupon_discount: item.coupon_price
            ? parseFloat(item.coupon_price.toString())
            : 0,
        },
      }));
    }

    return ret;
  },
});

module.exports = mongoose.model("Order", OrderSchema);
