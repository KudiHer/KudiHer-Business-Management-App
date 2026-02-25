const mongoose = require('mongoose');
const Expense = require('../models/Expense');

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const validateExpensePayload = (payload, isPartial = false) => {
  const errors = {};

  if (!isPartial || hasOwn(payload, 'amount')) {
    if (payload.amount === undefined || payload.amount === null || payload.amount === '') {
      errors.amount = 'Amount is required';
    } else if (typeof payload.amount !== 'number' || Number.isNaN(payload.amount)) {
      errors.amount = 'Amount must be a valid number';
    } else if (payload.amount <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }
  }

  if (!isPartial || hasOwn(payload, 'description')) {
    if (typeof payload.description !== 'string' || !payload.description.trim()) {
      errors.description = 'Description is required';
    }
  }

  if (!isPartial || hasOwn(payload, 'category')) {
    if (typeof payload.category !== 'string' || !payload.category.trim()) {
      errors.category = 'Category is required';
    } else if (payload.category.trim().length < 2) {
      errors.category = 'Category must be at least 2 characters';
    }
  }

  if (!isPartial || hasOwn(payload, 'date')) {
    if (payload.date !== undefined && payload.date !== null && payload.date !== '') {
      const parsedDate = new Date(payload.date);

      if (Number.isNaN(parsedDate.getTime())) {
        errors.date = 'Date must be a valid date';
      } else if (parsedDate > new Date()) {
        errors.date = 'Date cannot be in the future';
      }
    }
  }

  return errors;
};

const formatMongooseValidationErrors = (error) => {
  if (error.name !== 'ValidationError') {
    return null;
  }

  const errors = {};
  Object.keys(error.errors).forEach((field) => {
    errors[field] = error.errors[field].message;
  });
  return errors;
};

// @desc    Create expense
// @route   POST /api/expenses
// @access  Private
exports.createExpense = async (req, res) => {
  try {
    const { amount, description, category, date } = req.body;
    const errors = validateExpensePayload({ amount, description, category, date });

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const expense = await Expense.create({
      user: req.user.id,
      amount,
      description: description.trim(),
      category: category.trim(),
      date: date || Date.now()
    });

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense
    });
  } catch (error) {
    const errors = formatMongooseValidationErrors(error);

    if (errors) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all expenses for logged in user
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get expense summary for logged in user
// @route   GET /api/expenses/summary
// @access  Private
exports.getExpenseSummary = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const [summary] = await Expense.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          totalExpenses: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      totalExpenses: summary?.totalExpenses || 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid expense id'
      });
    }

    const allowedFields = ['amount', 'description', 'category', 'date'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (hasOwn(req.body, field)) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: {
          form: 'No valid fields provided for update'
        }
      });
    }

    if (hasOwn(updates, 'description') && typeof updates.description === 'string') {
      updates.description = updates.description.trim();
    }

    if (hasOwn(updates, 'category') && typeof updates.category === 'string') {
      updates.category = updates.category.trim();
    }

    const errors = validateExpensePayload(updates, true);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: expenseId, user: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: expense
    });
  } catch (error) {
    const errors = formatMongooseValidationErrors(error);

    if (errors) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid expense id'
      });
    }

    const expense = await Expense.findOneAndDelete({
      _id: expenseId,
      user: req.user.id
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
