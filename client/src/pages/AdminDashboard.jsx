import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const AdminDashboard = () => {
  const { user, refreshUser } = useContext(AuthContext);

  // Tabs state: analytics, doctors, users, appointments
  const [activeTab, setActiveTab] = useState('analytics');

  // Dashboard Stats
  const [stats, setStats] = useState(null);
  const [pendingDocs, setPendingDocs] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch admin dashboard analytics
  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load dashboard statistics.');
    }
  };

  // Fetch pending doctor approvals
  const fetchPendingDocs = async () => {
    try {
      const res = await api.get('/admin/pending-doctors');
      if (res.data.success) {
        setPendingDocs(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsersList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch all appointments
  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      if (res.data.success) {
        setAppointmentsList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadAdminData = async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(),
      fetchPendingDocs(),
      fetchUsers(),
      fetchAppointments()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      loadAdminData();
      refreshUser();
    }
  }, [activeTab]);

  const handleApproveDoctor = async (id, isApproved) => {
    if (!window.confirm(`Are you sure you want to ${isApproved ? 'approve' : 'reject'} this doctor?`)) return;
    try {
      const res = await api.put(`/admin/approve-doctor/${id}`, { isApproved });
      if (res.data.success) {
        alert(res.data.message || 'Doctor profile status updated');
        fetchPendingDocs();
        fetchStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update approval status');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('WARNING: Deleting this user will also delete all of their associated appointments/profiles. Are you sure?')) return;
    try {
      const res = await api.delete(`/admin/users/${id}`);
      if (res.data.success) {
        alert('Account deleted successfully');
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleUpdateAppointmentStatus = async (id, status) => {
    if (!window.confirm(`Mark this appointment status as ${status}?`)) return;
    try {
      const res = await api.put(`/appointments/${id}/status`, { status });
      if (res.data.success) {
        alert(`Appointment status updated to ${status}`);
        fetchAppointments();
        fetchStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update appointment status');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar role="Admin" activeTab={activeTab} setActiveTab={setActiveTab} userName={user?.name} />

      <div className="dashboard-content">
        {errorMsg && <div className="alert alert-danger" role="alert">{errorMsg}</div>}

        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && stats && (
              <div>
                <h2 className="mb-4 text-dark">Analytics Dashboard Overview</h2>
                
                {/* Upper Statistics row */}
                <div className="row g-4 mb-5">
                  <div className="col-md-3">
                    <div className="stat-card bg-white shadow-sm">
                      <div>
                        <h6 className="text-muted mb-1 font-primary">Total Registered</h6>
                        <h3 className="mb-0 fw-bold">{stats.users.total}</h3>
                      </div>
                      <div className="stat-icon bg-primary text-white"><i className="bi bi-people-fill"></i></div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="stat-card bg-white shadow-sm">
                      <div>
                        <h6 className="text-muted mb-1">Approved Doctors</h6>
                        <h3 className="mb-0 fw-bold">{stats.doctorsApproval.approved}</h3>
                      </div>
                      <div className="stat-icon bg-teal text-white" style={{ backgroundColor: 'var(--primary)' }}><i className="bi bi-person-check-fill"></i></div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="stat-card bg-white shadow-sm">
                      <div>
                        <h6 className="text-muted mb-1">Pending Approvals</h6>
                        <h3 className="mb-0 fw-bold">{stats.doctorsApproval.pending}</h3>
                      </div>
                      <div className="stat-icon bg-warning text-white"><i className="bi bi-person-exclamation"></i></div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="stat-card bg-white shadow-sm">
                      <div>
                        <h6 className="text-muted mb-1">Total Bookings</h6>
                        <h3 className="mb-0 fw-bold">{stats.appointments.total}</h3>
                      </div>
                      <div className="stat-icon bg-info text-white"><i className="bi bi-journal-check"></i></div>
                    </div>
                  </div>
                </div>

                {/* Lower Charts row */}
                <div className="row g-4">
                  <div className="col-lg-6">
                    <div className="premium-card p-4 h-100">
                      <h5 className="mb-3 border-bottom pb-2">User Accounts Distribution</h5>
                      <div className="d-flex flex-column gap-3 mt-3">
                        <div>
                          <div className="d-flex justify-content-between mb-1 small">
                            <span>Patients ({stats.users.patients})</span>
                            <span className="fw-semibold">{Math.round((stats.users.patients / stats.users.total) * 100 || 0)}%</span>
                          </div>
                          <div className="progress" style={{ height: '8px' }}>
                            <div className="progress-bar bg-success" role="progressbar" style={{ width: `${(stats.users.patients / stats.users.total) * 100 || 0}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="d-flex justify-content-between mb-1 small">
                            <span>Doctors ({stats.users.doctors})</span>
                            <span className="fw-semibold">{Math.round((stats.users.doctors / stats.users.total) * 100 || 0)}%</span>
                          </div>
                          <div className="progress" style={{ height: '8px' }}>
                            <div className="progress-bar bg-info" role="progressbar" style={{ width: `${(stats.users.doctors / stats.users.total) * 100 || 0}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="d-flex justify-content-between mb-1 small">
                            <span>Administrators ({stats.users.admins})</span>
                            <span className="fw-semibold">{Math.round((stats.users.admins / stats.users.total) * 100 || 0)}%</span>
                          </div>
                          <div className="progress" style={{ height: '8px' }}>
                            <div className="progress-bar bg-dark" role="progressbar" style={{ width: `${(stats.users.admins / stats.users.total) * 100 || 0}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="premium-card p-4 h-100">
                      <h5 className="mb-3 border-bottom pb-2">Appointment Status Details</h5>
                      <div className="row g-3 text-center mt-2">
                        <div className="col-6 col-sm-3">
                          <div className="p-3 bg-light rounded border">
                            <span className="d-block text-muted small">Pending</span>
                            <span className="fs-4 fw-bold text-warning">{stats.appointments.pending}</span>
                          </div>
                        </div>
                        <div className="col-6 col-sm-3">
                          <div className="p-3 bg-light rounded border">
                            <span className="d-block text-muted small">Approved</span>
                            <span className="fs-4 fw-bold text-success">{stats.appointments.approved}</span>
                          </div>
                        </div>
                        <div className="col-6 col-sm-3">
                          <div className="p-3 bg-light rounded border">
                            <span className="d-block text-muted small">Rejected</span>
                            <span className="fs-4 fw-bold text-danger">{stats.appointments.rejected}</span>
                          </div>
                        </div>
                        <div className="col-6 col-sm-3">
                          <div className="p-3 bg-light rounded border">
                            <span className="d-block text-muted small">Completed</span>
                            <span className="fs-4 fw-bold text-secondary">{stats.appointments.completed}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DOCTOR APPROVALS TAB */}
            {activeTab === 'doctors' && (
              <div className="premium-card p-5">
                <h3 className="mb-4 text-dark">Verify Doctor Registrations</h3>
                {pendingDocs.length === 0 ? (
                  <p className="text-muted text-center py-5">No doctor registrations pending verification at this time.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Doctor Name</th>
                          <th>Medical Specialization</th>
                          <th>Experience</th>
                          <th>Clinic Fees</th>
                          <th>Practice Location</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingDocs.map(doc => (
                          <tr key={doc._id}>
                            <td>
                              <span className="fw-semibold text-dark">{doc.user?.name}</span>
                              <span className="d-block small text-muted">{doc.user?.email}</span>
                            </td>
                            <td><span className="specialization-badge">{doc.specialization}</span></td>
                            <td className="small">{doc.experience} Years</td>
                            <td className="small">₹{doc.fees} INR</td>
                            <td className="small text-muted">{doc.location}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <button
                                  onClick={() => handleApproveDoctor(doc._id, true)}
                                  className="btn btn-success btn-sm"
                                  id={`approveDoc-${doc._id}`}
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleApproveDoctor(doc._id, false)}
                                  className="btn btn-danger btn-sm"
                                  id={`rejectDoc-${doc._id}`}
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* MANAGE USERS TAB */}
            {activeTab === 'users' && (
              <div className="premium-card p-5">
                <h3 className="mb-4 text-dark">Manage User Accounts</h3>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Account Name</th>
                        <th>Email Address</th>
                        <th>Phone Number</th>
                        <th>Account Role</th>
                        <th>Address</th>
                        <th>Registered On</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map(u => (
                        <tr key={u._id}>
                          <td className="fw-semibold text-dark">{u.name}</td>
                          <td>{u.email}</td>
                          <td className="small text-muted">{u.phoneNumber || 'N/A'}</td>
                          <td>
                            <span className={`badge ${u.role === 'Admin' ? 'bg-dark' : u.role === 'Doctor' ? 'bg-info' : 'bg-success'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="small" style={{ maxWidth: '150px' }}>{u.address || 'N/A'}</td>
                          <td className="small text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td>
                            {u._id === user._id ? (
                              <span className="text-muted small">Logged In</span>
                            ) : (
                              <button
                                onClick={() => handleDeleteUser(u._id)}
                                className="btn btn-link text-danger p-0"
                                id={`deleteUser-${u._id}`}
                              >
                                <i className="bi bi-trash-fill fs-5"></i>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MANAGE APPOINTMENTS TAB */}
            {activeTab === 'appointments' && (
              <div className="premium-card p-5">
                <h3 className="mb-4 text-dark">Manage Appointment Bookings</h3>
                {appointmentsList.length === 0 ? (
                  <p className="text-muted text-center py-5">No appointments booked in the system yet.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Patient Name</th>
                          <th>Assigned Doctor</th>
                          <th>Appointment Slot</th>
                          <th>Reason</th>
                          <th>Status</th>
                          <th>Notes</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointmentsList.map(app => (
                          <tr key={app._id}>
                            <td className="fw-semibold">{app.patient?.name || 'Unknown'}</td>
                            <td>
                              <span className="fw-semibold">Dr. {app.doctor?.user?.name || 'Doctor'}</span>
                              <span className="d-block small text-muted">{app.doctor?.specialization}</span>
                            </td>
                            <td>
                              <span>{app.date}</span>
                              <span className="d-block small text-muted">{app.timeSlot}</span>
                            </td>
                            <td className="small text-truncate" style={{ maxWidth: '150px' }}>{app.reason}</td>
                            <td>
                              <span className={`badge ${app.status === 'Approved' ? 'bg-success' : app.status === 'Pending' ? 'bg-warning text-dark' : app.status === 'Completed' ? 'bg-secondary' : 'bg-danger'}`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="small text-muted">{app.notes || 'N/A'}</td>
                            <td>
                              <div className="d-flex gap-1">
                                {app.status === 'Pending' && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateAppointmentStatus(app._id, 'Approved')}
                                      className="btn btn-success btn-sm py-1 px-2"
                                      id={`adminApprove-${app._id}`}
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleUpdateAppointmentStatus(app._id, 'Rejected')}
                                      className="btn btn-danger btn-sm py-1 px-2"
                                      id={`adminReject-${app._id}`}
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                {['Approved', 'Pending'].includes(app.status) && (
                                  <button
                                    onClick={() => handleUpdateAppointmentStatus(app._id, 'Completed')}
                                    className="btn btn-secondary btn-sm py-1 px-2"
                                    id={`adminComplete-${app._id}`}
                                  >
                                    Complete
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
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
