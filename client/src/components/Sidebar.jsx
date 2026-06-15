import React from 'react';

const Sidebar = ({ role, activeTab, setActiveTab, userName }) => {
  const renderPatientLinks = () => (
    <>
      <button
        onClick={() => setActiveTab('overview')}
        className={`w-100 text-start border-0 sidebar-link ${activeTab === 'overview' ? 'active' : ''}`}
        id="tabPatientOverview"
      >
        <i className="bi bi-grid-1x2-fill"></i> Overview
      </button>
      <button
        onClick={() => setActiveTab('book')}
        className={`w-100 text-start border-0 sidebar-link ${activeTab === 'book' ? 'active' : ''}`}
        id="tabPatientBook"
      >
        <i className="bi bi-calendar-plus-fill"></i> Book Appointment
      </button>
      <button
        onClick={() => setActiveTab('history')}
        className={`w-100 text-start border-0 sidebar-link ${activeTab === 'history' ? 'active' : ''}`}
        id="tabPatientHistory"
      >
        <i className="bi bi-journal-medical"></i> Booking History
      </button>
      <button
        onClick={() => setActiveTab('documents')}
        className={`w-100 text-start border-0 sidebar-link ${activeTab === 'documents' ? 'active' : ''}`}
        id="tabPatientDocuments"
      >
        <i className="bi bi-file-earmark-medical-fill"></i> Medical Reports
      </button>
      <button
        onClick={() => setActiveTab('profile')}
        className={`w-100 text-start border-0 sidebar-link ${activeTab === 'profile' ? 'active' : ''}`}
        id="tabPatientProfile"
      >
        <i className="bi bi-person-fill-gear"></i> View/Edit Profile
      </button>
    </>
  );

  const renderDoctorLinks = () => (
    <>
      <button
        onClick={() => setActiveTab('overview')}
        className={`w-100 text-start border-0 sidebar-link ${activeTab === 'overview' ? 'active' : ''}`}
        id="tabDoctorOverview"
      >
        <i className="bi bi-grid-1x2-fill"></i> Overview
      </button>
      <button
        onClick={() => setActiveTab('appointments')}
        className={`w-100 text-start border-0 sidebar-link ${activeTab === 'appointments' ? 'active' : ''}`}
        id="tabDoctorAppointments"
      >
        <i className="bi bi-calendar-check-fill"></i> Appointments List
      </button>
      <button
        onClick={() => setActiveTab('availability')}
        className={`w-100 text-start border-0 sidebar-link ${activeTab === 'availability' ? 'active' : ''}`}
        id="tabDoctorAvailability"
      >
        <i className="bi bi-calendar-range-fill"></i> Manage Availability
      </button>
      <button
        onClick={() => setActiveTab('profile')}
        className={`w-100 text-start border-0 sidebar-link ${activeTab === 'profile' ? 'active' : ''}`}
        id="tabDoctorProfile"
      >
        <i className="bi bi-person-fill-gear"></i> Doctor Profile
      </button>
    </>
  );

  const renderAdminLinks = () => (
    <>
      <button
        onClick={() => setActiveTab('analytics')}
        className={`w-100 text-start border-0 sidebar-link ${activeTab === 'analytics' ? 'active' : ''}`}
        id="tabAdminAnalytics"
      >
        <i className="bi bi-bar-chart-line-fill"></i> Analytics Overview
      </button>
      <button
        onClick={() => setActiveTab('doctors')}
        className={`w-100 text-start border-0 sidebar-link ${activeTab === 'doctors' ? 'active' : ''}`}
        id="tabAdminDoctors"
      >
        <i className="bi bi-person-check-fill"></i> Doctor Approvals
      </button>
      <button
        onClick={() => setActiveTab('users')}
        className={`w-100 text-start border-0 sidebar-link ${activeTab === 'users' ? 'active' : ''}`}
        id="tabAdminUsers"
      >
        <i className="bi bi-people-fill"></i> Manage Accounts
      </button>
      <button
        onClick={() => setActiveTab('appointments')}
        className={`w-100 text-start border-0 sidebar-link ${activeTab === 'appointments' ? 'active' : ''}`}
        id="tabAdminAppointments"
      >
        <i className="bi bi-calendar3"></i> Manage Bookings
      </button>
    </>
  );

  return (
    <div className="dashboard-sidebar d-flex flex-column gap-4 shadow-lg">
      <div className="text-center py-2 border-bottom border-secondary">
        <div
          className="rounded-circle bg-teal d-flex align-items-center justify-content-center fw-bold mx-auto mb-3"
          style={{
            width: '64px',
            height: '64px',
            fontSize: '1.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'var(--secondary)'
          }}
        >
          {userName?.charAt(0).toUpperCase()}
        </div>
        <h5 className="text-white mb-1">{userName}</h5>
        <span className="badge bg-secondary mb-2" id="sidebarRoleBadge">{role}</span>
      </div>
      <nav className="nav flex-column flex-grow-1">
        {role === 'Patient' && renderPatientLinks()}
        {role === 'Doctor' && renderDoctorLinks()}
        {role === 'Admin' && renderAdminLinks()}
      </nav>
      <div className="small text-muted text-center">
        &copy; {new Date().getFullYear()} Book a Doctor
      </div>
    </div>
  );
};

export default Sidebar;
