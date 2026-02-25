const mongoose = require('mongoose');
const Product = require('../models/Product');

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const validateProductPayload = (payload, isPartial = false) => {
  const errors = {};

  if (!isPartial || hasOwn(payload, 'name')) {
    if (typeof payload.name !== 'string' || !payload.name.trim()) {
      errors.name = 'Product name is required';
    }
  }

  if (!isPartial || hasOwn(payload, 'sku')) {
    if (typeof payload.sku !== 'string' || !payload.sku.trim()) {
      errors.sku = 'SKU is required';
    }
  }

  if (!isPartial || hasOwn(payload, 'costPrice')) {
    if (payload.costPrice === undefined || payload.costPrice === null || payload.costPrice === '') {
      errors.costPrice = 'Cost price is required';
    } else if (typeof payload.costPrice !== 'number' || Number.isNaN(payload.costPrice)) {
      errors.costPrice = 'Cost price must be a valid number';
    } else if (payload.costPrice < 0) {
      errors.costPrice = 'Cost price cannot be negative';
    }
  }

  if (!isPartial || hasOwn(payload, 'sellingPrice')) {
    if (
      payload.sellingPrice === undefined ||
      payload.sellingPrice === null ||
      payload.sellingPrice === ''
    ) {
      errors.sellingPrice = 'Selling price is required';
    } else if (typeof payload.sellingPrice !== 'number' || Number.isNaN(payload.sellingPrice)) {
      errors.sellingPrice = 'Selling price must be a valid number';
    } else if (payload.sellingPrice < 0) {
      errors.sellingPrice = 'Selling price cannot be negative';
    }
  }

  if (!isPartial || hasOwn(payload, 'quantityInStock')) {
    if (
      payload.quantityInStock === undefined ||
      payload.quantityInStock === null ||
      payload.quantityInStock === ''
    ) {
      errors.quantityInStock = 'Quantity in stock is required';
    } else if (
      typeof payload.quantityInStock !== 'number' ||
      Number.isNaN(payload.quantityInStock)
    ) {
      errors.quantityInStock = 'Quantity in stock must be a valid number';
    } else if (payload.quantityInStock < 0) {
      errors.quantityInStock = 'Quantity in stock cannot be negative';
    } else if (!Number.isInteger(payload.quantityInStock)) {
      errors.quantityInStock = 'Quantity in stock must be an integer';
    }
  }

  return errors;
};

const formatDuplicateKeyError = (error) => {
  if (error?.code !== 11000) {
    return null;
  }

  if (error?.keyPattern?.sku) {
    return { sku: 'SKU already exists for this user' };
  }

  return { form: 'Duplicate value detected' };
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

// @desc    Create product
// @route   POST /api/products
// @access  Private
exports.createProduct = async (req, res) => {
  try {
    const { name, sku, costPrice, sellingPrice, quantityInStock } = req.body;
    const errors = validateProductPayload({
      name,
      sku,
      costPrice,
      sellingPrice,
      quantityInStock
    });

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const product = await Product.create({
      user: req.user.id,
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      costPrice,
      sellingPrice,
      quantityInStock
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    const duplicateErrors = formatDuplicateKeyError(error);
    if (duplicateErrors) {
      return res.status(409).json({
        success: false,
        message: 'Validation failed',
        errors: duplicateErrors
      });
    }

    const validationErrors = formatMongooseValidationErrors(error);
    if (validationErrors) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all products for logged in user
// @route   GET /api/products
// @access  Private
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ user: req.user.id, isActive: true }).sort({
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product id'
      });
    }

    const product = await Product.findOne({
      _id: productId,
      user: req.user.id,
      isActive: true
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product id'
      });
    }

    const allowedFields = ['name', 'sku', 'costPrice', 'sellingPrice', 'quantityInStock', 'isActive'];
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

    if (hasOwn(updates, 'name') && typeof updates.name === 'string') {
      updates.name = updates.name.trim();
    }

    if (hasOwn(updates, 'sku') && typeof updates.sku === 'string') {
      updates.sku = updates.sku.trim().toUpperCase();
    }

    const errors = validateProductPayload(updates, true);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const product = await Product.findOneAndUpdate(
      { _id: productId, user: req.user.id, isActive: true },
      updates,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    const duplicateErrors = formatDuplicateKeyError(error);
    if (duplicateErrors) {
      return res.status(409).json({
        success: false,
        message: 'Validation failed',
        errors: duplicateErrors
      });
    }

    const validationErrors = formatMongooseValidationErrors(error);
    if (validationErrors) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product id'
      });
    }

    const product = await Product.findOneAndUpdate(
      { _id: productId, user: req.user.id, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
