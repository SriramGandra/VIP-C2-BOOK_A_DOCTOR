import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const { login, user, error: authError, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Forgot Password States
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');

  useEffect(() => {
    // Clear global context error on load
    setError(null);
  }, []);

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      if (user.role === 'Admin') navigate('/admin');
      else if (user.role === 'Doctor') navigate('/doctor');
      else navigate('/patient');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setFormError('');
    setError(null);

    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setFormError(result.error);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError('Please enter your email address');
      return;
    }
    setForgotError('');
    setForgotMessage('');
    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      if (res.data.success) {
        setResetToken(res.data.resetToken);
        setForgotMessage(`Token generated successfully! In a live app, this is sent to your email. Copy the token below to reset your password.`);
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Email not found');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters long');
      return;
    }
    setForgotError('');
    setForgotMessage('');
    try {
      const res = await api.put(`/auth/reset-password/${resetToken}`, { password: newPassword });
      if (res.data.success) {
        setForgotMessage('Password reset successfully! You can now login with your new password.');
        setResetToken('');
        setForgotEmail('');
        setNewPassword('');
        // Toggle off forgot window in 3 seconds
        setTimeout(() => setShowForgot(false), 3000);
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Reset password failed');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="premium-card p-5 shadow-lg">

            {!showForgot ? (
              <>
                <div className="text-center mb-4">
                  <span className="fs-1">🔑</span>
                  <h2 className="mt-3 mb-1">Welcome Back</h2>
                  <p className="text-muted">Login to manage appointments and care</p>
                </div>

                {(formError || authError) && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {formError || authError}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="loginEmail" className="form-label fw-semibold">Email Address</label>
                    <input
                      type="email"
                      id="loginEmail"
                      className="form-control form-control-custom"
                      placeholder="e.g. ram@patient.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <div className="d-flex justify-content-between">
                      <label htmlFor="loginPass" className="form-label fw-semibold">Password</label>
                      <button
                        type="button"
                        className="btn btn-link p-0 text-decoration-none small text-teal"
                        onClick={() => {
                          setShowForgot(true);
                          setForgotError('');
                          setForgotMessage('');
                        }}
                        style={{ color: 'var(--primary)', fontSize: '14px' }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <input
                      type="password"
                      id="loginPass"
                      className="form-control form-control-custom"
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="d-grid mb-3">
                    <button
                      type="submit"
                      className="btn btn-primary-custom py-3"
                      disabled={loading}
                      id="loginSubmitBtn"
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Logging In...
                        </>
                      ) : 'Login Account'}
                    </button>
                  </div>
                </form>

                <div className="text-center mt-4 border-top pt-3">
                  <p className="text-muted small mb-1">Don't have an account yet?</p>
                  <Link to="/register" className="fw-bold text-decoration-none text-teal" style={{ color: 'var(--primary)' }}>
                    Create Patient or Doctor Account
                  </Link>
                </div>

                {/* Developer Seeding Accounts Box */}
                <div className="mt-4 p-3 bg-light rounded text-start border small">
                  <div className="fw-bold mb-1"><i className="bi bi-info-circle-fill text-teal"></i> Test Accounts (Seeded):</div>
                  <ul className="mb-0 ps-3">
                    <li><strong>Patient:</strong> aarav@patient.in / patientpassword</li>
                    <li><strong>Doctor:</strong> sunita@doctor.in / doctorpassword</li>
                    <li><strong>Admin:</strong> admin@doctor.in / adminpassword</li>
                  </ul>
                </div>
              </>
            ) : (
              // Forgot Password Panel
              <>
                <div className="text-center mb-4">
                  <span className="fs-1">🔒</span>
                  <h2 className="mt-3 mb-1">Reset Password</h2>
                  <p className="text-muted">Retrieve token and change password</p>
                </div>

                {forgotError && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i> {forgotError}
                  </div>
                )}

                {forgotMessage && (
                  <div className="alert alert-success" role="alert">
                    <i className="bi bi-info-circle-fill me-2"></i> {forgotMessage}
                  </div>
                )}

                {!resetToken ? (
                  // Request Token form
                  <form onSubmit={handleForgotPassword}>
                    <div className="mb-3">
                      <label htmlFor="forgotEmail" className="form-label fw-semibold">Email Address</label>
                      <input
                        type="email"
                        id="forgotEmail"
                        className="form-control form-control-custom"
                        placeholder="Enter your registered email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="d-grid gap-2">
                      <button type="submit" className="btn btn-primary-custom py-2" id="forgotTokenBtn">
                        Generate Reset Token
                      </button>
                      <button type="button" className="btn btn-outline-secondary py-2" onClick={() => setShowForgot(false)}>
                        Back to Login
                      </button>
                    </div>
                  </form>
                ) : (
                  // Reset Password form using token
                  <form onSubmit={handleResetPassword}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Generated Token</label>
                      <input
                        type="text"
                        className="form-control form-control-custom bg-light"
                        value={resetToken}
                        readOnly
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="newPass" className="form-label fw-semibold">New Password</label>
                      <input
                        type="password"
                        id="newPass"
                        className="form-control form-control-custom"
                        placeholder="Min 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="d-grid gap-2">
                      <button type="submit" className="btn btn-success py-2" id="resetPassSubmitBtn">
                        Save New Password
                      </button>
                      <button type="button" className="btn btn-outline-secondary py-2" onClick={() => setResetToken('')}>
                        Back
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
