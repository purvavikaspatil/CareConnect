const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your-secret-key-here', {
    expiresIn: '30d', // Token expires in 30 days
  });
};

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, and password',
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to register user',
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user and return JWT token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
      });
    }

    // Check if user exists (include password field)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Check if password matches
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to login',
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private (requires auth middleware)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    console.log('👤 Fetching user profile for ID:', req.user.id);
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.error('❌ User not found with ID:', req.user.id);
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    console.log('✅ User profile fetched:', user.name);

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        phone: user.phone,
        address: user.address,
        emergencyContactName: user.emergencyContactName,
        emergencyContactPhone: user.emergencyContactPhone,
        bloodType: user.bloodType,
        allergies: user.allergies,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Get User Error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to fetch user',
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private (requires auth middleware)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { 
      name, 
      age, 
      phone, 
      address, 
      emergencyContactName, 
      emergencyContactPhone,
      bloodType,
      allergies
    } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (age !== undefined) user.age = age;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (emergencyContactName !== undefined) user.emergencyContactName = emergencyContactName;
    if (emergencyContactPhone !== undefined) user.emergencyContactPhone = emergencyContactPhone;
    if (bloodType !== undefined) user.bloodType = bloodType;
    if (allergies !== undefined) user.allergies = allergies;

    await user.save();

    console.log('✅ Profile updated for user:', user.name);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        phone: user.phone,
        address: user.address,
        emergencyContactName: user.emergencyContactName,
        emergencyContactPhone: user.emergencyContactPhone,
        bloodType: user.bloodType,
        allergies: user.allergies,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to update profile',
    });
  }
});

module.exports = router;

