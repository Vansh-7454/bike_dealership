'use client';

import React, { useState } from 'react';
import styles from './TestRideModal.module.css';
import { IBikeDocument } from '@/models/Bike';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bike?: any | null;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({ isOpen, onClose, bike }) => {
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
        bikeId: bike?._id || bike?.id || null,
        message: message.trim(),
        acquisitionPreference,
        source: 'bike_detail',
      };

      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to submit enquiry. Please try again.');
      }

      setIsSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while submitting your enquiry';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setCustomerName('');
    setPhone('');
    setEmail('');
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
              <span className="eyebrow-badge">BIKE ENQUIRY</span>
              <h2 className={styles.title}>I&apos;m Interested in this Motorcycle</h2>
              <p className={styles.subtitle}>
                Submit an inquiry and our motorcycle specialists will connect with you with complete bike history and inspection details.
              </p>
            </div>

            {/* Selected Bike Display (Read-Only) */}
            <div className={styles.formGroup} style={{ marginBottom: '1.25rem' }}>
              <label className={styles.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Selected Motorcycle *</span>
                <span style={{ fontSize: '0.75rem', color: '#C86D3B', fontWeight: 600 }}>Auto-Associated</span>
              </label>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.95rem' }}>
                    {bike?.title || 'Selected Motorcycle'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {bike ? `${bike.year || ''} · ${bike.brand || ''} ${bike.model || ''}`.trim() : 'Verified Showroom Inventory'}
                  </div>
                </div>
                {bike?.price && (
                  <span style={{ fontWeight: 700, color: '#C86D3B', fontSize: '0.92rem' }}>
                    {bike.price >= 100000
                      ? `₹${(bike.price / 100000).toFixed(2)} Lakh`
                      : `₹${bike.price.toLocaleString('en-IN')}`}
                  </span>
                )}
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
                    placeholder="e.g. Vikramaditya Sharma"
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

              <div className={styles.formGroup}>
                <label className={styles.label}>Message</label>
                <textarea
                  rows={3}
                  placeholder="Ask about inspection report, service history, RTO transfer, or doorstep inspection..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={styles.input}
                  style={{ resize: 'none' }}
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.actions}>
                <button type="button" onClick={handleResetAndClose} className={styles.cancelBtn} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} disabled={isSubmitting} id="enquiry-submit-btn">
                  {isSubmitting ? 'Transmitting...' : 'Submit Enquiry'}
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
            <h3 className={styles.successTitle}>Enquiry Received</h3>
            <p className={styles.successDesc}>
              Our team will review your enquiry and contact you shortly.
            </p>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0.75rem 0' }}>
              Enquiry logged for <strong>{bike?.title || 'Selected Motorcycle'}</strong>.
            </div>
            <button onClick={handleResetAndClose} className={styles.submitBtn} style={{ marginTop: '0.5rem' }}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnquiryModal;
