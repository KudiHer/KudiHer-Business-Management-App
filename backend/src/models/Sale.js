const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: {
      type: String,
      required: true,
      trim: true
    },
    sku: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    unitCostPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit cost price cannot be negative']
    },
    unitSellingPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit selling price cannot be negative']
    },
    lineRevenue: {
      type: Number,
      required: true,
      min: [0, 'Line revenue cannot be negative']
    },
    lineCost: {
      type: Number,
      required: true,
      min: [0, 'Line cost cannot be negative']
    },
    lineGrossProfit: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    items: {
      type: [saleItemSchema],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'At least one sale item is required'
      }
    },
    totalRevenue: {
      type: Number,
      required: true,
      min: [0, 'Total revenue cannot be negative']
    },
    totalCost: {
      type: Number,
      required: true,
      min: [0, 'Total cost cannot be negative']
    },
    grossProfit: {
      type: Number,
      required: true
    },
    saleDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

saleSchema.index({ user: 1, saleDate: -1 });

module.exports = mongoose.model('Sale', saleSchema);
