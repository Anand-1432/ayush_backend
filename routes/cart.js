const express = require("express");
const router = express.Router();
const { cartHandler, getCart } = require("../controllers/cartController");
const { isAuthenticatedUser } = require("../middlewares/auth");

router.route("/cart").post(isAuthenticatedUser, cartHandler);
router.route("/getcart").get(isAuthenticatedUser, getCart);

module.exports = router;
