const mongoose = require("mongoose");

const getProductPrice = ({
  price,
  discountedPrice,
  salespersonDiscountedPrice,
  dndDiscountedPrice,
  role,
}) => {
  const parseValue = (value) => {
    if (value !== null && value !== undefined) {
      return parseFloat(value.toString());
    }
    return 0;
  };

  const parsedPrice = parseValue(price);
  const parsedDiscountedPrice = parseValue(discountedPrice);
  const parsedSalespersonDiscountedPrice = parseValue(
    salespersonDiscountedPrice
  );
  const parsedDndDiscountedPrice = parseValue(dndDiscountedPrice);

  if (role === "salesperson") {
    return parsedSalespersonDiscountedPrice > 0
      ? parsedSalespersonDiscountedPrice
      : parsedDiscountedPrice > 0
      ? parsedDiscountedPrice
      : parsedPrice;
  } else if (role === "dnd") {
    return parsedDndDiscountedPrice > 0
      ? parsedDndDiscountedPrice
      : parsedDiscountedPrice > 0
      ? parsedDiscountedPrice
      : parsedPrice;
  } else {
    return parsedDiscountedPrice > 0 ? parsedDiscountedPrice : parsedPrice;
  }
};

module.exports = {
  getProductPrice,
};
