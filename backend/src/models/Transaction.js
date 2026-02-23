const mongoose = require('mongoose');

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
      required: [true, 'Please add transaction description'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please add transaction category'],
      trim: true
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
