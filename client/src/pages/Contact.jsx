import React, { useState } from 'react';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      return;
    }
    setLoading(true);
    // Mock API delay
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 1000);
  };

  return (
    <div className="container py-5">
      <div className="row mb-5 text-center">
        <div className="col-lg-8 mx-auto">
          <h1 className="display-5 fw-bold mb-3">Contact Support Team</h1>
          <p className="lead text-muted">Have any questions about booking an appointment, doctor registration, or patient reports? Drop us a message.</p>
        </div>
      </div>

      <div className="row g-5">
        {/* Contact info cards */}
        <div className="col-lg-4">
          <div className="d-flex flex-column gap-4">
            <div className="premium-card p-4 d-flex align-items-start gap-3">
              <span className="fs-3">📍</span>
              <div>
                <h5 className="mb-1 text-dark">Our Headquarters</h5>
                <p className="text-muted small mb-0">100 Parliament Street, Connaught Place, New Delhi, 110001</p>
              </div>
            </div>

            <div className="premium-card p-4 d-flex align-items-start gap-3">
              <span className="fs-3">📞</span>
              <div>
                <h5 className="mb-1 text-dark">Phone Support</h5>
                <p className="text-muted small mb-0">General support: +91-9876543210<br />Emergency line: +91-9988776655</p>
              </div>
            </div>

            <div className="premium-card p-4 d-flex align-items-start gap-3">
              <span className="fs-3">✉️</span>
              <div>
                <h5 className="mb-1 text-dark">Email Support</h5>
                <p className="text-muted small mb-0">support@bookadoctor.in<br />approvals@bookadoctor.in</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="col-lg-8">
          <div className="premium-card p-5 shadow-sm">
            <h3 className="mb-4 text-dark"><i className="bi bi-envelope-fill text-teal me-2"></i> Send us a message</h3>

            {submitted && (
              <div className="alert alert-success d-flex align-items-center mb-4" role="alert">
                <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                <div>
                  <strong>Thank you for contacting us!</strong> Your message has been sent successfully. Our support desk will respond shortly.
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label htmlFor="contactName" className="form-label fw-semibold">Your Name</label>
                  <input
                    type="text"
                    id="contactName"
                    className="form-control form-control-custom"
                    placeholder="Ram"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="contactEmail" className="form-label fw-semibold">Email Address</label>
                  <input
                    type="email"
                    id="contactEmail"
                    className="form-control form-control-custom"
                    placeholder="ram@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="col-12">
                  <label htmlFor="contactSub" className="form-label fw-semibold">Subject</label>
                  <input
                    type="text"
                    id="contactSub"
                    className="form-control form-control-custom"
                    placeholder="How can we help you today?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                <div className="col-12">
                  <label htmlFor="contactMsg" className="form-label fw-semibold">Your Message</label>
                  <textarea
                    id="contactMsg"
                    rows="5"
                    className="form-control form-control-custom"
                    placeholder="Type details about your issue, feedback, or general request..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>

              <div className="d-grid">
                <button
                  type="submit"
                  className="btn btn-primary-custom py-3"
                  disabled={loading}
                  id="contactSubmitBtn"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Sending Message...
                    </>
                  ) : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
