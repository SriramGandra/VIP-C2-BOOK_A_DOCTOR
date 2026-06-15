const User = require('../models/user');
const Doctor = require('../models/doctor');
const Appointment = require('../models/appointment');

// @desc    Get dashboard analytics/statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'Patient' });
    const totalDoctors = await User.countDocuments({ role: 'Doctor' });
    const totalAdmins = await User.countDocuments({ role: 'Admin' });

    const approvedDoctors = await Doctor.countDocuments({ isApproved: true });
    const pendingDoctors = await Doctor.countDocuments({ isApproved: false });

    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'Pending' });
    const approvedAppointments = await Appointment.countDocuments({ status: 'Approved' });
    const rejectedAppointments = await Appointment.countDocuments({ status: 'Rejected' });
    const completedAppointments = await Appointment.countDocuments({ status: 'Completed' });

    res.status(200).json({
      success: true,
      data: {
        users: { total: totalUsers, patients: totalPatients, doctors: totalDoctors, admins: totalAdmins },
        doctorsApproval: { approved: approvedDoctors, pending: pendingDoctors },
        appointments: {
          total: totalAppointments,
          pending: pendingAppointments,
          approved: approvedAppointments,
          rejected: rejectedAppointments,
          completed: completedAppointments
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent admin from deleting their own account
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'Admin cannot delete their own account' });
    }

    // If role is Doctor, delete doctor profile
    if (user.role === 'Doctor') {
      await Doctor.findOneAndDelete({ user: user._id });
    }

    // Cascade delete appointments of patient or doctor
    if (user.role === 'Patient') {
      await Appointment.deleteMany({ patient: user._id });
    } else if (user.role === 'Doctor') {
      const doctor = await Doctor.findOne({ user: user._id });
      if (doctor) {
        await Appointment.deleteMany({ doctor: doctor._id });
      }
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Account and associated records deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject doctor registration
// @route   PUT /api/admin/approve-doctor/:id
// @access  Private/Admin
exports.approveDoctor = async (req, res, next) => {
  try {
    const { isApproved } = req.body;

    if (isApproved === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide isApproved status' });
    }

    const doctor = await Doctor.findById(req.params.id).populate('user');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    doctor.isApproved = isApproved;
    await doctor.save();

    // Notify doctor
    const doctorUser = await User.findById(doctor.user._id);
    if (doctorUser) {
      doctorUser.notifications.push({
        message: `Your doctor registration has been ${isApproved ? 'Approved' : 'Rejected'} by the Admin.`
      });
      await doctorUser.save();
    }

    res.status(200).json({
      success: true,
      data: doctor,
      message: `Doctor successfully ${isApproved ? 'Approved' : 'Rejected'}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pending doctors
// @route   GET /api/admin/pending-doctors
// @access  Private/Admin
exports.getPendingDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find({ isApproved: false }).populate('user', 'name email phoneNumber address');
    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    next(error);
  }
};
