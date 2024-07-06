const express = require("express");
const { isAuthenticatedUser } = require("../middlewares/auth");
const { createOrder, newOrder } = require("../controllers/orderController");
const router = express.Router();

router.route("/payment").post(isAuthenticatedUser, createOrder);
router.route("/order/new").post(isAuthenticatedUser, newOrder);
module.exports = router;
