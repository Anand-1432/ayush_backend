const Razorpay = require("razorpay");
const dotenv = require("dotenv");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const user = require("../models/user");
dotenv.config({ path: "config/.env" });

const catchAsyncErrors = require("../middlewares/catchAsyncError");
const product = require("../models/product");
const order = require("../models/order");

// Configure Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.key_id, // Replace 'YOUR_KEY_ID' with your actual key id
  key_secret: process.env.key_secret, // Replace 'YOUR_KEY_SECRET' with your actual key secret
});

exports.createOrder = catchAsyncError(async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body; // Get amount and currency from the request body

    // Create order in Razorpay
    const options = {
      amount: amount * 100, // Razorpay expects the amount in the smallest currency unit, e.g., paise
      currency,
      receipt: `receipt_order_${Math.random()}`, // Generate a receipt identifier
      payment_capture: "1", // Automatically capture the payment
    };

    const order = await razorpay.orders.create(options);

    if (!order) return res.status(500).send("Some error occurred");

    // You can add additional details to order before sending it to frontend
    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

exports.orderDetails = catchAsyncError(async (req, res, next) => {
  const { street, zip, state, city, landmark } = req.body;

  if (!street || !zip || !state || !city || !landmark) {
    return next(new ErrorHandler("All fields are required.", 400));
  }

  const userData = await user.findById(req.user.id);

  if (!userData) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  const newOrder = {
    address: {
      street,
      zip,
      state,
      city,
      landmark,
    },
    orderStatus: "Not paid",
  };

  userData.orders.items.push(newOrder);
  await userData.save();

  res.status(200).json({
    success: true,
    message: "Order details saved successfully.",
    order: newOrder,
  });
});

//create a new order  => api/v1/order/new

exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
  } = req.body;

  const orderData = await order.create({
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
    paidAt: Date.now(),
    user: req.user._id,
  });
  // Clear the user's cart items
  userData.cart.items = [];

  // Save the updated user data
  await userData.save();

  res.status(200).json({
    success: true,
    orderData,
  });
});

//get single order => api/v1/order/:id

exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const orderData = await order
    .findById(req.params.id)
    .populate("user", "name email");

  if (!orderData) {
    return next(new ErrorHandler("No order found with this ID", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

//get logged in user orders => api/v1/orders/me

exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await order.find({ user: req.user.id });

  res.status(200).json({
    success: true,
    orders,
  });
});

//get all orders - admin => api/v1/admin/orders

exports.allOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await order.find({ user: req.user.id });

  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// update/process order  - admin => api/v1/admin/order/:id

exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const orderData = await order.findById(req.params.id);

  if (orderData.orderStatus === "Delivered") {
    return next(
      new ErrorHandler("Your product have already been delivered", 400)
    );
  }

  orderData.orderItems.forEach(async (item) => {
    await updateStock(item.product, item.quantity);
  });

  orderData.orderStatus = req.body.status;
  orderData.deliveredAt = Date.now();

  await order.save();

  res.status(200).json({
    success: true,
  });
});

async function updateStock(id, quantity) {
  const productData = await product.findById(id);

  productData.stock = productData.stock - quantity;

  await productData.save({ validateBeforeSave: false });
}

//delete order => api/v1/order/:id
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const orderData = await order
    .findById(req.params.id)
    .populate("user", "name email");

  if (!orderData) {
    return next(new ErrorHandler("No order found with this ID", 404));
  }

  await orderData.remove();

  res.status(200).json({
    success: true,
  });
});
