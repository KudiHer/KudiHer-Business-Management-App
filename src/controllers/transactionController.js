const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const validateTransactionPayload = (payload, isPartial = false) => {
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

// @desc    Create transaction
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, description, category, date } = req.body;
    const errors = validateTransactionPayload({ amount, category, date });

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      type,
      amount,
      description,
      category: category.trim(),
      date: date || Date.now()
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
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

// @desc    Get all transactions for logged in user
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction id'
      });
    }

    const allowedFields = ['type', 'amount', 'description', 'category', 'date'];
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

    if (hasOwn(updates, 'category') && typeof updates.category === 'string') {
      updates.category = updates.category.trim();
    }

    const errors = validateTransactionPayload(updates, true);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: transactionId, user: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction
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

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction id'
      });
    }

    const transaction = await Transaction.findOneAndDelete({
      _id: transactionId,
      user: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
