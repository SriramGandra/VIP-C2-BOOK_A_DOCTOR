const crypto = require('crypto');
const User = require('../models/user');
const Doctor = require('../models/doctor');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phoneNumber,
      address,
      // Doctor details
      specialization,
      experience,
      fees,
      about,
      location
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create User
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Patient',
      phoneNumber: phoneNumber || '',
      address: address || ''
    });

    let doctorProfile = null;

    // If role is Doctor, create Doctor profile
    if (user.role === 'Doctor') {
      if (!specialization || !experience || !fees || !location) {
        // Clean up created user if validation fails
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          success: false,
          message: 'Please provide specialization, experience, fees, and location for doctor registration'
        });
      }

      doctorProfile = await Doctor.create({
        user: user._id,
        specialization,
        experience,
        fees,
        about: about || '',
        location,
        isApproved: false // Requires admin approval
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        address: user.address,
        profilePic: user.profilePic,
        doctorProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    let doctorProfile = null;
    if (user.role === 'Doctor') {
      doctorProfile = await Doctor.findOne({ user: user._id });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        address: user.address,
        profilePic: user.profilePic,
        doctorProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let doctorProfile = null;

    if (user.role === 'Doctor') {
      doctorProfile = await Doctor.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        address: user.address,
        profilePic: user.profilePic,
        notifications: user.notifications,
        doctorProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name || req.user.name,
      phoneNumber: req.body.phoneNumber || req.user.phoneNumber,
      address: req.body.address || req.user.address,
      profilePic: req.body.profilePic || req.user.profilePic
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    let doctorProfile = null;
    if (user.role === 'Doctor') {
      const docFields = {
        specialization: req.body.specialization,
        experience: req.body.experience,
        fees: req.body.fees,
        about: req.body.about,
        location: req.body.location
      };

      // Filter undefined fields
      Object.keys(docFields).forEach(key => docFields[key] === undefined && delete docFields[key]);

      doctorProfile = await Doctor.findOneAndUpdate(
        { user: user._id },
        { $set: docFields },
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        address: user.address,
        profilePic: user.profilePic,
        doctorProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'There is no user with that email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire (10 mins)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // For test/dev purposes, return the reset token directly so client can consume it
    res.status(200).json({
      success: true,
      message: 'Token generated successfully',
      resetToken // In a real app we send this via email, here we expose it for ease of use
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Hash token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};
