'use client';

import React, { useState } from 'react';
import styles from './TestDriveModal.module.css';

interface TestDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  car?: any;
}

export const TestDriveModal: React.FC<TestDriveModalProps> = ({ isOpen, onClose, car }) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('Morning (10:00 AM - 1:00 PM)');
  const [location, setLocation] = useState('Mumbai Flagship Studio (One BKC)');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  if (!isOpen) return null;

  // Set minimum date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateString = tomorrow.toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
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

    if (!preferredDate) {
      setErrorMessage('Please select a preferred test-drive date');
      return;
    }

    if (preferredDate < new Date().toISOString().split('T')[0]) {
      setErrorMessage('Test drive date cannot be in the past');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        carId: car?._id || car?.slug || (car?.id ? String(car.id) : 'default_showcase'),
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        preferredDate,
        preferredTime,
        location,
        message: message.trim(),
      };

      const res = await fetch('/api/test-drives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit test-drive request. Please try again.');
      }

      setConfirmedBooking(result.data);
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while booking your test drive');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setErrorMessage(null);
    setConfirmedBooking(null);
    onClose();
  };

  const carTitle =
    car?.title ||
    (car?.year && car?.brand && car?.model ? `${car.year} ${car.brand} ${car.model}` : '2023 Mahindra XUV700 AX7 Luxury');
  const carImage =
    car?.images && car.images.length > 0
      ? car.images[0]
      : car?.featuredImages?.hero || car?.gallery?.[0] || '/images/inventory/xuv700_hero.jpg';

  const formatPrice = (price: number) => {
    return `₹${(price / 100000).toFixed(2)} Lakh`;
  };

  const formatDisplayDate = (dString: string) => {
    try {
      const d = new Date(dString);
      return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dString;
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose} aria-label="Close modal">
          ✕
        </button>

        {!isSubmitted ? (
          <>
            <div className={styles.header}>
              <span className="eyebrow-badge">VIP CONCIERGE SCHEDULER</span>
              <h2 className={styles.title}>Book a Test Drive</h2>
              <p className={styles.subtitle}>
                Experience the vehicle firsthand at our flagship studio or request an executive doorstep appointment.
              </p>
            </div>

            {/* Selected Car Automatic Display */}
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
                <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8C6D3F', fontWeight: 700 }}>
                  Selected Vehicle
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.98rem',
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
                {car?.price && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {formatPrice(car.price)} · 160-Point Certified
                  </div>
                )}
              </div>
            </div>

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
                <label className={styles.label}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Singhania"
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
                    placeholder="vikram@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Preferred Date *</label>
                  <input
                    type="date"
                    required
                    min={minDateString}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className={styles.input}
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Preferred Time Slot *</label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className={styles.select}
                    disabled={isSubmitting}
                  >
                    <option value="Morning (10:00 AM - 1:00 PM)">Morning (10:00 AM - 1:00 PM)</option>
                    <option value="Afternoon (1:00 PM - 4:00 PM)">Afternoon (1:00 PM - 4:00 PM)</option>
                    <option value="Evening (4:00 PM - 7:00 PM)">Evening (4:00 PM - 7:00 PM)</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Experience Location</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={styles.select}
                  disabled={isSubmitting}
                >
                  <option value="Mumbai Flagship Studio (One BKC)">Mumbai Flagship Studio (One BKC)</option>
                  <option value="Bengaluru Studio (Indiranagar)">Bengaluru Studio (Indiranagar)</option>
                  <option value="Delhi NCR Studio (Aerocity)">Delhi NCR Studio (Aerocity)</option>
                  <option value="Hyderabad Studio (Jubilee Hills)">Hyderabad Studio (Jubilee Hills)</option>
                  <option value="Executive Doorstep Delivery (Residence/Office)">Executive Doorstep Delivery (Residence/Office)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Specific Notes or Route Preferences (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Expressway drive preference, family seating, or chauffeur arrival instructions..."
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
                      Reserving Slot...
                    </span>
                  ) : (
                    'Request Test Drive'
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

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                background: 'rgba(255, 193, 7, 0.15)',
                color: '#856404',
                padding: '4px 12px',
                borderRadius: '20px',
                marginBottom: '0.75rem',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFC107' }}></span>
              Status: Pending Concierge Confirmation
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
              Test Drive Requested
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
              Our team will confirm your test drive shortly. A senior relationship manager will call <strong>{phone}</strong> to coordinate vehicle preparation.
            </p>

            {/* Booking Details Card */}
            <div
              style={{
                background: 'var(--color-bg-base)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: '12px',
                padding: '1.25rem',
                maxWidth: '420px',
                margin: '0 auto 1.75rem',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <div
                  style={{
                    width: '54px',
                    height: '38px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    background: '#111',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={confirmedBooking?.carSnapshot?.primaryImage || carImage}
                    alt={carTitle}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>
                    {confirmedBooking?.carSnapshot?.title || carTitle}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#8C6D3F' }}>
                    {location}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Requested Date</span>
                  <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--color-text-primary)' }}>
                    {formatDisplayDate(preferredDate)}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Time Slot</span>
                  <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--color-text-primary)' }}>
                    {preferredTime.split('(')[0].trim()}
                  </div>
                </div>
              </div>
            </div>

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

export default TestDriveModal;
