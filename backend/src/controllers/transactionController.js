const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const ALLOWED_TRANSACTION_TYPES = ['income', 'expense'];
const ALLOWED_PAYMENT_METHODS = ['cash', 'bank transfer', 'transfer', 'card', 'pos', 'mobile money', 'wallet', 'other'];

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : value);

const validateTransactionPayload = (payload, isPartial = false) => {
  const errors = {};
  const normalizedType = normalizeText(payload.type);

  if (!isPartial || hasOwn(payload, 'type')) {
    if (!normalizedType) {
      errors.type = 'Type is required';
    } else if (!ALLOWED_TRANSACTION_TYPES.includes(normalizedType)) {
      errors.type = 'Type must be either income or expense';
    }
  }

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
    const category = normalizeText(payload.category);
    if (!category) {
      errors.category = 'Category is required';
    } else if (category.length < 2) {
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

  const shouldApplyIncomeValidation = normalizedType === 'income';
  if (shouldApplyIncomeValidation) {
    if (!isPartial || hasOwn(payload, 'item')) {
      const item = normalizeText(payload.item);
      if (!item) {
        errors.item = 'Item is required for income';
      } else if (item.length < 2) {
        errors.item = 'Item must be at least 2 characters';
      }
    }

    if (!isPartial || hasOwn(payload, 'paymentMethod')) {
      const paymentMethod = normalizeText(payload.paymentMethod);
      if (!paymentMethod) {
        errors.paymentMethod = 'Payment method is required for income';
      } else if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod.toLowerCase())) {
        errors.paymentMethod = 'Invalid payment method';
      }
    }

    if (!isPartial || hasOwn(payload, 'customerName')) {
      if (
        payload.customerName !== undefined
        && payload.customerName !== null
        && payload.customerName !== ''
      ) {
        const customerName = normalizeText(payload.customerName);
        if (!customerName) {
          errors.customerName = 'Customer name cannot be empty';
        }
      }
    }

    if (!isPartial || hasOwn(payload, 'notes')) {
      if (payload.notes !== undefined && payload.notes !== null && payload.notes !== '') {
        const notes = normalizeText(payload.notes);
        if (!notes) {
          errors.notes = 'Notes cannot be empty';
        } else if (notes.length > 500) {
          errors.notes = 'Notes cannot exceed 500 characters';
        }
      }
    }
  }

  const shouldApplyExpenseValidation = normalizedType === 'expense';
  if (shouldApplyExpenseValidation) {
    if (!isPartial || hasOwn(payload, 'description')) {
      const description = normalizeText(payload.description);
      if (!description) {
        errors.description = 'Description is required for expense';
      } else if (description.length < 2) {
        errors.description = 'Description must be at least 2 characters';
      }
    }

    if (!isPartial || hasOwn(payload, 'paymentMethod')) {
      const paymentMethod = normalizeText(payload.paymentMethod);
      if (!paymentMethod) {
        errors.paymentMethod = 'Payment method is required for expense';
      } else if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod.toLowerCase())) {
        errors.paymentMethod = 'Invalid payment method';
      }
    }

    if (!isPartial || hasOwn(payload, 'vendorName')) {
      if (payload.vendorName !== undefined && payload.vendorName !== null && payload.vendorName !== '') {
        const vendorName = normalizeText(payload.vendorName);
        if (!vendorName) {
          errors.vendorName = 'Vendor/Supplier cannot be empty';
        }
      }
    }

    if (!isPartial || hasOwn(payload, 'receiptPhotoUrl')) {
      if (
        payload.receiptPhotoUrl !== undefined
        && payload.receiptPhotoUrl !== null
        && payload.receiptPhotoUrl !== ''
      ) {
        const receiptPhotoUrl = normalizeText(payload.receiptPhotoUrl);
        if (!receiptPhotoUrl) {
          errors.receiptPhotoUrl = 'Receipt photo URL cannot be empty';
        } else if (receiptPhotoUrl.length > 2048) {
          errors.receiptPhotoUrl = 'Receipt photo URL is too long';
        }
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

const createTransactionDocument = (reqBody, userId) => {
  const type = normalizeText(reqBody.type);
  const category = normalizeText(reqBody.category);
  const item = normalizeText(reqBody.item);
  const paymentMethod = normalizeText(reqBody.paymentMethod);
  const customerName = normalizeText(reqBody.customerName);
  const notes = normalizeText(reqBody.notes);
  const vendorName = normalizeText(reqBody.vendorName);
  const receiptPhotoUrl = normalizeText(reqBody.receiptPhotoUrl);
  const descriptionInput = normalizeText(reqBody.description);

  const description = descriptionInput || (type === 'income' && item ? item : category);

  return {
    user: userId,
    type,
    amount: reqBody.amount,
    description,
    category,
    date: reqBody.date || Date.now(),
    ...(item ? { item } : {}),
    ...(paymentMethod ? { paymentMethod } : {}),
    ...(customerName ? { customerName } : {}),
    ...(notes ? { notes } : {}),
    ...(vendorName ? { vendorName } : {}),
    ...(receiptPhotoUrl ? { receiptPhotoUrl } : {})
  };
};

// @desc    Create transaction
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res) => {
  try {
    const payload = {
      type: req.body.type,
      amount: req.body.amount,
      description: req.body.description,
      category: req.body.category,
      date: req.body.date,
      item: req.body.item,
      paymentMethod: req.body.paymentMethod,
      customerName: req.body.customerName,
      notes: req.body.notes,
      vendorName: req.body.vendorName || req.body.vendorSupplier,
      receiptPhotoUrl: req.body.receiptPhotoUrl || req.body.receiptPhoto
    };

    const errors = validateTransactionPayload(payload);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const transaction = await Transaction.create(createTransactionDocument(payload, req.user.id));

    return res.status(201).json({
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

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create income transaction
// @route   POST /api/transactions/income
// @access  Private
exports.createIncomeTransaction = async (req, res) => {
  req.body.type = 'income';
  return exports.createTransaction(req, res);
};

// @desc    Create expense transaction
// @route   POST /api/transactions/expense
// @access  Private
exports.createExpenseTransaction = async (req, res) => {
  req.body.type = 'expense';
  return exports.createTransaction(req, res);
};

// @desc    Get all transactions for logged in user
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });

    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    return res.status(500).json({
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

    const allowedFields = [
      'type',
      'amount',
      'description',
      'category',
      'date',
      'item',
      'paymentMethod',
      'customerName',
      'notes',
      'vendorName',
      'receiptPhotoUrl'
    ];
    const updates = {};

    allowedFields.forEach((field) => {
      if (hasOwn(req.body, field)) {
        updates[field] = req.body[field];
      }
    });

    if (hasOwn(req.body, 'vendorSupplier') && !hasOwn(updates, 'vendorName')) {
      updates.vendorName = req.body.vendorSupplier;
    }

    if (hasOwn(req.body, 'receiptPhoto') && !hasOwn(updates, 'receiptPhotoUrl')) {
      updates.receiptPhotoUrl = req.body.receiptPhoto;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: {
          form: 'No valid fields provided for update'
        }
      });
    }

    const errors = validateTransactionPayload(updates, true);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    ['type', 'description', 'category', 'item', 'paymentMethod', 'customerName', 'notes', 'vendorName', 'receiptPhotoUrl'].forEach((field) => {
      if (hasOwn(updates, field) && typeof updates[field] === 'string') {
        updates[field] = updates[field].trim();
      }
    });

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

    return res.status(200).json({
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

    return res.status(500).json({
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

    return res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
