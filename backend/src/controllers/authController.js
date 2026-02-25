const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;
const allowedBusinessTypes = ['Retail', 'Service', 'Wholesale', 'Other'];

const toBase64Url = (value) =>
  Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const parseJwtExpiryToSeconds = (expiry) => {
  if (!expiry) {
    return 60 * 60 * 24 * 7; // 7 days default
  }

  if (/^\d+$/.test(expiry)) {
    return Number(expiry);
  }

  const match = expiry.match(/^(\d+)([smhd])$/i);
  if (!match) {
    return 60 * 60 * 24 * 7;
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 60 * 60 * 24
  };

  return value * multipliers[unit];
};

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresInSeconds = parseJwtExpiryToSeconds(process.env.JWT_EXPIRES_IN);
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    id: userId.toString(),
    iat: now,
    exp: now + expiresInSeconds
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${data}.${signature}`;
};

const validateRegisterPayload = (payload) => {
  const errors = {};
  const businessName = typeof payload.businessName === 'string' ? payload.businessName.trim() : '';
  const fullName = typeof payload.fullName === 'string' ? payload.fullName.trim() : '';
  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const phoneNumber = typeof payload.phoneNumber === 'string' ? payload.phoneNumber.trim() : '';
  const password = typeof payload.password === 'string' ? payload.password : '';
  const businessType = payload.businessType;

  if (!businessName) {
    errors.businessName = 'Business name is required';
  }

  if (!fullName) {
    errors.fullName = 'Full name is required';
  }

  if (!email) {
    errors.email = 'Email is required';
  } else if (!emailRegex.test(email)) {
    errors.email = 'Email must be valid';
  }

  if (!phoneNumber) {
    errors.phoneNumber = 'Phone number is required';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (businessType !== undefined && !allowedBusinessTypes.includes(businessType)) {
    errors.businessType = `Business type must be one of: ${allowedBusinessTypes.join(', ')}`;
  }

  return {
    errors,
    sanitized: {
      businessName,
      fullName,
      email,
      phoneNumber,
      password,
      businessType
    }
  };
};

const validateLoginPayload = (payload) => {
  const errors = {};
  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const password = typeof payload.password === 'string' ? payload.password : '';

  if (!email) {
    errors.email = 'Email is required';
  } else if (!emailRegex.test(email)) {
    errors.email = 'Email must be valid';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return { errors, sanitized: { email, password } };
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { errors, sanitized } = validateRegisterPayload(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const { businessName, fullName, email, phoneNumber, password, businessType } = sanitized;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // 2. Create user (Password encryption happens automatically in the Model)
    const user = await User.create({
      businessName,
      fullName,
      email,
      phoneNumber,
      password,
      businessType
    });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      data: {
        id: user._id,
        fullName: user.fullName,
        businessName: user.businessName,
        businessType: user.businessType,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    const statusCode = error.message === 'JWT_SECRET is not set' ? 500 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { errors, sanitized } = validateLoginPayload(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const { email, password } = sanitized;
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        id: user._id,
        fullName: user.fullName,
        businessName: user.businessName,
        businessType: user.businessType,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    const statusCode = error.message === 'JWT_SECRET is not set' ? 500 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
