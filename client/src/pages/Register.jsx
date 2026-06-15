import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const { register, user, error: authError, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  const [role, setRole] = useState('Patient'); // 'Patient' or 'Doctor'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  // Doctor-specific fields
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');
  const [fees, setFees] = useState('');
  const [location, setLocation] = useState('');
  const [about, setAbout] = useState('');

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === 'Admin') navigate('/admin');
      else if (user.role === 'Doctor') navigate('/doctor');
      else navigate('/patient');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setError(null);

    // Basic Validation
    if (!name || !email || !password) {
      setFormError('Please enter name, email, and password');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    const userData = {
      name,
      email,
      password,
      role,
      phoneNumber,
      address
    };

    if (role === 'Doctor') {
      if (!specialization || !experience || !fees || !location) {
        setFormError('Please complete all Doctor profile details (Specialization, Experience, Fees, Clinic Location)');
        return;
      }
      userData.specialization = specialization;
      userData.experience = Number(experience);
      userData.fees = Number(fees);
      userData.location = location;
      userData.about = about;
    }

    setLoading(true);
    const result = await register(userData);
    setLoading(false);

    if (!result.success) {
      setFormError(result.error);
    }
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
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="premium-card p-5 shadow-lg">

            <div className="text-center mb-4">
              <span className="fs-1">📝</span>
              <h2 className="mt-3 mb-1">Create Account</h2>
              <p className="text-muted">Register to schedule appointments or manage patients</p>

              {/* Role Toggle Tabs */}
              <div className="d-flex justify-content-center gap-2 mt-4 bg-light p-1 rounded-3 mx-auto" style={{ maxWidth: '300px' }}>
                <button
                  type="button"
                  className={`btn py-2 px-4 border-0 flex-grow-1 ${role === 'Patient' ? 'btn-teal text-white' : 'btn-link text-muted text-decoration-none'}`}
                  onClick={() => setRole('Patient')}
                  style={{
                    backgroundColor: role === 'Patient' ? 'var(--primary)' : 'transparent',
                    borderRadius: '8px',
                    fontWeight: 600
                  }}
                  id="regRolePatient"
                >
                  Patient
                </button>
                <button
                  type="button"
                  className={`btn py-2 px-4 border-0 flex-grow-1 ${role === 'Doctor' ? 'btn-teal text-white' : 'btn-link text-muted text-decoration-none'}`}
                  onClick={() => setRole('Doctor')}
                  style={{
                    backgroundColor: role === 'Doctor' ? 'var(--primary)' : 'transparent',
                    borderRadius: '8px',
                    fontWeight: 600
                  }}
                  id="regRoleDoctor"
                >
                  Doctor
                </button>
              </div>
            </div>

            {(formError || authError) && (
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i> {formError || authError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <h5 className="border-bottom pb-2 mb-3 text-dark"><i className="bi bi-person-fill text-teal me-1"></i> Account Credentials</h5>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label htmlFor="regName" className="form-label fw-semibold">Full Name</label>
                  <input
                    type="text"
                    id="regName"
                    className="form-control form-control-custom"
                    placeholder="e.g. Ram"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="regEmail" className="form-label fw-semibold">Email Address</label>
                  <input
                    type="email"
                    id="regEmail"
                    className="form-control form-control-custom"
                    placeholder="e.g. ram@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="regPass" className="form-label fw-semibold">Password</label>
                  <input
                    type="password"
                    id="regPass"
                    className="form-control form-control-custom"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="regPhone" className="form-label fw-semibold">Phone Number</label>
                  <input
                    type="text"
                    id="regPhone"
                    className="form-control form-control-custom"
                    placeholder="e.g. +91-9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <label htmlFor="regAddress" className="form-label fw-semibold">Mailing Address</label>
                  <input
                    type="text"
                    id="regAddress"
                    className="form-control form-control-custom"
                    placeholder="e.g. Connaught Place, New Delhi"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              {/* Doctor Specific Fields */}
              {role === 'Doctor' && (
                <div className="doctor-info-fields mt-4 p-4 rounded-3 border bg-light">
                  <h5 className="border-bottom pb-2 mb-3 text-teal"><i className="bi bi-file-medical-fill me-1"></i> Professional Profile Details</h5>
                  <p className="text-muted small mb-3">Notice: Doctor registrations are pending review and must be approved by the Admin before appearing in search listings.</p>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="docSpec" className="form-label fw-semibold">Medical Specialization</label>
                      <select
                        id="docSpec"
                        className="form-select form-control-custom bg-white"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        required
                      >
                        <option value="">Select Specialization</option>
                        {specializations.map((spec) => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="docExp" className="form-label fw-semibold">Experience (Years)</label>
                      <input
                        type="number"
                        id="docExp"
                        className="form-control form-control-custom bg-white"
                        placeholder="e.g. 8"
                        min="0"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="docFees" className="form-label fw-semibold">Consultation Fees (₹)</label>
                      <input
                        type="number"
                        id="docFees"
                        className="form-control form-control-custom bg-white"
                        placeholder="e.g. 500"
                        min="0"
                        value={fees}
                        onChange={(e) => setFees(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="docLoc" className="form-label fw-semibold">Clinic / Hospital Location</label>
                      <input
                        type="text"
                        id="docLoc"
                        className="form-control form-control-custom bg-white"
                        placeholder="e.g. Fortis Hospital, Sector 62, Noida"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label htmlFor="docAbout" className="form-label fw-semibold">About / Professional Bio</label>
                      <textarea
                        id="docAbout"
                        rows="3"
                        className="form-control form-control-custom bg-white"
                        placeholder="Describe your credentials, medical background, or clinical focus..."
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              <div className="d-grid mt-4">
                <button
                  type="submit"
                  className="btn btn-primary-custom py-3"
                  disabled={loading}
                  id="regSubmitBtn"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Registering Account...
                    </>
                  ) : `Register Account as ${role}`}
                </button>
              </div>
            </form>

            <div className="text-center mt-4 border-top pt-3">
              <p className="text-muted small mb-1">Already have an account?</p>
              <Link to="/login" className="fw-bold text-decoration-none text-teal" style={{ color: 'var(--primary)' }}>
                Login Here
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
