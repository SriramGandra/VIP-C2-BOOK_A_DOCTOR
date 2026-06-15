const express = require('express');
const {
  bookAppointment,
  getAppointments,
  updateAppointmentStatus,
  cancelAppointment
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All appointment routes are protected
router.use(protect);

router.post('/', authorize('Patient'), bookAppointment);
router.get('/', getAppointments);
router.put('/:id/status', authorize('Doctor', 'Admin'), updateAppointmentStatus);
router.put('/:id/cancel', cancelAppointment);

module.exports = router;
