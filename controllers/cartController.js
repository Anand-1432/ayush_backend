const catchAsyncError = require("../middlewares/catchAsyncError");
const User = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");
const Product = require("../models/product");

//getcart
exports.getCart = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  res.status(200).json({ cart: user.cart });
});
//cart
exports.cartHandler = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorHandler("user not found", 404));
  }

  const { type, id, itemsNumber } = req.body;

  const product = await Product.findById(id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  // Add or remove items in the cart
  const cartItemIndex = user.cart.items.findIndex((item) => item.id === id);

  if (type === "add") {
    if (cartItemIndex === -1) {
      // Item not in cart, add new item
      user.cart.items.push({ id, numOfItems: itemsNumber });
    } else {
      // Item already in cart, update quantity
      user.cart.items[cartItemIndex].numOfItems += itemsNumber;
    }
  } else if (type === "remove") {
    if (cartItemIndex === -1) {
      return next(new ErrorHandler("Item not in cart", 404));
    } else {
      // Item in cart, decrease quantity or remove item
      user.cart.items[cartItemIndex].numOfItems -= itemsNumber;
      if (user.cart.items[cartItemIndex].numOfItems <= 0) {
        user.cart.items.splice(cartItemIndex, 1); // Remove item if quantity is 0 or less
      }
    }
  } else {
    return next(new ErrorHandler("Invalid action type", 400));
  }

  // Save the updated user
  await user.save();

  res.status(200).json({
    success: true,
    cart: user.cart,
  });
});
