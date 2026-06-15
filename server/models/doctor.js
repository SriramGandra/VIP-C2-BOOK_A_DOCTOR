const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  date: {
    type: String, // format YYYY-MM-DD
    required: true
  },
  slots: {
    type: [String], // e.g. ["09:00 AM", "10:00 AM"]
    required: true
  }
});

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: {
    type: String,
    required: [true, 'Please add a specialization']
  },
  experience: {
    type: Number,
    required: [true, 'Please add experience in years']
  },
  fees: {
    type: Number,
    required: [true, 'Please add consultation fees']
  },
  about: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    required: [true, 'Please add clinic or hospital location']
  },
  isApproved: {
    type: Boolean,
    default: false // Requires admin approval
  },
  availability: [availabilitySchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
