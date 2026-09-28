'use client';

import React, { useState } from 'react';
import styles from './SellYourBike.module.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TestRideModal } from '@/components/common/TestRideModal';

export default function SellYourBikePage() {
  const [isTestRideOpen, setIsTestRideOpen] = useState(false);

  // Form state
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [variant, setVariant] = useState('');
  const [year, setYear] = useState('2023');
  const [km, setKm] = useState('');
  const [fuelType, setFuelType] = useState('Petrol');
  const [transmission, setTransmission] = useState('Manual');
  const [bikeType, setBikeType] = useState('Street / Naked');
  const [engineCC, setEngineCC] = useState('');
  const [rtoCity, setRtoCity] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!sellerName.trim() || sellerName.trim().length < 2) {
      setErrorMessage('Please enter your full name (minimum 2 characters)');
      return;
    }

    const cleanPhone = sellerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!sellerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sellerEmail.trim())) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (!rtoCity.trim()) {
      setErrorMessage('Please enter your location or city');
      return;
    }

    if (!brand.trim()) {
      setErrorMessage('Please specify motorcycle manufacturer / brand');
      return;
    }

    if (!model.trim()) {
      setErrorMessage('Please specify motorcycle model');
      return;
    }

    const numericKm = parseInt(km, 10);
    if (isNaN(numericKm) || numericKm < 0) {
      setErrorMessage('Please provide a valid odometer reading in kilometers');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        ownerName: sellerName.trim(),
        phone: sellerPhone.trim(),
        email: sellerEmail.trim().toLowerCase(),
        location: rtoCity.trim(),
        brand: brand.trim(),
        model: model.trim(),
        variant: variant.trim() || undefined,
        year: parseInt(year, 10),
        kilometers: numericKm,
        fuelType,
        transmission,
        bikeType,
        engineCC: engineCC.trim() ? parseInt(engineCC.trim(), 10) : undefined,
        expectedPrice: expectedPrice.trim() ? parseFloat(expectedPrice.trim()) : null,
        message: message.trim() || undefined,
      };

      const res = await fetch('/api/sell-bikes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to submit motorcycle valuation request');
      }

      setIsSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during submission';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'How quickly does Torque Two-Wheelers disburse funds for an acquired motorcycle?',
      a: 'Following our certified 120-point doorstep technical inspection, a firm purchase agreement is generated. Upon digital signing, our treasury executes an immediate RTGS bank transfer in under 45 minutes.',
    },
    {
      q: 'What if my motorcycle is currently under an active two-wheeler loan or hypothecation?',
      a: 'Torque handles complete loan foreclosure directly with your lending bank. We obtain the formal foreclosure statement, settle the outstanding principal directly, and credit the net equity balance into your personal bank account.',
    },
    {
      q: 'Who is legally responsible for RC (Registration Certificate) transfer?',
      a: 'Torque provides an unconditional, legally binding Indemnity Bond upon motorcycle handover, assuming 100% legal responsibility. Our legal liaison team processes the RTO title transfer within 30 to 45 business days.',
    },
    {
      q: 'Is the doorstep 120-point motorcycle evaluation completely free?',
      a: 'Yes. Our certified diagnostic evaluators travel to your residence across Mumbai, Bengaluru, Delhi NCR, and Pune at zero cost, regardless of whether you decide to accept our valuation offer.',
    },
  ];

  return (
    <div className={styles.pageWrapper}>
      <Navbar onOpenTestRide={() => setIsTestRideOpen(true)} />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Section 1: Hero */}
          <section className={styles.heroSection}>
            <div className={styles.heroGrid}>
              <div>
                <span className="eyebrow-badge" style={{ padding: '0.25rem 0.65rem' }}>
                  DIRECT TWO-WHEELER ACQUISITIONS
                </span>
                <h1 className={styles.heroHeadline}>
                  Sell Your Motorcycle with <em>Absolute Certainty</em> & Instant Settlement.
                </h1>
                <p className={styles.heroSubtext}>
                  Skip endless classified tire-kickers, test-ride joyriders, and lingering RC liabilities.
                  Receive a transparent cash valuation backed by live secondary market data.
                </p>

                {/* Dealership Valuation Guide */}
                <div className={styles.instantWidget}>
                  <div className={styles.widgetHeader}>
                    <span className={styles.widgetTitle}>Torque Fair Acquisition Process</span>
                    <span className={styles.widgetBadge}>Zero Obligation</span>
                  </div>

                  <div style={{ padding: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                      <span style={{ color: '#C86D3B', fontWeight: 700 }}>✓</span>
                      <span>Complimentary doorstep technical audit by certified evaluators</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                      <span style={{ color: '#C86D3B', fontWeight: 700 }}>✓</span>
                      <span>Real secondary market pricing with zero pressure or price chipping</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                      <span style={{ color: '#C86D3B', fontWeight: 700 }}>✓</span>
                      <span>Guaranteed RC transfer with full legal indemnity bond</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Visual Hero Card */}
              <div className={styles.heroMediaWrapper}>
                <img
                  src="/images/bikes/hunter_350_hero.jpg"
                  alt="Torque certified evaluation specialist inspecting a motorcycle"
                  className={styles.heroImage}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          </section>

          {/* Section 2: 4-Step Process */}
          <section className={styles.processSection}>
            <div className={styles.sectionHeaderCenter}>
              <span className="eyebrow-badge">THE PROTOCOL</span>
              <h2 className={styles.sectionTitle}>The 4-Step Direct Selling Protocol</h2>
              <p className={styles.sectionSubtitle}>
                Designed for discerning motorcycle owners who value their time, privacy, and legal protection.
              </p>
            </div>

            <div className={styles.processGrid}>
              <div className={styles.processCard}>
                <span className={styles.stepNumber}>01</span>
                <h3 className={styles.stepTitle}>Digital Dossier Submission</h3>
                <p className={styles.stepDesc}>
                  Share bike specs, mileage, and registration details via our encrypted seller form in under 2 minutes.
                </p>
              </div>

              <div className={styles.processCard}>
                <span className={styles.stepNumber}>02</span>
                <h3 className={styles.stepTitle}>Free Doorstep Evaluation</h3>
                <p className={styles.stepDesc}>
                  A certified Torque evaluator conducts a thorough 120-point mechanical, frame, and electrical audit at your doorstep.
                </p>
              </div>

              <div className={styles.processCard}>
                <span className={styles.stepNumber}>03</span>
                <h3 className={styles.stepTitle}>Binding Cash Offer</h3>
                <p className={styles.stepDesc}>
                  Receive a firm purchase offer valid for 7 days with zero price chipping, haggling, or surprise deductions.
                </p>
              </div>

              <div className={styles.processCard}>
                <span className={styles.stepNumber}>04</span>
                <h3 className={styles.stepTitle}>RTGS Payout & Legal Transfer</h3>
                <p className={styles.stepDesc}>
                  Instant bank transfer credited before vehicle handover, backed by full legal RC transfer indemnity protection.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Submission Form */}
          <section className={styles.formSection}>
            <div className={styles.formCard}>
              <div className={styles.formHeader}>
                <h2 style={{ fontFamily: 'var(--font-family-display)', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
                  Submit Your Motorcycle for Guaranteed Purchase
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  Complete the profile below to receive a certified valuation call within 20 minutes.
                </p>
              </div>

              {errorMessage && (
                <div
                  style={{
                    background: 'rgba(220, 53, 69, 0.08)',
                    border: '1px solid rgba(220, 53, 69, 0.3)',
                    color: '#DC3545',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '0.88rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  {errorMessage}
                </div>
              )}

              {!isSubmitted ? (
                <form onSubmit={handleSubmit}>
                  {/* SECTION 1: OWNER DETAILS */}
                  <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#C86D3B', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '0.5rem' }}>
                      Owner Details
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Kunal Deshmukh"
                          value={sellerName}
                          onChange={(e) => setSellerName(e.target.value)}
                          className={styles.formInput}
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Phone Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98200 XXXXX"
                          value={sellerPhone}
                          onChange={(e) => setSellerPhone(e.target.value)}
                          className={styles.formInput}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="kunal@domain.com"
                          value={sellerEmail}
                          onChange={(e) => setSellerEmail(e.target.value)}
                          className={styles.formInput}
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Location / City *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Indiranagar, Bengaluru or Mumbai"
                          value={rtoCity}
                          onChange={(e) => setRtoCity(e.target.value)}
                          className={styles.formInput}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: BIKE DETAILS */}
                  <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#C86D3B', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '0.5rem' }}>
                      Bike Details
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Brand *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Royal Enfield, KTM, Yamaha, Honda"
                          value={brand}
                          onChange={(e) => setBrand(e.target.value)}
                          className={styles.formInput}
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Model *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Hunter 350 / Classic 350 / KTM 390 Duke"
                          value={model}
                          onChange={(e) => setModel(e.target.value)}
                          className={styles.formInput}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Variant</label>
                        <input
                          type="text"
                          placeholder="e.g. Dapper Ash, Dark Stealth, Dual Channel"
                          value={variant}
                          onChange={(e) => setVariant(e.target.value)}
                          className={styles.formInput}
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Year *</label>
                        <select
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className={styles.formSelect}
                          disabled={isSubmitting}
                        >
                          <option value="2025">2025</option>
                          <option value="2024">2024</option>
                          <option value="2023">2023</option>
                          <option value="2022">2022</option>
                          <option value="2021">2021</option>
                          <option value="2020">2020</option>
                          <option value="2019">2019</option>
                          <option value="2018">2018</option>
                          <option value="2017">2017</option>
                          <option value="2016">2016</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Kilometers *</label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 7200"
                          value={km}
                          onChange={(e) => setKm(e.target.value)}
                          className={styles.formInput}
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Fuel Type *</label>
                        <select
                          value={fuelType}
                          onChange={(e) => setFuelType(e.target.value)}
                          className={styles.formSelect}
                          disabled={isSubmitting}
                        >
                          <option value="Petrol">Petrol</option>
                          <option value="Electric">Electric</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Transmission *</label>
                        <select
                          value={transmission}
                          onChange={(e) => setTransmission(e.target.value)}
                          className={styles.formSelect}
                          disabled={isSubmitting}
                        >
                          <option value="Manual">Manual</option>
                          <option value="Automatic">Automatic / CVT</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Engine CC</label>
                        <input
                          type="number"
                          placeholder="e.g. 349"
                          value={engineCC}
                          onChange={(e) => setEngineCC(e.target.value)}
                          className={styles.formInput}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Expected Price (Optional)</label>
                      <input
                        type="number"
                        placeholder="e.g. 145000"
                        value={expectedPrice}
                        onChange={(e) => setExpectedPrice(e.target.value)}
                        className={styles.formInput}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* SECTION 3: ADDITIONAL INFORMATION */}
                  <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#C86D3B', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '0.5rem' }}>
                      Additional Information
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Message / Condition details</label>
                      <textarea
                        rows={3}
                        placeholder="Describe bike condition, service history, installed accessories, or tyres..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className={styles.formInput}
                        style={{ resize: 'none' }}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={isSubmitting}
                    id="sell-bike-submit-btn"
                    style={{ opacity: isSubmitting ? 0.75 : 1 }}
                  >
                    <span>{isSubmitting ? 'Transmitting Request...' : 'Submit Bike Details'}</span>
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
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
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-family-display)', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.6rem' }}>
                    Request Received
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
                    Our team will review your bike details and contact you.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setBrand('');
                      setModel('');
                      setVariant('');
                      setKm('');
                      setRtoCity('');
                      setExpectedPrice('');
                      setMessage('');
                    }}
                    style={{
                      padding: '12px 28px',
                      background: 'var(--color-text-primary)',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Submit Another Motorcycle
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Section 4: FAQs */}
          <section className={styles.faqSection}>
            <div className={styles.sectionHeaderCenter}>
              <span className="eyebrow-badge">CLARITY & ASSURANCE</span>
              <h2 className={styles.sectionTitle}>Frequently Addressed Seller Inquiries</h2>
            </div>

            <div className={styles.faqList}>
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className={styles.faqItem}
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <div className={styles.faqQuestion}>
                    <span>{faq.q}</span>
                    <span style={{ fontSize: '1.2rem', color: 'var(--color-accent-copper)' }}>
                      {openFaq === idx ? '−' : '+'}
                    </span>
                  </div>
                  {openFaq === idx && <p className={styles.faqAnswer}>{faq.a}</p>}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />

      <TestRideModal
        isOpen={isTestRideOpen}
        onClose={() => setIsTestRideOpen(false)}
      />
    </div>
  );
}
