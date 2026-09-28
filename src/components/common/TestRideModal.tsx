'use client';

import React, { useState } from 'react';
import styles from './TestRideModal.module.css';
import { IBike } from '@/types';
import { HERO_SHOWCASE_BIKE } from '@/data/showcaseBike';

interface TestRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  bike?: IBike | null;
}

export const TestRideModal: React.FC<TestRideModalProps> = ({ isOpen, onClose, bike }) => {
  const activeBike = bike || HERO_SHOWCASE_BIKE;

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('Morning (10:00 AM - 1:00 PM)');
  const [drivingLicenseVerified, setDrivingLicenseVerified] = useState(true);
  const [location, setLocation] = useState('Torque Flagship Studio (Indiranagar, Bengaluru)');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  if (!isOpen) return null;

  // Set minimum date to today or tomorrow
  const today = new Date();
  const minDateString = today.toISOString().split('T')[0];

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
      setErrorMessage('Please select a preferred test-ride date');
      return;
    }

    try {
      setIsSubmitting(true);

      const resolvedBikeId =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (activeBike as any)?._id ||
        activeBike?.id ||
        (activeBike as any)?.slug ||
        'bike-showcase-hunter-350';

      const payload = {
        bikeId: resolvedBikeId,
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        preferredDate,
        preferredTime,
        drivingLicenseVerified,
        location,
        message: message.trim() || undefined,
      };

      const res = await fetch('/api/test-rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit test ride request');
      }

      setConfirmedBooking(data.booking);
      setIsSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during submission';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setConfirmedBooking(null);
    setCustomerName('');
    setPhone('');
    setEmail('');
    setPreferredDate('');
    setMessage('');
    onClose();
  };

  return (
    <div className={styles.backdrop} onClick={handleResetAndClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleResetAndClose} aria-label="Close modal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {!isSubmitted ? (
          <>
            <div className={styles.header}>
              <span className="eyebrow-badge">TEST RIDE</span>
              <h2 className={styles.title}>Book a Test Ride</h2>
              <p className={styles.subtitle}>
                Experience this motorcycle on urban tarmac and highway stretch with our ride concierge.
              </p>
            </div>

            {/* Selected Bike Display (Read-Only) */}
            <div className={styles.formGroup} style={{ marginBottom: '1.25rem' }}>
              <label className={styles.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Selected Motorcycle *</span>
                <span style={{ fontSize: '0.75rem', color: '#DFC39B', fontWeight: 600 }}>Auto-Associated</span>
              </label>
              <div className={styles.selectedVehicleBadge}>
                <div>
                  <div className={styles.vehicleName}>
                    {activeBike?.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: '2px' }}>
                    {activeBike?.year} · {activeBike?.engineCC}cc · {activeBike?.kilometers?.toLocaleString()} km
                  </div>
                </div>
                <span className={styles.vehicleStatus}>120-Point Inspected</span>
              </div>
            </div>

            {errorMessage && (
              <div
                style={{
                  background: 'rgba(220, 53, 69, 0.08)',
                  border: '1px solid rgba(220, 53, 69, 0.3)',
                  color: '#DC3545',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '1rem',
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
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={styles.input}
                    disabled={isSubmitting}
                  />
                </div>

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
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="rahul@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    disabled={isSubmitting}
                  />
                </div>

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
              </div>

              <div className={styles.formRow}>
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
                    <option value="Evening (4:00 PM - 7:30 PM)">Evening (4:00 PM - 7:30 PM)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Dealership Studio *</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={styles.select}
                    disabled={isSubmitting}
                  >
                    <option value="Torque Flagship Studio (Indiranagar, Bengaluru)">
                      Bengaluru Flagship Studio (Indiranagar)
                    </option>
                    <option value="Torque Moto Yard (Whitefield, Bengaluru)">
                      Bengaluru East Studio (Whitefield)
                    </option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Message (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Need helmet size L, prefer open highway route..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={styles.input}
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.actions}>
                <button type="button" onClick={handleResetAndClose} className={styles.cancelBtn} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} disabled={isSubmitting} id="test-ride-submit-btn">
                  {isSubmitting ? 'Requesting...' : 'Request Test Ride'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className={styles.successView}>
            <div className={styles.successIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className={styles.successTitle}>Test Ride Requested</h3>
            <p className={styles.successDesc}>
              Your request is pending confirmation from our team.
            </p>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0.75rem 0' }}>
              Motorcycle: <strong>{activeBike.title}</strong> for <strong>{preferredDate}</strong> ({preferredTime}).
            </div>
            {confirmedBooking?._id && (
              <div className={styles.bookingRefBadge}>
                Request Reference: #{confirmedBooking._id.slice(-6).toUpperCase()}
              </div>
            )}
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Our team will review studio slot availability and contact you at {phone} to confirm.
            </p>
            <button
              onClick={handleResetAndClose}
              className={styles.submitBtn}
              style={{ marginTop: '0.5rem' }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestRideModal;
