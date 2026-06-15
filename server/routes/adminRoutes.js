const express = require('express');
const {
  getStats,
  getUsers,
  deleteUser,
  approveDoctor,
  getPendingDoctors
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require protect and admin role
router.use(protect, authorize('Admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/pending-doctors', getPendingDoctors);
router.put('/approve-doctor/:id', approveDoctor);
router.delete('/users/:id', deleteUser);

module.exports = router;
