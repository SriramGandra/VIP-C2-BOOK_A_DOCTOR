import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Home = () => {
  const [specialization, setSpecialization] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    let query = '';
    if (specialization) query += `specialization=${specialization}&`;
    if (location) query += `location=${location}`;
    navigate(`/doctors?${query}`);
  };

  const specializations = [
    'Cardiology',
    'Pediatrics',
    'General Medicine',
    'Dermatology',
    'Neurology',
    'Orthopedics'
  ];

  return (
    <div className="container py-5">
      {/* Hero Section */}
      <div className="hero-section text-center text-lg-start mb-5 shadow-sm">
        <div className="row align-items-center">
          <div className="col-lg-7 px-lg-5 mb-4 mb-lg-0">
            <span className="badge bg-teal-light text-teal mb-3 px-3 py-2 fw-semibold fs-6" style={{ backgroundColor: 'rgba(13, 148, 136, 0.1)', color: 'var(--primary)' }}>
              🩺 Medical Excellence Always
            </span>
            <h1 className="display-4 fw-bold mb-3" style={{ lineHeight: '1.2' }}>
              Your Health, <br />
              <span style={{ color: 'var(--primary)' }}>Our Primary Service</span>
            </h1>
            <p className="lead text-muted mb-4">
              Connect with top-rated, certified medical practitioners. Check real-time availability, secure your appointments, and keep digital medical records in one secure place.
            </p>
            <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
              <Link to="/doctors" className="btn btn-primary-custom px-4 py-3 fs-5" id="heroFindDoctors">
                <i className="bi bi-search me-2"></i> Find Doctors
              </Link>
              <Link to="/register" className="btn btn-outline-teal px-4 py-3 fs-5" style={{ color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: '10px' }} id="heroJoinAsDoctor">
                Join as Doctor
              </Link>
            </div>
          </div>
          <div className="col-lg-5 text-center">
            {/* Visual element */}
            <div className="p-4 bg-white rounded-circle d-inline-block shadow-lg mx-auto" style={{ border: '8px solid rgba(13, 148, 136, 0.1)' }}>
              <div className="d-flex align-items-center justify-content-center bg-teal text-white rounded-circle" style={{ width: '280px', height: '280px', backgroundColor: 'var(--primary)', fontSize: '6rem' }}>
                🩺
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar Container */}
      <div className="row justify-content-center mb-5">
        <div className="col-lg-10">
          <div className="premium-card p-4 shadow-lg" style={{ marginTop: '-40px' }}>
            <form onSubmit={handleSearch} className="row g-3 align-items-center">
              <div className="col-md-5">
                <label htmlFor="searchSpec" className="form-label fw-bold text-dark"><i className="bi bi-tag-fill text-teal me-1"></i> Specialization</label>
                <select
                  id="searchSpec"
                  className="form-select form-control-custom"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                >
                  <option value="">Select Specialization</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-5">
                <label htmlFor="searchLoc" className="form-label fw-bold text-dark"><i className="bi bi-geo-alt-fill text-teal me-1"></i> Location</label>
                <input
                  type="text"
                  id="searchLoc"
                  className="form-control form-control-custom"
                  placeholder="e.g. Apollo Hospital, Delhi"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="col-md-2 d-grid align-self-end">
                <button type="submit" className="btn btn-primary-custom py-3" id="homeSearchBtn">
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Stats Counter */}
      <div className="row text-center mb-5 g-4">
        <div className="col-md-4">
          <div className="premium-card p-4">
            <h2 className="display-5 fw-bold text-teal" style={{ color: 'var(--primary)' }}>500+</h2>
            <p className="text-muted mb-0 fw-semibold">Verified Medical Specialists</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="premium-card p-4">
            <h2 className="display-5 fw-bold text-teal" style={{ color: 'var(--primary)' }}>25,000+</h2>
            <p className="text-muted mb-0 fw-semibold">Successful Consultations</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="premium-card p-4">
            <h2 className="display-5 fw-bold text-teal" style={{ color: 'var(--primary)' }}>99.2%</h2>
            <p className="text-muted mb-0 fw-semibold">Patient Satisfaction Rating</p>
          </div>
        </div>
      </div>

      {/* Specialization Quick Links */}
      <div className="mb-5">
        <h2 className="text-center mb-4">Search by Specialization</h2>
        <div className="row g-3 justify-content-center">
          {specializations.map((spec, index) => {
            const icons = {
              Cardiology: '❤️',
              Pediatrics: '👶',
              'General Medicine': '🏥',
              Dermatology: '🧴',
              Neurology: '🧠',
              Orthopedics: '🦴'
            };
            return (
              <div className="col-6 col-md-4 col-lg-2" key={index}>
                <Link
                  to={`/doctors?specialization=${spec}`}
                  className="text-decoration-none"
                >
                  <div className="premium-card text-center p-3 h-100 d-flex flex-column align-items-center justify-content-center">
                    <span className="fs-1 mb-2">{icons[spec] || '🩺'}</span>
                    <h6 className="text-dark mb-0">{spec}</h6>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-3 p-5 shadow-sm border mb-5">
        <h2 className="text-center mb-5">How "Book a Doctor" Works</h2>
        <div className="row g-4 text-center">
          <div className="col-md-4">
            <div className="fs-1 mb-3">🔍</div>
            <h4>1. Find a Specialist</h4>
            <p className="text-muted">
              Filter and search verified doctors by their medical field, clinic location, or consultation pricing.
            </p>
          </div>
          <div className="col-md-4">
            <div className="fs-1 mb-3">📅</div>
            <h4>2. Select Date & Slot</h4>
            <p className="text-muted">
              Choose an available date and time slot that fits your personal schedule directly on the doctor's profile.
            </p>
          </div>
          <div className="col-md-4">
            <div className="fs-1 mb-3">✅</div>
            <h4>3. Book and Consult</h4>
            <p className="text-muted">
              Provide booking details, receive instant notifications, and consult your doctor hassle-free.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
