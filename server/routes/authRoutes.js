const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);

module.exports = router;
