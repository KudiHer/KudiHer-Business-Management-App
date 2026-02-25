const express = require('express');
const router = express.Router();
const {
  createExpense,
  getExpenses,
  getExpenseSummary,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

router.route('/').post(protect, createExpense).get(protect, getExpenses);
router.get('/summary', protect, getExpenseSummary);
router.route('/:id').put(protect, updateExpense).delete(protect, deleteExpense);

module.exports = router;
