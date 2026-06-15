const Doctor = require('../models/doctor');
const User = require('../models/user');

// @desc    Get all approved doctors with optional filters
// @route   GET /api/doctors
// @access  Public
exports.getDoctors = async (req, res, next) => {
  try {
    const filter = { isApproved: true };

    if (req.query.specialization) {
      filter.specialization = { $regex: req.query.specialization, $options: 'i' };
    }

    if (req.query.location) {
      filter.location = { $regex: req.query.location, $options: 'i' };
    }

    let doctors = await Doctor.find(filter).populate('user', 'name email phoneNumber address profilePic');

    // Filter by name if searched
    if (req.query.search) {
      const searchStr = req.query.search.toLowerCase();
      doctors = doctors.filter(
        doc =>
          doc.user &&
          (doc.user.name.toLowerCase().includes(searchStr) ||
            doc.specialization.toLowerCase().includes(searchStr))
      );
    }

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single doctor details
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email phoneNumber address profilePic');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current doctor profile (for dashboard)
// @route   GET /api/doctors/profile/me
// @access  Private/Doctor
exports.getDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id }).populate('user', 'name email phoneNumber address profilePic');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor availability slots
// @route   PUT /api/doctors/availability
// @access  Private/Doctor
exports.updateAvailability = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    // Availability is passed as an array of { date, slots: [String] }
    const { availability } = req.body;

    if (!availability || !Array.isArray(availability)) {
      return res.status(400).json({ success: false, message: 'Please provide availability array' });
    }

    doctor.availability = availability;
    await doctor.save();

    res.status(200).json({
      success: true,
      data: doctor.availability,
      message: 'Availability updated successfully'
    });
  } catch (error) {
    next(error);
  }
};
