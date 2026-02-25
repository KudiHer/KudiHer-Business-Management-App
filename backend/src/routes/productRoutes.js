const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.route('/').post(protect, createProduct).get(protect, getProducts);
router.route('/:id').get(protect, getProductById).put(protect, updateProduct).delete(protect, deleteProduct);

module.exports = router;
