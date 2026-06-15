import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'Admin') return '/admin';
    if (user.role === 'Doctor') return '/doctor';
    return '/patient';
  };

  // Filter unread notifications
  const unreadNotifications = user?.notifications?.filter(n => !n.read) || [];

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light premium-navbar shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <span style={{ fontSize: '1.5rem' }}>🩺</span>
          <span style={{ background: 'linear-gradient(45deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>
            Book a Doctor
          </span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          id="navbarToggler"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/" id="navHome">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/doctors" id="navDoctors">Find Doctors</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/contact" id="navContact">Contact Support</Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            {user ? (
              <>
                {/* Notifications Bell Dropdown */}
                <div className="dropdown">
                  <button
                    className="btn btn-link nav-link position-relative border-0 bg-transparent py-0"
                    type="button"
                    id="notificationsDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-bell-fill fs-5 text-secondary"></i>
                    {unreadNotifications.length > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" id="notifBadge">
                        {unreadNotifications.length}
                        <span className="visually-hidden">unread notifications</span>
                      </span>
                    )}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0 py-2" aria-labelledby="notificationsDropdown" style={{ width: '320px', borderRadius: '12px' }}>
                    <li className="px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
                      <span className="fw-bold text-dark">Notifications</span>
                      <span className="badge bg-primary-custom">{unreadNotifications.length} New</span>
                    </li>
                    <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                      {user.notifications && user.notifications.length > 0 ? (
                        user.notifications.slice(0).reverse().map((notif, index) => (
                          <li key={index} className="dropdown-item px-3 py-2 border-bottom" style={{ whiteSpace: 'normal', backgroundColor: notif.read ? 'transparent' : 'rgba(13, 148, 136, 0.05)' }}>
                            <p className="mb-1 small text-dark">{notif.message}</p>
                            <small className="text-muted" style={{ fontSize: '10px' }}>
                              {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </small>
                          </li>
                        ))
                      ) : (
                        <li className="px-3 py-4 text-center text-muted small">No notifications</li>
                      )}
                    </div>
                  </ul>
                </div>

                <div className="dropdown">
                  <button
                    className="btn btn-outline-teal dropdown-toggle d-flex align-items-center gap-2 border-0"
                    type="button"
                    id="userMenuButton"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <div className="avatar-placeholder rounded-circle bg-teal-light text-teal d-flex align-items-center justify-content-center fw-bold" style={{ width: '36px', height: '36px', backgroundColor: 'rgba(13, 148, 136, 0.1)', color: 'var(--primary)' }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="fw-semibold text-dark">{user.name.split(' ')[0]}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0 py-2 mt-2" aria-labelledby="userMenuButton" style={{ borderRadius: '12px' }}>
                    <li className="px-3 py-2 border-bottom">
                      <p className="mb-0 fw-bold text-dark">{user.name}</p>
                      <p className="mb-0 text-muted small">{user.role}</p>
                    </li>
                    <li>
                      <Link className="dropdown-item py-2" to={getDashboardLink()} id="navDashboard">
                        <i className="bi bi-speedometer2 me-2 text-primary"></i> Dashboard
                      </Link>
                    </li>
                    <li>
                      <button className="dropdown-item py-2 text-danger" onClick={handleLogout} id="navLogout">
                        <i className="bi bi-box-arrow-right me-2"></i> Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link className="btn btn-outline-teal fw-semibold" to="/login" id="navLoginBtn" style={{ color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: '10px', padding: '8px 20px' }}>
                  Login
                </Link>
                <Link className="btn btn-primary-custom" to="/register" id="navRegisterBtn" style={{ borderRadius: '10px', padding: '8px 20px' }}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
