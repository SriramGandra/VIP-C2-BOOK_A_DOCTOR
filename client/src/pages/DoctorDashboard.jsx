import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const DoctorDashboard = () => {
  const { user, updateProfile, refreshUser } = useContext(AuthContext);

  // Tabs state: overview, appointments, availability, profile
  const [activeTab, setActiveTab] = useState('overview');

  // General States
  const [appointments, setAppointments] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Selected Patient Details Modal State
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Availability Form States
  const [availDate, setAvailDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState([]);

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [address, setAddress] = useState(user?.address || '');
  const [specialization, setSpecialization] = useState(user?.doctorProfile?.specialization || '');
  const [experience, setExperience] = useState(user?.doctorProfile?.experience || '');
  const [fees, setFees] = useState(user?.doctorProfile?.fees || '');
  const [location, setLocation] = useState(user?.doctorProfile?.location || '');
  const [about, setAbout] = useState(user?.doctorProfile?.about || '');

  // Action Notes
  const [actionNotes, setActionNotes] = useState({});

  const standardTimeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '01:00 PM', '02:00 PM',
    '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  const fetchDoctorProfile = async () => {
    try {
      const res = await api.get('/doctors/profile/me');
      if (res.data.success) {
        setDoctorProfile(res.data.data);
        // Sync states
        setSpecialization(res.data.data.specialization);
        setExperience(res.data.data.experience);
        setFees(res.data.data.fees);
        setLocation(res.data.data.location);
        setAbout(res.data.data.about);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDoctorProfile();
      fetchAppointments();
      refreshUser();
    }
  }, [activeTab]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrorMsg('');
    const res = await updateProfile({
      name,
      phoneNumber,
      address,
      specialization,
      experience: Number(experience),
      fees: Number(fees),
      location,
      about
    });
    if (res.success) {
      setMessage('Doctor profile updated successfully!');
      fetchDoctorProfile();
    } else {
      setErrorMsg(res.error);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const notes = actionNotes[id] || '';
      const res = await api.put(`/appointments/${id}/status`, { status, notes });
      if (res.data.success) {
        alert(`Appointment successfully marked as ${status}`);
        // Clear notes for this id
        setActionNotes(prev => ({ ...prev, [id]: '' }));
        fetchAppointments();
        fetchDoctorProfile(); // Refresh availability in case Rejected released a slot
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleSlotToggle = (slot) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter(s => s !== slot));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const handleSaveAvailability = async (e) => {
    e.preventDefault();
    if (!availDate) {
      setErrorMsg('Please select a date');
      return;
    }
    if (selectedSlots.length === 0) {
      setErrorMsg('Please select at least one time slot');
      return;
    }

    setMessage('');
    setErrorMsg('');

    // Fetch current availability to merge or add
    let currentAvail = doctorProfile?.availability || [];
    let updatedAvail = [...currentAvail];

    const existingDateIndex = updatedAvail.findIndex(av => av.date === availDate);

    if (existingDateIndex !== -1) {
      // Merge unique slots
      const merged = Array.from(new Set([...updatedAvail[existingDateIndex].slots, ...selectedSlots]));
      updatedAvail[existingDateIndex].slots = merged.sort();
    } else {
      updatedAvail.push({
        date: availDate,
        slots: [...selectedSlots].sort()
      });
    }

    try {
      const res = await api.put('/doctors/availability', { availability: updatedAvail });
      if (res.data.success) {
        setMessage('Availability slots updated successfully!');
        setAvailDate('');
        setSelectedSlots([]);
        fetchDoctorProfile();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save availability');
    }
  };

  const handleDeleteDateSlots = async (dateToDelete) => {
    if (!window.confirm(`Are you sure you want to remove all available slots for ${dateToDelete}?`)) return;
    
    let currentAvail = doctorProfile?.availability || [];
    let updatedAvail = currentAvail.filter(av => av.date !== dateToDelete);

    try {
      const res = await api.put('/doctors/availability', { availability: updatedAvail });
      if (res.data.success) {
        alert('Availability slots removed successfully');
        fetchDoctorProfile();
      }
    } catch (err) {
      alert('Failed to remove slots');
    }
  };

  const handleViewPatientDetails = (appointment) => {
    // Collect patient history of appointments
    const patientHistory = appointments.filter(
      app => app.patient?._id === appointment.patient?._id && app._id !== appointment._id
    );

    setSelectedPatient({
      profile: appointment.patient,
      currentReason: appointment.reason,
      currentSlot: `${appointment.date} at ${appointment.timeSlot}`,
      history: patientHistory
    });
  };

  return (
    <div className="dashboard-container">
      <Sidebar role="Doctor" activeTab={activeTab} setActiveTab={setActiveTab} userName={user?.name} />

      <div className="dashboard-content">
        {message && <div className="alert alert-success alert-dismissible fade show" role="alert">{message}</div>}
        {errorMsg && <div className="alert alert-danger alert-dismissible fade show" role="alert">{errorMsg}</div>}

        {/* Verification Warning Alert */}
        {doctorProfile && !doctorProfile.isApproved && (
          <div className="alert alert-warning border-start border-4 border-warning mb-4" role="alert" id="pendingVerifyAlert">
            <h5 className="alert-heading fw-bold"><i className="bi bi-exclamation-triangle-fill"></i> Registration Status: Pending Approval</h5>
            <p className="mb-0 small">
              Your doctor credentials are currently being reviewed by our administration. Once verified, patients will be able to search and book appointments on your profile.
            </p>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="mb-4 text-dark">Doctor Dashboard</h2>

            {/* Stat Cards */}
            <div className="row g-4 mb-5">
              <div className="col-md-4">
                <div className="stat-card bg-white shadow-sm">
                  <div>
                    <h6 className="text-muted mb-1">Total Bookings</h6>
                    <h3 className="mb-0 fw-bold">{appointments.length}</h3>
                  </div>
                  <div className="stat-icon bg-primary text-white"><i className="bi bi-journals"></i></div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="stat-card bg-white shadow-sm">
                  <div>
                    <h6 className="text-muted mb-1">Pending Requests</h6>
                    <h3 className="mb-0 fw-bold">
                      {appointments.filter(app => app.status === 'Pending').length}
                    </h3>
                  </div>
                  <div className="stat-icon bg-warning text-white"><i className="bi bi-hourglass-split"></i></div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="stat-card bg-white shadow-sm">
                  <div>
                    <h6 className="text-muted mb-1">Completed Visits</h6>
                    <h3 className="mb-0 fw-bold">
                      {appointments.filter(app => app.status === 'Completed').length}
                    </h3>
                  </div>
                  <div className="stat-icon bg-success text-white"><i className="bi bi-check-circle-fill"></i></div>
                </div>
              </div>
            </div>

            {/* Next Patient Panel */}
            <div className="row g-4">
              <div className="col-lg-7">
                <div className="premium-card p-4">
                  <h5 className="mb-3 border-bottom pb-2">Pending Appointment Requests</h5>
                  {appointments.filter(app => app.status === 'Pending').length === 0 ? (
                    <p className="text-muted small mb-0 py-4 text-center">No pending appointment requests.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead>
                          <tr>
                            <th>Patient</th>
                            <th>Requested Date & Slot</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments
                            .filter(app => app.status === 'Pending')
                            .slice(0, 3)
                            .map(app => (
                              <tr key={app._id}>
                                <td className="fw-semibold text-dark">{app.patient?.name}</td>
                                <td className="small text-muted">{app.date} at {app.timeSlot}</td>
                                <td>
                                  <button
                                    onClick={() => setActiveTab('appointments')}
                                    className="btn btn-sm btn-outline-teal"
                                    id={`managePending-${app._id}`}
                                  >
                                    Manage
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="col-lg-5">
                <div className="premium-card p-4">
                  <h5 className="mb-3 border-bottom pb-2">Profile Overview</h5>
                  {doctorProfile ? (
                    <div className="small">
                      <p className="mb-2"><strong>Specialization:</strong> {doctorProfile.specialization}</p>
                      <p className="mb-2"><strong>Location:</strong> {doctorProfile.location}</p>
                      <p className="mb-2"><strong>Fees:</strong> ₹{doctorProfile.fees} INR</p>
                      <p className="mb-2"><strong>Experience:</strong> {doctorProfile.experience} Years</p>
                      <button onClick={() => setActiveTab('profile')} className="btn btn-outline-teal btn-sm w-100 mt-2">Edit Doctor Details</button>
                    </div>
                  ) : (
                    <p className="text-muted small">Loading profile...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* APPOINTMENTS TAB */}
        {activeTab === 'appointments' && (
          <div className="premium-card p-5">
            <h3 className="mb-4 text-dark">Consultation Bookings Management</h3>
            
            {appointments.length === 0 ? (
              <p className="text-muted text-center py-5">No patient bookings scheduled yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>Scheduled Slot</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Action Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(app => (
                      <tr key={app._id}>
                        <td>
                          <button
                            onClick={() => handleViewPatientDetails(app)}
                            className="btn btn-link p-0 text-decoration-none fw-semibold text-teal"
                            style={{ color: 'var(--primary)' }}
                            id={`viewPatient-${app._id}`}
                          >
                            {app.patient?.name || 'Unknown'}
                          </button>
                          <span className="d-block small text-muted">{app.patient?.phoneNumber || 'No phone'}</span>
                        </td>
                        <td>
                          <span className="fw-semibold">{app.date}</span>
                          <span className="d-block small text-muted">{app.timeSlot}</span>
                        </td>
                        <td className="small" style={{ maxWidth: '150px' }}>{app.reason}</td>
                        <td>
                          <span className={`badge ${app.status === 'Approved' ? 'bg-success' : app.status === 'Pending' ? 'bg-warning text-dark' : app.status === 'Completed' ? 'bg-secondary' : 'bg-danger'}`}>
                            {app.status}
                          </span>
                        </td>
                        <td>
                          {['Pending', 'Approved'].includes(app.status) ? (
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Add clinical notes..."
                              value={actionNotes[app._id] || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setActionNotes(prev => ({ ...prev, [app._id]: val }));
                              }}
                              id={`notesInput-${app._id}`}
                            />
                          ) : (
                            <span className="small text-muted">{app.notes || 'No notes added'}</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            {app.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(app._id, 'Approved')}
                                  className="btn btn-success btn-sm"
                                  id={`approveBtn-${app._id}`}
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(app._id, 'Rejected')}
                                  className="btn btn-danger btn-sm"
                                  id={`rejectBtn-${app._id}`}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {app.status === 'Approved' && (
                              <button
                                onClick={() => handleUpdateStatus(app._id, 'Completed')}
                                className="btn btn-primary btn-sm"
                                id={`completeBtn-${app._id}`}
                              >
                                Mark Completed
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Patient Details Detail View (Modal replacement) */}
            {selectedPatient && (
              <div className="mt-5 p-4 rounded-3 border bg-light">
                <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                  <h5 className="text-teal mb-0"><i className="bi bi-person-badge"></i> Patient Records: {selectedPatient.profile.name}</h5>
                  <button onClick={() => setSelectedPatient(null)} className="btn btn-close btn-sm"></button>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <p className="mb-1"><strong>Email:</strong> {selectedPatient.profile.email}</p>
                    <p className="mb-1"><strong>Phone Number:</strong> {selectedPatient.profile.phoneNumber || 'N/A'}</p>
                    <p className="mb-1"><strong>Address:</strong> {selectedPatient.profile.address || 'N/A'}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1"><strong>Reason for Current Visit:</strong></p>
                    <div className="p-2 bg-white rounded border small text-muted mb-2">{selectedPatient.currentReason}</div>
                    <p className="mb-0 small text-muted">Scheduled for: {selectedPatient.currentSlot}</p>
                  </div>
                </div>

                <h6 className="mt-4 border-bottom pb-1">Previous Consultation History</h6>
                {selectedPatient.history.length === 0 ? (
                  <p className="text-muted small mb-0">No past consultation records found for this patient.</p>
                ) : (
                  <div className="table-responsive mt-2 bg-white rounded border">
                    <table className="table table-sm table-hover mb-0 small">
                      <thead>
                        <tr>
                          <th>Date & Time</th>
                          <th>Reason</th>
                          <th>Status</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPatient.history.map(hist => (
                          <tr key={hist._id}>
                            <td>{hist.date} at {hist.timeSlot}</td>
                            <td>{hist.reason}</td>
                            <td>{hist.status}</td>
                            <td>{hist.notes || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* MANAGE AVAILABILITY TAB */}
        {activeTab === 'availability' && (
          <div className="row g-4">
            <div className="col-lg-5">
              <div className="premium-card p-4">
                <h5 className="mb-3 border-bottom pb-2">Add Available Slots</h5>
                
                <form onSubmit={handleSaveAvailability}>
                  <div className="mb-3">
                    <label htmlFor="availDateInput" className="form-label small fw-bold">Select Date</label>
                    <input
                      type="date"
                      id="availDateInput"
                      className="form-control form-control-custom"
                      value={availDate}
                      onChange={(e) => setAvailDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-bold">Choose Hour Slots</label>
                    <div className="row g-2">
                      {standardTimeSlots.map(slot => {
                        const isSelected = selectedSlots.includes(slot);
                        return (
                          <div className="col-4" key={slot}>
                            <button
                              type="button"
                              onClick={() => handleSlotToggle(slot)}
                              className={`btn btn-sm w-100 py-2 ${isSelected ? 'btn-teal text-white' : 'btn-outline-secondary'}`}
                              style={{
                                backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                                color: isSelected ? 'white' : '#64748b',
                                fontSize: '11px',
                                borderRadius: '6px'
                              }}
                              id={`addSlot-${slot.replace(' ', '-')}`}
                            >
                              {slot}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary-custom w-100" id="saveSlotsBtn">
                    Add Availability Slots
                  </button>
                </form>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="premium-card p-4 h-100">
                <h5 className="mb-3 border-bottom pb-2">Active Availability Calendar</h5>
                {doctorProfile?.availability?.length === 0 ? (
                  <p className="text-muted small text-center py-5">No available hours configured yet. Configure slots using the left form.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Available Time Slots</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {doctorProfile?.availability?.map(av => (
                          <tr key={av.date}>
                            <td className="fw-semibold text-dark">
                              {new Date(av.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </td>
                            <td>
                              <div className="d-flex flex-wrap gap-1">
                                {av.slots.length > 0 ? (
                                  av.slots.map(s => (
                                    <span key={s} className="badge bg-teal-light text-teal py-2 px-2" style={{ backgroundColor: 'rgba(13, 148, 136, 0.1)', color: 'var(--primary)' }}>
                                      {s}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-danger small">No slots left (Fully Booked)</span>
                                )}
                              </div>
                            </td>
                            <td>
                              <button
                                onClick={() => handleDeleteDateSlots(av.date)}
                                className="btn btn-link text-danger p-0"
                                id={`deleteDateSlots-${av.date}`}
                              >
                                <i className="bi bi-calendar-x-fill fs-5"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="premium-card p-5">
            <h3 className="mb-4 text-dark font-primary">Doctor Profile Information</h3>
            <form onSubmit={handleProfileUpdate}>
              <h5 className="border-bottom pb-2 mb-3 text-secondary"><i className="bi bi-person-fill"></i> User Information</h5>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label htmlFor="docProfName" className="form-label fw-semibold">Doctor Full Name</label>
                  <input
                    type="text"
                    id="docProfName"
                    className="form-control form-control-custom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted">Email (Read-only)</label>
                  <input
                    type="email"
                    className="form-control form-control-custom bg-light"
                    value={user?.email || ''}
                    disabled
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="docProfPhone" className="form-label fw-semibold">Phone Number</label>
                  <input
                    type="text"
                    id="docProfPhone"
                    className="form-control form-control-custom"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="docProfAddr" className="form-label fw-semibold">Mailing Address</label>
                  <input
                    type="text"
                    id="docProfAddr"
                    className="form-control form-control-custom"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              <h5 className="border-bottom pb-2 mb-3 text-secondary"><i className="bi bi-file-medical-fill"></i> Professional Clinic Settings</h5>
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <label htmlFor="docProfSpec" className="form-label fw-semibold">Medical Field</label>
                  <select
                    id="docProfSpec"
                    className="form-select form-control-custom"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    required
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label htmlFor="docProfExp" className="form-label fw-semibold">Experience (Years)</label>
                  <input
                    type="number"
                    id="docProfExp"
                    className="form-control form-control-custom"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="docProfFees" className="form-label fw-semibold">Consultation Fees (₹)</label>
                  <input
                    type="number"
                    id="docProfFees"
                    className="form-control form-control-custom"
                    value={fees}
                    onChange={(e) => setFees(e.target.value)}
                    required
                  />
                </div>
                <div className="col-12">
                  <label htmlFor="docProfLoc" className="form-label fw-semibold">Clinic Practice Location</label>
                  <input
                    type="text"
                    id="docProfLoc"
                    className="form-control form-control-custom"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
                <div className="col-12">
                  <label htmlFor="docProfBio" className="form-label fw-semibold">Doctor Bio / Background</label>
                  <textarea
                    id="docProfBio"
                    rows="4"
                    className="form-control form-control-custom"
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <button type="submit" className="btn btn-primary-custom px-4" id="saveDoctorProfile">
                Save Doctor Profile Changes
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default DoctorDashboard;
