const express = require('express');
const router = express.Router();
const { createSale, getSales, getSalesSummary } = require('../controllers/saleController');
const { protect } = require('../middleware/auth');

router.route('/').post(protect, createSale).get(protect, getSales);
router.get('/summary', protect, getSalesSummary);

module.exports = router;
