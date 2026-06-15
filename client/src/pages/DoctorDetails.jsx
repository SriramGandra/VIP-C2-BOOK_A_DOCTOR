import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking states
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');

  const fetchDoctorDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/doctors/${id}`);
      if (res.data.success) {
        setDoctor(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch doctor details. Profile may not exist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorDetails();
  }, [id]);

  // Find unique available dates
  const availableDates = doctor?.availability?.map(av => av.date) || [];

  // Find available slots for the selected date
  const selectedDateObject = doctor?.availability?.find(av => av.date === selectedDate);
  const availableSlots = selectedDateObject?.slots || [];

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedDate || !selectedSlot) {
      setBookingError('Please choose a date and time slot');
      return;
    }

    if (!reason.trim()) {
      setBookingError('Please enter a reason for your appointment');
      return;
    }

    setBookingLoading(true);
    setBookingError('');
    setBookingSuccess('');

    try {
      const res = await api.post('/appointments', {
        doctorId: doctor._id,
        date: selectedDate,
        timeSlot: selectedSlot,
        reason
      });

      if (res.data.success) {
        setBookingSuccess(res.data.message || 'Appointment requested successfully!');
        // Clear inputs
        setSelectedDate('');
        setSelectedSlot('');
        setReason('');
        
        // Refresh doctor availability details
        fetchDoctorDetails();

        // Redirect to Patient Dashboard appointments history tab in 2 seconds
        setTimeout(() => {
          navigate('/patient?tab=history');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setBookingError(err.response?.data?.message || err.response?.data?.error || 'Failed to request appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading doctor profile...</span>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger" role="alert">{error || 'Doctor not found'}</div>
        <Link to="/doctors" className="btn btn-primary-custom mt-3">Back to Doctor List</Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <Link to="/doctors" className="btn btn-outline-teal mb-4" style={{ color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: '10px' }}>
        <i className="bi bi-arrow-left me-2"></i> Back to Listing
      </Link>

      <div className="row g-4">
        {/* Doctor Details Profile Card */}
        <div className="col-lg-7">
          <div className="premium-card p-5 mb-4">
            <div className="d-flex align-items-center gap-4 flex-wrap mb-4">
              <div
                className="avatar-placeholder rounded-circle bg-teal text-white d-flex align-items-center justify-content-center fw-bold fs-1 shadow"
                style={{ width: '100px', height: '100px', backgroundColor: 'var(--primary)' }}
              >
                {doctor.user?.name ? doctor.user.name.charAt(4) === '.' ? doctor.user.name.split(' ')[1]?.charAt(0) : doctor.user.name.charAt(0) : 'D'}
              </div>
              <div>
                <h2 className="mb-1 text-dark">{doctor.user?.name}</h2>
                <h6 className="specialization-badge text-teal mb-2">{doctor.specialization}</h6>
                <div className="text-muted small">
                  <i className="bi bi-star-fill text-warning me-1"></i>
                  <strong>{doctor.experience} Years</strong> Experience
                </div>
              </div>
            </div>

            <h5 className="border-bottom pb-2 mb-3">About Doctor</h5>
            <p className="text-muted leading-relaxed">
              {doctor.about || `Dr. ${doctor.user?.name} is a highly accomplished specialist in ${doctor.specialization}. Dedicated to providing excellent patient care, and diagnosing complex medical ailments.`}
            </p>

            <h5 className="border-bottom pb-2 mb-3 mt-4">Practice Details</h5>
            <div className="row g-3">
              <div className="col-sm-6">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-geo-alt-fill text-danger fs-5"></i>
                  <div>
                    <small className="text-muted d-block">Location</small>
                    <span className="fw-semibold text-dark">{doctor.location}</span>
                  </div>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-cash-stack text-success fs-5"></i>
                  <div>
                    <small className="text-muted d-block">Consultation Fee</small>
                    <span className="fw-semibold text-dark">₹{doctor.fees} INR</span>
                  </div>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-telephone-fill text-primary fs-5"></i>
                  <div>
                    <small className="text-muted d-block">Phone Number</small>
                    <span className="fw-semibold text-dark">{doctor.user?.phoneNumber || 'Not Disclosed'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Slots Calendar Card */}
        <div className="col-lg-5">
          <div className="premium-card p-5">
            <h4 className="mb-3 text-dark">Schedule Appointment</h4>
            
            {bookingSuccess && (
              <div className="alert alert-success" role="alert">
                <i className="bi bi-check-circle-fill me-2"></i> {bookingSuccess}
              </div>
            )}
            
            {bookingError && (
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i> {bookingError}
              </div>
            )}

            {!user ? (
              <div className="text-center py-4 bg-light rounded-3 border">
                <p className="text-muted mb-3">Please sign in to schedule an appointment with this doctor.</p>
                <Link to="/login" className="btn btn-primary-custom" id="detailsLoginBtn">Login / Register</Link>
              </div>
            ) : user.role !== 'Patient' ? (
              <div className="alert alert-warning mb-0" role="alert">
                <i className="bi bi-exclamation-circle-fill me-2"></i> Only Patient accounts can book appointments. You are logged in as a <strong>{user.role}</strong>.
              </div>
            ) : (
              <form onSubmit={handleBookAppointment}>
                {/* Select Date */}
                <div className="mb-4">
                  <label htmlFor="bookDate" className="form-label fw-bold text-dark">1. Select Appointment Date</label>
                  {availableDates.length > 0 ? (
                    <div className="row g-2">
                      {availableDates.map(date => (
                        <div className="col-6" key={date}>
                          <button
                            type="button"
                            className={`btn w-100 ${selectedDate === date ? 'btn-teal text-white' : 'btn-outline-secondary'}`}
                            onClick={() => {
                              setSelectedDate(date);
                              setSelectedSlot('');
                            }}
                            id={`dateBtn-${date}`}
                            style={{
                              backgroundColor: selectedDate === date ? 'var(--primary)' : 'transparent',
                              color: selectedDate === date ? 'white' : '#64748b',
                              borderRadius: '10px'
                            }}
                          >
                            <i className="bi bi-calendar3 me-2"></i> {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted small p-3 bg-light rounded text-center border">
                      No availability dates currently defined by this doctor.
                    </div>
                  )}
                </div>

                {/* Select Time Slot */}
                {selectedDate && (
                  <div className="mb-4">
                    <label className="form-label fw-bold text-dark">2. Choose Available Time Slot</label>
                    {availableSlots.length > 0 ? (
                      <div className="row g-2">
                        {availableSlots.map(slot => (
                          <div className="col-4" key={slot}>
                            <button
                              type="button"
                              className={`btn w-100 py-2 ${selectedSlot === slot ? 'btn-secondary-custom' : 'btn-outline-dark'}`}
                              onClick={() => setSelectedSlot(slot)}
                              id={`slotBtn-${slot}`}
                              style={{
                                fontSize: '12px',
                                borderRadius: '8px'
                              }}
                            >
                              {slot}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-danger small p-3 bg-light rounded text-center border">
                        All slots are fully booked for this date.
                      </div>
                    )}
                  </div>
                )}

                {/* Reason input */}
                {selectedSlot && (
                  <div className="mb-4">
                    <label htmlFor="bookReason" className="form-label fw-bold text-dark">3. Reason for Appointment</label>
                    <textarea
                      id="bookReason"
                      rows="3"
                      className="form-control form-control-custom"
                      placeholder="Describe symptoms or purpose of your visit..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    ></textarea>
                  </div>
                )}

                {/* Submit button */}
                {selectedSlot && (
                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary-custom py-3"
                      disabled={bookingLoading}
                      id="bookAppointmentBtn"
                    >
                      {bookingLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Booking Slot...
                        </>
                      ) : 'Confirm Appointment Booking'}
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;
