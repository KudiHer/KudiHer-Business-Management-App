const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: [true, 'Please add expense amount'],
      min: [0.01, 'Amount must be greater than 0']
    },
    description: {
      type: String,
      required: [true, 'Please add expense description'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please add expense category'],
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

module.exports = mongoose.model('Expense', expenseSchema);
