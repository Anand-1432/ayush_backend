const express = require("express");
const router = express.Router();
const {
  cartHandler,
  getCart,
  handleCartItems,
  removeFromCart,
  orderDetails,
} = require("../controllers/cartController");
const { isAuthenticatedUser } = require("../middlewares/auth");

router.route("/cart").post(isAuthenticatedUser, cartHandler);
router.route("/getcart").get(isAuthenticatedUser, getCart);
router.route("/handlecart").put(isAuthenticatedUser, handleCartItems);
router.route("/removeFromCart").patch(isAuthenticatedUser, removeFromCart);
router.route("/order-details").get(isAuthenticatedUser, orderDetails);

module.exports = router;
