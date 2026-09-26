'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './ContactPage.module.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TestDriveModal } from '@/components/common/TestDriveModal';

export default function ContactPage() {
  const [isTestDriveOpen, setIsTestDriveOpen] = useState(false);
  const [topic, setTopic] = useState('Schedule Private Studio Visit');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const topics = [
    'Schedule Private Studio Visit',
    'General Inquiry',
    'Vehicle Acquisition Assistance',
    'Sell / Trade-In Inquiry',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || name.trim().length < 2) {
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
        customerName: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        carId: null,
        acquisitionPreference: topic,
        message: preferredDate ? `[Preferred Date: ${preferredDate}] ${message.trim()}` : message.trim(),
        source: 'contact_page',
      };

      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit inquiry. Please try again.');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while submitting your request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar onOpenTestDrive={() => setIsTestDriveOpen(true)} />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Header */}
          <header className={styles.contactHeader}>
            <span className="eyebrow-badge">SHOWROOM CONCIERGE & ADVISORY</span>
            <h1 className={styles.headerTitle}>
              Connect with <em>Aureus Motors</em>
            </h1>
            <p className={styles.headerDesc}>
              Whether you are scheduling a private salon appointment, requesting a doorstep test drive, or
              inquiring about vehicle provenance, our relationship managers remain at your service.
            </p>
          </header>

          {/* 50/50 Split Architectural Layout */}
          <div className={styles.splitGrid}>
            {/* Left Column: Studio & Contact Details */}
            <div className={styles.infoColumn}>
              <div className={styles.showroomImageWrapper}>
                <Image
                  src="/images/contact_showroom.jpg"
                  alt="Aureus Motors flagship automotive sanctuary gallery exterior"
                  fill
                  className={styles.showroomImage}
                  priority
                />
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className={styles.infoText}>
                    <h4>Mumbai Flagship Sanctuary</h4>
                    <p>Aureus House, One BKC, G Block, Bandra Kurla Complex, Mumbai, Maharashtra 400051</p>
                    <p style={{ fontSize: '0.78rem', color: '#8C6D3F', marginTop: '2px' }}>
                      Complimentary VIP Valet Parking & Private Salon Entrance.
                    </p>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div className={styles.infoText}>
                    <h4>Viewing & Salon Hours</h4>
                    <p>Monday – Sunday: 10:00 AM – 8:00 PM</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      Private after-hours appointments available upon prior reservation.
                    </p>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div className={styles.infoText}>
                    <h4>Direct Telephone Lines</h4>
                    <p>
                      Main Line: <a href="tel:+919820028738">+91 98200 AUREUS (28738)</a>
                    </p>
                    <p>
                      Email: <a href="mailto:concierge@aureusmotors.in">concierge@aureusmotors.in</a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Regional Concierge Studios */}
              <div className={styles.regionalSection}>
                <span className={styles.regionalTitle}>Regional Experience Centers</span>
                <div className={styles.regionalList}>
                  <div className={styles.regionalItem}>
                    <strong>Bengaluru</strong>
                    <span>100 Feet Road, Indiranagar</span>
                  </div>
                  <div className={styles.regionalItem}>
                    <strong>Delhi NCR</strong>
                    <span>Worldmark 1, Aerocity</span>
                  </div>
                  <div className={styles.regionalItem}>
                    <strong>Hyderabad</strong>
                    <span>Road No. 36, Jubilee Hills</span>
                  </div>
                  <div className={styles.regionalItem}>
                    <strong>Pune (Coming Soon)</strong>
                    <span>Koregaon Park Annex</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Spacious Concierge Form */}
            <div className={styles.formColumn}>
              <div className={styles.formTitleArea}>
                <h2 className={styles.formTitle}>Send a Direct Inquiry</h2>
                <p className={styles.formSubtitle}>
                  Please choose your intent below. Our senior client advisor will respond within 15 minutes.
                </p>
              </div>

              {/* Topic Selector Tabs */}
              <div className={styles.topicGroup}>
                {topics.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopic(t)}
                    className={`${styles.topicBtn} ${topic === t ? styles.topicBtnActive : ''}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Error Message Banner */}
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

              {!isSubmitted ? (
                <form onSubmit={handleSubmit}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Vikramaditya Oberoi"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                        placeholder="vikram@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.input}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Preferred Appointment Date (Optional)</label>
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className={styles.input}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Message or Vehicle of Interest</label>
                    <textarea
                      rows={4}
                      placeholder="Specify vehicles you wish to inspect (e.g. Creta SX(O), XUV700 AX7L) or private salon viewing preferences..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className={styles.textarea}
                      style={{ resize: 'none' }}
                      disabled={isSubmitting}
                    />
                  </div>

                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={isSubmitting}
                    style={{ opacity: isSubmitting ? 0.7 : 1 }}
                  >
                    <span>{isSubmitting ? 'Transmitting Request...' : 'Submit Concierge Request'}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
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
                      margin: '0 auto 1.5rem',
                    }}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Inquiry Received
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', maxWidth: '420px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
                    Thank you, {name}. Your request for <strong>{topic}</strong> has been assigned to our
                    senior client relationship team. We will contact you at <strong>{phone}</strong> shortly.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    style={{
                      padding: '10px 24px',
                      background: '#1A1A1A',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Send Another Message
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom WhatsApp Immediate Assistance Strip */}
          <div className={styles.whatsappStrip}>
            <div className={styles.whatsappText}>
              <h3>Prefer Immediate WhatsApp Dialogue?</h3>
              <p>Chat in real-time with an Aureus concierge consultant for instant stock check & video tours.</p>
            </div>
            <a
              href="https://wa.me/919820028738"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappBtn}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 16.65c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.188 8.188 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.182 8.182 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23z" />
              </svg>
              <span>Open WhatsApp Chat</span>
            </a>
          </div>
        </div>
      </main>

      <Footer />

      <TestDriveModal
        isOpen={isTestDriveOpen}
        onClose={() => setIsTestDriveOpen(false)}
      />
    </div>
  );
}
