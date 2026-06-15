const Appointment = require('../models/appointment');
const Doctor = require('../models/doctor');
const User = require('../models/user');

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private/Patient
exports.bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, timeSlot, reason } = req.body;

    if (!doctorId || !date || !timeSlot || !reason) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const doctor = await Doctor.findById(doctorId).populate('user');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    if (!doctor.isApproved) {
      return res.status(400).json({ success: false, message: 'Doctor is not verified yet' });
    }

    // Check if slot is available
    const dayAvail = doctor.availability.find(av => av.date === date);
    if (!dayAvail || !dayAvail.slots.includes(timeSlot)) {
      return res.status(400).json({ success: false, message: 'Select slot is not available for booking' });
    }

    // Book the appointment
    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      date,
      timeSlot,
      reason,
      status: 'Pending'
    });

    // Remove slot from doctor availability
    dayAvail.slots = dayAvail.slots.filter(s => s !== timeSlot);
    await doctor.save();

    // Notify doctor
    const doctorUser = await User.findById(doctor.user._id);
    if (doctorUser) {
      doctorUser.notifications.push({
        message: `New appointment booking request from ${req.user.name} for ${date} at ${timeSlot}`
      });
      await doctorUser.save();
    }

    res.status(201).json({
      success: true,
      data: appointment,
      message: 'Appointment booked successfully and is pending approval'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user appointments list (role-based)
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res, next) => {
  try {
    let appointments;

    if (req.user.role === 'Admin') {
      appointments = await Appointment.find()
        .populate('patient', 'name email phoneNumber address')
        .populate({
          path: 'doctor',
          populate: { path: 'user', select: 'name email phoneNumber address' }
        })
        .sort('-createdAt');
    } else if (req.user.role === 'Doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor) {
        return res.status(404).json({ success: false, message: 'Doctor profile not found' });
      }
      appointments = await Appointment.find({ doctor: doctor._id })
        .populate('patient', 'name email phoneNumber address profilePic')
        .sort('-createdAt');
    } else {
      // Patient
      appointments = await Appointment.find({ patient: req.user.id })
        .populate({
          path: 'doctor',
          populate: { path: 'user', select: 'name email phoneNumber address profilePic' }
        })
        .sort('-createdAt');
    }

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status (Approve/Reject/Complete)
// @route   PUT /api/appointments/:id/status
// @access  Private (Doctor or Admin)
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    if (!['Approved', 'Rejected', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('patient')
      .populate({
        path: 'doctor',
        populate: { path: 'user' }
      });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Authorization check: User must be the doctor of the appointment or an Admin
    if (req.user.role !== 'Admin' && appointment.doctor.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this appointment' });
    }

    appointment.status = status;
    if (notes) {
      appointment.notes = notes;
    }
    await appointment.save();

    // If status is Rejected, restore the time slot to doctor availability
    if (status === 'Rejected') {
      const doctor = await Doctor.findById(appointment.doctor._id);
      if (doctor) {
        const dayAvail = doctor.availability.find(av => av.date === appointment.date);
        if (dayAvail) {
          if (!dayAvail.slots.includes(appointment.timeSlot)) {
            dayAvail.slots.push(appointment.timeSlot);
            dayAvail.slots.sort();
          }
        } else {
          doctor.availability.push({
            date: appointment.date,
            slots: [appointment.timeSlot]
          });
        }
        await doctor.save();
      }
    }

    // Notify patient
    const patientUser = await User.findById(appointment.patient._id);
    if (patientUser) {
      patientUser.notifications.push({
        message: `Your appointment with Dr. ${appointment.doctor.user.name} on ${appointment.date} at ${appointment.timeSlot} has been ${status.toLowerCase()}`
      });
      await patientUser.save();
    }

    res.status(200).json({
      success: true,
      data: appointment,
      message: `Appointment successfully marked as ${status}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient')
      .populate({
        path: 'doctor',
        populate: { path: 'user' }
      });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Check ownership
    const isPatient = appointment.patient._id.toString() === req.user.id;
    const isDoctor = appointment.doctor.user._id.toString() === req.user.id;

    if (!isPatient && !isDoctor && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this appointment' });
    }

    if (appointment.status === 'Completed' || appointment.status === 'Rejected') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an appointment that is already completed or rejected' });
    }

    appointment.status = 'Rejected';
    appointment.notes = `Cancelled by ${req.user.role}`;
    await appointment.save();

    // Restore slot to doctor availability
    const doctor = await Doctor.findById(appointment.doctor._id);
    if (doctor) {
      const dayAvail = doctor.availability.find(av => av.date === appointment.date);
      if (dayAvail) {
        if (!dayAvail.slots.includes(appointment.timeSlot)) {
          dayAvail.slots.push(appointment.timeSlot);
          dayAvail.slots.sort();
        }
      } else {
        doctor.availability.push({
          date: appointment.date,
          slots: [appointment.timeSlot]
        });
      }
      await doctor.save();
    }

    // Send notifications
    if (isPatient) {
      // Notify doctor
      const doctorUser = await User.findById(appointment.doctor.user._id);
      if (doctorUser) {
        doctorUser.notifications.push({
          message: `Patient ${req.user.name} has cancelled the appointment scheduled for ${appointment.date} at ${appointment.timeSlot}`
        });
        await doctorUser.save();
      }
    } else {
      // Notify patient
      const patientUser = await User.findById(appointment.patient._id);
      if (patientUser) {
        patientUser.notifications.push({
          message: `Dr. ${appointment.doctor.user.name} has cancelled the appointment scheduled for ${appointment.date} at ${appointment.timeSlot}`
        });
        await patientUser.save();
      }
    }

    res.status(200).json({
      success: true,
      data: appointment,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};
