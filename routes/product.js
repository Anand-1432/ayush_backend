const express = require("express");
const router = express.Router();
const multer = require('multer');

const upload = multer({ dest: 'product-excels' });

const {
  getProduct,
  newProduct,
  getSingleProducts,
  getAdminProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReview,
  deleteProductReview,
  createProductsByExcel,
} = require("../controllers/productController");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

router.route("/products").get(getProduct);
router.route("/admin/products").get(getAdminProduct);
router.route("/product/:id").get(getSingleProducts);

router
  .route("/admin/products/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);

router
  .route("/admin/products/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newProduct);

router.route("/review").put(isAuthenticatedUser, createProductReview);
router.route("/reviews").get(isAuthenticatedUser, getProductReview);
router.route("/reviews").delete(isAuthenticatedUser, deleteProductReview);


//---------------- create products by excel file -------------------//
router.route("/admin/products/excel/new").post(upload.single('file'), createProductsByExcel)

module.exports = router;
