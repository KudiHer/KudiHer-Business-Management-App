const mongoose = require('mongoose');

const ALLOWED_PAYMENT_METHODS = ['cash', 'bank transfer', 'transfer', 'card', 'pos', 'mobile money', 'wallet', 'other'];

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Please add transaction type']
    },
    amount: {
      type: Number,
      required: [true, 'Please add transaction amount'],
      min: [0.01, 'Amount must be greater than 0']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      required: [true, 'Please add transaction category'],
      trim: true
    },
    item: {
      type: String,
      trim: true
    },
    paymentMethod: {
      type: String,
      trim: true,
      lowercase: true,
      enum: {
        values: ALLOWED_PAYMENT_METHODS,
        message: 'Invalid payment method'
      }
    },
    customerName: {
      type: String,
      trim: true
    },
    vendorName: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    receiptPhotoUrl: {
      type: String,
      trim: true,
      maxlength: [2048, 'Receipt photo URL is too long']
    },
    date: {
      type: Date,
      default: Date.now,
      validate: {
        validator: function validateDate(value) {
          return value <= new Date();
        },
        message: 'Date cannot be in the future'
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
