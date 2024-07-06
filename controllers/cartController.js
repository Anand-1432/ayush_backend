const catchAsyncError = require("../middlewares/catchAsyncError");
const User = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");
const Product = require("../models/product");
const product = require("../models/product");

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

exports.handleCartItems = catchAsyncError(async (req, res, next) => {
  const { id, type } = req.body;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    const stock = product.stock;

    // Retrieve user by ID
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Ensure user.cart is initialized and has items array
    if (!user.cart) {
      user.cart = { items: [] };
    }

    let cartItem = user.cart.items.find((item) => item.id.toString() === id);

    if (type === "add") {
      if (!cartItem) {
        if (1 > stock) {
          return next(
            new ErrorHandler(`Not enough stock available (${stock} items)`, 400)
          );
        }

        user.cart.items.push({ id: id, numOfItems: 1 });
      } else {
        const newQuantity = cartItem.numOfItems + 1;
        if (newQuantity > stock) {
          return next(
            new ErrorHandler(`Not enough stock available (${stock} items)`, 400)
          );
        }

        cartItem.numOfItems = newQuantity;
      }
    } else if (type === "remove") {
      if (cartItem) {
        if (cartItem.numOfItems > 1) {
          cartItem.numOfItems -= 1;
        } else {
          // If only 1 item left, remove it from the cart
          user.cart.items = user.cart.items.filter(
            (item) => item.id.toString() !== id
          );
        }
      } else {
        return next(new ErrorHandler("Item not found in cart", 404));
      }
    } else {
      return next(new ErrorHandler("Invalid operation type", 400));
    }

    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Cart updated successfully" });
  } catch (err) {
    next(err);
  }
});

exports.removeFromCart = catchAsyncError(async (req, res, next) => {
  const { productId } = req.body;

  try {
    // Retrieve user by ID
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Find the index of the item to remove
    const indexToRemove = user.cart.items.findIndex(
      (item) => item.id.toString() === productId
    );

    if (indexToRemove !== -1) {
      // Remove the item from user.cart.items array
      user.cart.items.splice(indexToRemove, 1);

      // Save the updated user document
      await user.save();

      // Send success response
      return res
        .status(200)
        .json({ success: true, message: "Item removed from cart" });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
});

exports.orderDetails = catchAsyncError(async (req, res, next) => {
  const userdata = await User.findById(req.user.id);
  if (!userdata) {
    return next(new ErrorHandler("User not found", 404));
  }

  let cartLen = 0;

  let subtotal = 0;
  let shippingPrice = 0;
  let tax = 0;
  let couponDiscount = 0;

  await Promise.all(
    userdata.cart.items.map(async (item) => {
      cartLen += item.numOfItems;
      const product = await Product.findById(item.id);
      if (product) {
        subtotal += product.discountAmount * item.numOfItems;
      }
    })
  );

  if (subtotal < 5000) {
    shippingPrice = cartLen * 200;
    subtotal += shippingPrice;
  }

  tax = subtotal * 0.14; //14 % tax
  subtotal += tax;

  res.status(200).json({
    success: true,
    cartLen,
    shippingPrice,
    subtotal,
    tax,
    couponDiscount,
  });
});
