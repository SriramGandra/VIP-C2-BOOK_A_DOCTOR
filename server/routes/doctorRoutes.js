const express = require('express');
const {
  getDoctors,
  getDoctorById,
  getDoctorProfile,
  updateAvailability
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getDoctors);
router.get('/profile/me', protect, authorize('Doctor'), getDoctorProfile);
router.get('/:id', getDoctorById);
router.put('/availability', protect, authorize('Doctor'), updateAvailability);

module.exports = router;
