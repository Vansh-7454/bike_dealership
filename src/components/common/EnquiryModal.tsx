'use client';

import React, { useState } from 'react';
import styles from './TestDriveModal.module.css';
import { ICarDocument } from '@/models/Car';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  car?: any | null;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({ isOpen, onClose, car }) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [acquisitionPreference, setAcquisitionPreference] = useState('Outright Purchase');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side quick validations
    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMessage('Please enter your full name (minimum 2 characters)');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        carId: car?._id || car?.slug || (car?.id ? String(car.id) : null),
        message: message.trim(),
        acquisitionPreference,
        source: 'car_detail',
      };

      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit your inquiry. Please try again.');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while submitting your enquiry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setErrorMessage(null);
    onClose();
  };

  const formatPrice = (price: number) => {
    return `₹${(price / 100000).toFixed(2)} Lakh`;
  };

  const carTitle = car?.title || (car?.year && car?.brand && car?.model ? `${car.year} ${car.brand} ${car.model}` : 'Selected Vehicle');
  const carImage = car?.images && car.images.length > 0 ? car.images[0] : (car?.featuredImages?.hero || car?.gallery?.[0] || '/images/inventory/xuv700_hero.jpg');

  return (
    <div className={styles.backdrop} onClick={handleClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose} aria-label="Close modal">
          ✕
        </button>

        {!isSubmitted ? (
          <>
            <div className={styles.header}>
              <span className="eyebrow-badge">VEHICLE DOSSIER INQUIRY</span>
              <h2 className={styles.title}>I&apos;m Interested in</h2>
              <p className={styles.subtitle}>
                Connect directly with an Aureus vehicle curator to receive detailed service telemetry, title verification, or schedule a private viewing.
              </p>
            </div>

            {/* Selected Car Display Banner */}
            {car && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 14px',
                  background: '#FFFFFF',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '12px',
                  marginBottom: '1.5rem',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '74px',
                    height: '52px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#111',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={carImage}
                    alt={carTitle}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      lineHeight: 1.25,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {carTitle}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                    {car.price && (
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#8C6D3F' }}>
                        {formatPrice(car.price)}
                      </span>
                    )}
                    {car.kilometers && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        • {car.kilometers.toLocaleString()} km
                      </span>
                    )}
                    {car.fuelType && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        • {car.fuelType}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error Message Alert */}
            {errorMessage && (
              <div
                style={{
                  background: 'rgba(220, 53, 69, 0.08)',
                  border: '1px solid rgba(220, 53, 69, 0.3)',
                  color: '#DC3545',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sameer Kapoor"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={styles.input}
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98200 XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={styles.input}
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="sameer@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Acquisition Intent</label>
                <select
                  value={acquisitionPreference}
                  onChange={(e) => setAcquisitionPreference(e.target.value)}
                  className={styles.select}
                  disabled={isSubmitting}
                >
                  <option value="Outright Purchase">Outright Purchase</option>
                  <option value="Financing / Loan Assistance">Financing / Loan Assistance</option>
                  <option value="Exchange / Trade-in Old Car">Exchange / Trade-in Old Car</option>
                  <option value="Corporate / Company Lease">Corporate / Company Lease</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Message (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Inquire about service history, warranty options, or schedule a video walkaround..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={styles.input}
                  style={{ resize: 'none' }}
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  onClick={handleClose}
                  className={styles.cancelBtn}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isSubmitting}
                  style={{ opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Enquiry'
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Success / Confirmation State */
          <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(25, 135, 84, 0.12)',
                color: '#198754',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.6rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                marginBottom: '0.4rem',
              }}
            >
              Enquiry Received
            </h3>

            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.94rem',
                lineHeight: '1.6',
                maxWidth: '420px',
                margin: '0 auto 1.5rem',
              }}
            >
              Thanks, <strong>{customerName}</strong>. Our team will contact you shortly at <strong>{phone}</strong> regarding this vehicle.
            </p>

            {/* Selected Car Snapshot Card */}
            {car && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '12px',
                  maxWidth: '380px',
                  margin: '0 auto 1.75rem',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '42px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    background: '#111',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={carImage}
                    alt={carTitle}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {carTitle}
                  </div>
                  {car.price && (
                    <div style={{ fontSize: '0.78rem', color: '#8C6D3F', fontWeight: 600 }}>
                      {formatPrice(car.price)}
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleClose}
              style={{
                padding: '12px 28px',
                background: '#1A1A1A',
                color: '#FFFFFF',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
            >
              Continue Browsing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnquiryModal;
