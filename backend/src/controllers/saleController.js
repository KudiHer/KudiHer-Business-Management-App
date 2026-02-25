const mongoose = require('mongoose');
const Product = require('../models/Product');
const Sale = require('../models/Sale');

const validateCreateSalePayload = (payload) => {
  const errors = {};

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    errors.items = 'At least one sale item is required';
    return errors;
  }

  const seenProductIds = new Set();

  payload.items.forEach((item, index) => {
    const path = `items[${index}]`;
    const productId = item?.productId;
    const quantity = item?.quantity;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      errors[`${path}.productId`] = 'Valid productId is required';
    } else {
      const normalizedId = productId.toString();
      if (seenProductIds.has(normalizedId)) {
        errors[`${path}.productId`] = 'Duplicate product in sale items is not allowed';
      }
      seenProductIds.add(normalizedId);
    }

    if (quantity === undefined || quantity === null || quantity === '') {
      errors[`${path}.quantity`] = 'Quantity is required';
    } else if (typeof quantity !== 'number' || Number.isNaN(quantity)) {
      errors[`${path}.quantity`] = 'Quantity must be a valid number';
    } else if (!Number.isInteger(quantity) || quantity <= 0) {
      errors[`${path}.quantity`] = 'Quantity must be a positive integer';
    }
  });

  if (payload.saleDate !== undefined && payload.saleDate !== null && payload.saleDate !== '') {
    const parsedDate = new Date(payload.saleDate);
    if (Number.isNaN(parsedDate.getTime())) {
      errors.saleDate = 'Sale date must be a valid date';
    } else if (parsedDate > new Date()) {
      errors.saleDate = 'Sale date cannot be in the future';
    }
  }

  return errors;
};

// @desc    Create sale and deduct stock
// @route   POST /api/sales
// @access  Private
exports.createSale = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { items, saleDate } = req.body;
    const errors = validateCreateSalePayload({ items, saleDate });
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    let createdSale;

    await session.withTransaction(async () => {
      const saleItems = [];
      let totalRevenue = 0;
      let totalCost = 0;

      for (const item of items) {
        const product = await Product.findOneAndUpdate(
          {
            _id: item.productId,
            user: req.user.id,
            isActive: true,
            quantityInStock: { $gte: item.quantity }
          },
          {
            $inc: { quantityInStock: -item.quantity }
          },
          {
            new: true,
            session
          }
        );

        if (!product) {
          throw new Error(`Insufficient stock or product not found for productId: ${item.productId}`);
        }

        const lineRevenue = product.sellingPrice * item.quantity;
        const lineCost = product.costPrice * item.quantity;
        const lineGrossProfit = lineRevenue - lineCost;

        totalRevenue += lineRevenue;
        totalCost += lineCost;

        saleItems.push({
          product: product._id,
          productName: product.name,
          sku: product.sku,
          quantity: item.quantity,
          unitCostPrice: product.costPrice,
          unitSellingPrice: product.sellingPrice,
          lineRevenue,
          lineCost,
          lineGrossProfit
        });
      }

      const [sale] = await Sale.create(
        [
          {
            user: req.user.id,
            items: saleItems,
            totalRevenue,
            totalCost,
            grossProfit: totalRevenue - totalCost,
            saleDate: saleDate || Date.now()
          }
        ],
        { session }
      );

      createdSale = sale;
    });

    return res.status(201).json({
      success: true,
      message: 'Sale recorded successfully',
      data: createdSale
    });
  } catch (error) {
    const isStockError = error.message.includes('Insufficient stock or product not found');
    const statusCode = isStockError ? 400 : 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  } finally {
    session.endSession();
  }
};

// @desc    Get all sales for logged in user
// @route   GET /api/sales
// @access  Private
exports.getSales = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = { user: req.user.id };

    if (from || to) {
      filter.saleDate = {};

      if (from) {
        const parsedFrom = new Date(from);
        if (Number.isNaN(parsedFrom.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid from date'
          });
        }
        filter.saleDate.$gte = parsedFrom;
      }

      if (to) {
        const parsedTo = new Date(to);
        if (Number.isNaN(parsedTo.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid to date'
          });
        }
        filter.saleDate.$lte = parsedTo;
      }
    }

    const sales = await Sale.find(filter).sort({ saleDate: -1 });

    return res.status(200).json({
      success: true,
      count: sales.length,
      data: sales
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get sales summary for logged in user
// @route   GET /api/sales/summary
// @access  Private
exports.getSalesSummary = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const [summary] = await Sale.aggregate([
      {
        $match: {
          user: userId
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalRevenue' },
          totalCost: { $sum: '$totalCost' },
          grossProfit: { $sum: '$grossProfit' },
          totalSalesCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          totalCost: 1,
          grossProfit: 1,
          totalSalesCount: 1
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      totalRevenue: summary?.totalRevenue || 0,
      totalCost: summary?.totalCost || 0,
      grossProfit: summary?.grossProfit || 0,
      totalSalesCount: summary?.totalSalesCount || 0
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
