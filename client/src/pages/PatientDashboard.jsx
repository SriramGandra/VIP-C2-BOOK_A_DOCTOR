import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const PatientDashboard = () => {
  const { user, updateProfile, refreshUser } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Tabs state: overview, profile, book, history, documents
  const [activeTab, setActiveTab] = useState('overview');

  // Load URL queries for tab transitions (e.g. ?tab=history)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['overview', 'profile', 'book', 'history', 'documents'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);

  // General States
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [address, setAddress] = useState(user?.address || '');

  // Document Upload States
  const [docTitle, setDocTitle] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Fetch all appointments
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

  // Fetch approved doctors
  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors');
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch medical documents
  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      if (res.data.success) {
        setDocuments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppointments();
      fetchDoctors();
      fetchDocuments();
      refreshUser();
    }
  }, [activeTab]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrorMsg('');
    const res = await updateProfile({ name, phoneNumber, address });
    if (res.success) {
      setMessage('Profile updated successfully!');
    } else {
      setErrorMsg(res.error);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await api.put(`/appointments/${id}/cancel`);
      if (res.data.success) {
        alert(res.data.message || 'Appointment cancelled');
        fetchAppointments();
        refreshUser();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!docTitle || !docFile) {
      setErrorMsg('Please enter a document title and select a file');
      return;
    }
    setUploadLoading(true);
    setMessage('');
    setErrorMsg('');

    const formData = new FormData();
    formData.append('title', docTitle);
    formData.append('document', docFile);

    try {
      const res = await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        setMessage('Report uploaded successfully!');
        setDocTitle('');
        setDocFile(null);
        // Reset file input element
        const fileInput = document.getElementById('reportFileInput');
        if (fileInput) fileInput.value = '';
        
        fetchDocuments();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to upload report. Check file size or type.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      const res = await api.delete(`/documents/${id}`);
      if (res.data.success) {
        alert('Medical report deleted successfully');
        fetchDocuments();
      }
    } catch (err) {
      alert('Failed to delete report');
    }
  };

  // Get next upcoming appointment
  const nextAppointment = appointments
    .filter(app => ['Pending', 'Approved'].includes(app.status))
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  return (
    <div className="dashboard-container">
      <Sidebar role="Patient" activeTab={activeTab} setActiveTab={setActiveTab} userName={user?.name} />

      <div className="dashboard-content">
        {message && <div className="alert alert-success alert-dismissible fade show" role="alert">{message}</div>}
        {errorMsg && <div className="alert alert-danger alert-dismissible fade show" role="alert">{errorMsg}</div>}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="mb-4 text-dark">Welcome back, {user?.name}!</h2>
            
            {/* Stat Cards */}
            <div className="row g-4 mb-5">
              <div className="col-md-4">
                <div className="stat-card bg-white shadow-sm">
                  <div>
                    <h6 className="text-muted mb-1">Total Reports</h6>
                    <h3 className="mb-0 fw-bold">{documents.length}</h3>
                  </div>
                  <div className="stat-icon bg-info text-white"><i className="bi bi-file-earmark-medical"></i></div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="stat-card bg-white shadow-sm">
                  <div>
                    <h6 className="text-muted mb-1">Active Bookings</h6>
                    <h3 className="mb-0 fw-bold">
                      {appointments.filter(app => ['Pending', 'Approved'].includes(app.status)).length}
                    </h3>
                  </div>
                  <div className="stat-icon bg-success text-white"><i className="bi bi-calendar-check"></i></div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="stat-card bg-white shadow-sm">
                  <div>
                    <h6 className="text-muted mb-1">Notifications</h6>
                    <h3 className="mb-0 fw-bold">{user?.notifications?.filter(n => !n.read).length || 0}</h3>
                  </div>
                  <div className="stat-icon bg-warning text-white"><i className="bi bi-bell"></i></div>
                </div>
              </div>
            </div>

            {/* Next Appointment Promo */}
            {nextAppointment ? (
              <div className="premium-card p-4 border-start border-4 border-teal mb-4 bg-teal-light" style={{ borderLeftColor: 'var(--primary) !important' }}>
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <span className="badge bg-primary mb-2" id="nextAppBadge">Upcoming Appointment</span>
                    <h5>Dr. {nextAppointment.doctor?.user?.name} - {nextAppointment.doctor?.specialization}</h5>
                    <p className="text-muted mb-0">
                      <i className="bi bi-calendar3 me-2"></i> {new Date(nextAppointment.date).toLocaleDateString()} at {nextAppointment.timeSlot}
                    </p>
                    <p className="text-muted small mb-0"><i className="bi bi-geo-alt me-2"></i> {nextAppointment.doctor?.location}</p>
                  </div>
                  <div className="col-md-4 text-md-end mt-3 mt-md-0">
                    <span className={`badge py-2 px-3 fs-6 ${nextAppointment.status === 'Approved' ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {nextAppointment.status}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="premium-card p-5 text-center mb-4 bg-light border">
                <h5>No Upcoming Appointments Scheduled</h5>
                <p className="text-muted small">Need consultation? Find a verified doctor and schedule a booking.</p>
                <button onClick={() => setActiveTab('book')} className="btn btn-primary-custom mt-2">Book Appointment Now</button>
              </div>
            )}

            {/* Recent Bookings List */}
            <div className="premium-card p-4 mt-4">
              <h5 className="mb-3 border-bottom pb-2">Recent Booking Actions</h5>
              {appointments.length === 0 ? (
                <p className="text-muted small mb-0 text-center py-4">No appointments history found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Doctor</th>
                        <th>Date & Time</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.slice(0, 3).map(app => (
                        <tr key={app._id}>
                          <td>
                            <span className="fw-semibold text-dark">Dr. {app.doctor?.user?.name || 'Doctor'}</span>
                            <span className="d-block small text-muted">{app.doctor?.specialization}</span>
                          </td>
                          <td>
                            <span>{new Date(app.date).toLocaleDateString()}</span>
                            <span className="d-block small text-muted">{app.timeSlot}</span>
                          </td>
                          <td className="small text-truncate" style={{ maxWidth: '180px' }}>{app.reason}</td>
                          <td>
                            <span className={`badge ${app.status === 'Approved' ? 'bg-success' : app.status === 'Pending' ? 'bg-warning text-dark' : app.status === 'Completed' ? 'bg-secondary' : 'bg-danger'}`}>
                              {app.status}
                            </span>
                          </td>
                          <td>
                            {['Pending', 'Approved'].includes(app.status) && (
                              <button onClick={() => handleCancelAppointment(app._id)} className="btn btn-outline-danger btn-sm" id={`cancelRecent-${app._id}`}>
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOOK APPOINTMENT TAB */}
        {activeTab === 'book' && (
          <div>
            <h2 className="mb-4 text-dark">Book an Appointment</h2>
            <p className="text-muted">Choose a verified doctor below to see availability and request consultation slots.</p>
            
            <div className="row g-4">
              {doctors.map(doc => (
                <div className="col-md-6" key={doc._id}>
                  <div className="premium-card p-4 h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="avatar-placeholder rounded-circle bg-teal text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '48px', height: '48px', backgroundColor: 'var(--primary)' }}>
                          {doc.user?.name ? doc.user.name.charAt(4) === '.' ? doc.user.name.split(' ')[1]?.charAt(0) : doc.user.name.charAt(0) : 'D'}
                        </div>
                        <div>
                          <h6 className="mb-0 text-dark">{doc.user?.name}</h6>
                          <span className="specialization-badge py-1 px-2 mt-1" style={{ fontSize: '10px' }}>{doc.specialization}</span>
                        </div>
                      </div>
                      <p className="text-muted small text-truncate-2 mb-3">{doc.about || `Consult with Dr. ${doc.user?.name}`}</p>
                      <div className="small text-dark mb-1"><i className="bi bi-geo-alt-fill text-danger me-1"></i> {doc.location}</div>
                      <div className="small text-dark mb-3"><i className="bi bi-cash-stack text-success me-1"></i> Fee: ₹{doc.fees} INR</div>
                    </div>
                    <Link to={`/doctors/${doc._id}`} className="btn btn-primary-custom w-100 mt-2" id={`bookDoc-${doc._id}`}>
                      View Available Slots & Book
                    </Link>
                  </div>
                </div>
              ))}
              {doctors.length === 0 && (
                <p className="text-center text-muted py-5">No approved doctors currently available in the database.</p>
              )}
            </div>
          </div>
        )}

        {/* BOOKING HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="premium-card p-5">
            <h3 className="mb-4 text-dark">Appointment Booking History</h3>
            
            {appointments.length === 0 ? (
              <div className="text-center py-5">
                <span className="fs-1">📅</span>
                <h5 className="mt-3">No Appointments Yet</h5>
                <p className="text-muted">You haven't scheduled any healthcare sessions yet.</p>
                <button onClick={() => setActiveTab('book')} className="btn btn-primary-custom mt-2">Book Appointment</button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Doctor Details</th>
                      <th>Clinic Location</th>
                      <th>Requested Slot</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Doctor Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(app => (
                      <tr key={app._id}>
                        <td>
                          <span className="fw-semibold text-dark">Dr. {app.doctor?.user?.name || 'Doctor'}</span>
                          <span className="d-block small text-muted">{app.doctor?.specialization}</span>
                        </td>
                        <td className="small">{app.doctor?.location}</td>
                        <td>
                          <span className="fw-semibold">{new Date(app.date).toLocaleDateString()}</span>
                          <span className="d-block small text-muted">{app.timeSlot}</span>
                        </td>
                        <td className="small" style={{ maxWidth: '150px', overflowWrap: 'break-word' }}>{app.reason}</td>
                        <td>
                          <span className={`badge ${app.status === 'Approved' ? 'bg-success' : app.status === 'Pending' ? 'bg-warning text-dark' : app.status === 'Completed' ? 'bg-secondary' : 'bg-danger'}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="small text-muted">{app.notes || 'No notes added'}</td>
                        <td>
                          {['Pending', 'Approved'].includes(app.status) && (
                            <button
                              onClick={() => handleCancelAppointment(app._id)}
                              className="btn btn-outline-danger btn-sm"
                              id={`cancelHistory-${app._id}`}
                            >
                              Cancel Booking
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MEDICAL REPORTS TAB */}
        {activeTab === 'documents' && (
          <div className="row g-4">
            {/* Upload form */}
            <div className="col-lg-4">
              <div className="premium-card p-4">
                <h5 className="mb-3 border-bottom pb-2">Upload Medical Report</h5>
                <form onSubmit={handleFileUpload}>
                  <div className="mb-3">
                    <label htmlFor="docTitleInput" className="form-label small fw-bold">Report Title</label>
                    <input
                      type="text"
                      id="docTitleInput"
                      className="form-control form-control-custom"
                      placeholder="e.g. Blood Test Result"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="reportFileInput" className="form-label small fw-bold">Select File (PDF or Image)</label>
                    <input
                      type="file"
                      id="reportFileInput"
                      className="form-control form-control-custom"
                      onChange={(e) => setDocFile(e.target.files[0])}
                      required
                    />
                    <small className="text-muted d-block mt-1">Allowed types: PNG, JPEG, JPG, PDF. Max size 5MB.</small>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary-custom w-100"
                    disabled={uploadLoading}
                    id="uploadDocBtn"
                  >
                    {uploadLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Uploading...
                      </>
                    ) : 'Upload File'}
                  </button>
                </form>
              </div>
            </div>

            {/* Reports listing */}
            <div className="col-lg-8">
              <div className="premium-card p-4 h-100">
                <h5 className="mb-3 border-bottom pb-2">Uploaded Medical Records</h5>
                
                {documents.length === 0 ? (
                  <p className="text-muted small text-center py-5">No medical reports uploaded yet. Upload a report using the left form.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Report Name</th>
                          <th>Upload Date</th>
                          <th>File Link</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map(doc => (
                          <tr key={doc._id}>
                            <td className="fw-semibold text-dark">{doc.title}</td>
                            <td className="small text-muted">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                            <td>
                              <a
                                href={`http://localhost:5000${doc.filePath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-teal d-inline-flex align-items-center gap-1"
                                style={{ borderRadius: '6px' }}
                                id={`viewFile-${doc._id}`}
                              >
                                <i className="bi bi-file-earmark-arrow-down"></i> View File
                              </a>
                            </td>
                            <td>
                              <button
                                onClick={() => handleDeleteDocument(doc._id)}
                                className="btn btn-link text-danger p-0"
                                id={`deleteDoc-${doc._id}`}
                              >
                                <i className="bi bi-trash-fill fs-5"></i>
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
          <div className="premium-card p-5 max-width-700">
            <h3 className="mb-4 text-dark">View & Update Profile</h3>
            <form onSubmit={handleProfileUpdate}>
              <div className="mb-3">
                <label className="form-label fw-bold small text-muted">Email Address (Read-only)</label>
                <input
                  type="email"
                  className="form-control form-control-custom bg-light"
                  value={user?.email || ''}
                  disabled
                />
              </div>

              <div className="mb-3">
                <label htmlFor="profName" className="form-label fw-bold small">Full Name</label>
                <input
                  type="text"
                  id="profName"
                  className="form-control form-control-custom"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="profPhone" className="form-label fw-bold small">Phone Number</label>
                <input
                  type="text"
                  id="profPhone"
                  className="form-control form-control-custom"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="profAddress" className="form-label fw-bold small">Mailing Address</label>
                <input
                  type="text"
                  id="profAddress"
                  className="form-control form-control-custom"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary-custom px-4" id="savePatientProfile">
                Save Profile Changes
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default PatientDashboard;
