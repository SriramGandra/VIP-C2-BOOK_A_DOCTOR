import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../services/api';

const DoctorsListing = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search state
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [locationState, setLocationState] = useState('');

  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };

  const query = useQuery();
  const specQuery = query.get('specialization');
  const locQuery = query.get('location');

  useEffect(() => {
    if (specQuery) setSpecialization(specQuery);
    if (locQuery) setLocationState(locQuery);
  }, [specQuery, locQuery]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      let url = '/doctors?';
      if (search) url += `search=${search}&`;
      if (specialization) url += `specialization=${specialization}&`;
      if (locationState) url += `location=${locationState}`;
      
      const res = await api.get(url);
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch doctor profiles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [search, specialization, locationState]);

  const handleClearFilters = () => {
    setSearch('');
    setSpecialization('');
    setLocationState('');
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
      <div className="row mb-4">
        <div className="col">
          <h1 className="h2 mb-2">Find a Registered Specialist</h1>
          <p className="text-muted">Browse through our verified healthcare providers to book your appointment online.</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Filter Sidebar */}
        <div className="col-lg-3">
          <div className="premium-card p-4 sticky-top" style={{ top: '90px', zIndex: 10 }}>
            <h5 className="mb-3 border-bottom pb-2">Filter Options</h5>
            
            <div className="mb-3">
              <label htmlFor="filterSearch" className="form-label small fw-bold">Search Doctor</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
                <input
                  type="text"
                  id="filterSearch"
                  className="form-control form-control-custom border-start-0 ps-0"
                  placeholder="Doctor Name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="filterSpec" className="form-label small fw-bold">Specialization</label>
              <select
                id="filterSpec"
                className="form-select form-control-custom"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
              >
                <option value="">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="filterLoc" className="form-label small fw-bold">Clinic Location</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><i className="bi bi-geo-alt text-muted"></i></span>
                <input
                  type="text"
                  id="filterLoc"
                  className="form-control form-control-custom border-start-0 ps-0"
                  placeholder="e.g. Apollo Hospital"
                  value={locationState}
                  onChange={(e) => setLocationState(e.target.value)}
                />
              </div>
            </div>

            <button className="btn btn-outline-danger w-100 mt-2" onClick={handleClearFilters} id="clearFiltersBtn">
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="col-lg-9">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading doctors...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger" role="alert">{error}</div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-5 premium-card p-5">
              <span className="fs-1">🔍</span>
              <h4 className="mt-3">No Doctors Found</h4>
              <p className="text-muted">Try adjusting your search query or filters.</p>
              <button className="btn btn-primary-custom mt-2" onClick={handleClearFilters}>
                Show All Doctors
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {doctors.map((doctor) => (
                <div className="col-md-6" key={doctor._id}>
                  <div className="premium-card p-4 h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div
                          className="avatar-placeholder rounded-circle bg-teal text-white d-flex align-items-center justify-content-center fw-bold fs-4"
                          style={{ width: '60px', height: '60px', backgroundColor: 'var(--primary)' }}
                        >
                          {doctor.user?.name ? doctor.user.name.charAt(4) === '.' ? doctor.user.name.split(' ')[1]?.charAt(0) : doctor.user.name.charAt(0) : 'D'}
                        </div>
                        <div>
                          <h5 className="mb-0 text-dark">{doctor.user?.name}</h5>
                          <span className="specialization-badge mt-1">{doctor.specialization}</span>
                        </div>
                      </div>

                      <p className="text-muted small mb-3 text-truncate-3">
                        {doctor.about || `Consult with ${doctor.user?.name}, providing quality ${doctor.specialization} services.`}
                      </p>

                      <div className="small text-dark mb-2">
                        <i className="bi bi-star-fill text-warning me-1"></i>
                        <strong>{doctor.experience} Years</strong> Experience
                      </div>

                      <div className="small text-dark mb-2">
                        <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                        {doctor.location}
                      </div>

                      <div className="small text-dark mb-3">
                        <i className="bi bi-cash-stack text-success me-1"></i>
                        <strong>₹{doctor.fees}</strong> Consultation Fee
                      </div>
                    </div>

                    <div className="d-grid mt-3">
                      <Link
                        to={`/doctors/${doctor._id}`}
                        className="btn btn-primary-custom"
                        id={`viewDoctor-${doctor._id}`}
                      >
                        View Profile & Book
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorsListing;
