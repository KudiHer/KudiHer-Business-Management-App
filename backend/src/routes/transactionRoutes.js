const express = require('express');
const router = express.Router();
const {
  createTransaction,
  createIncomeTransaction,
  createExpenseTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.route('/').post(protect, createTransaction).get(protect, getTransactions);
router.post('/income', protect, createIncomeTransaction);
router.post('/expense', protect, createExpenseTransaction);
router.route('/:id').put(protect, updateTransaction).delete(protect, deleteTransaction);

module.exports = router;
