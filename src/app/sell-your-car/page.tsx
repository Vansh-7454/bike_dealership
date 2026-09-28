'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './SellYourCar.module.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TestDriveModal } from '@/components/common/TestDriveModal';

export default function SellYourCarPage() {
  const [isTestDriveOpen, setIsTestDriveOpen] = useState(false);

  // Quick estimator state
  const [quickBrand, setQuickBrand] = useState('Mahindra');
  const [quickYear, setQuickYear] = useState('2023');
  const [quickKm, setQuickKm] = useState('20000');

  // Multi-step form state
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2023');
  const [fuel, setFuel] = useState('Petrol');
  const [transmission, setTransmission] = useState('Automatic');
  const [km, setKm] = useState('');
  const [ownership, setOwnership] = useState('1st Owner');
  const [rtoCity, setRtoCity] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');
  const [message, setMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // FAQ open/close state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const calculateEstimate = () => {
    // Algorithmic valuation estimate based on year & brand
    let base = 16.5;
    if (quickBrand === 'Mahindra') base = 21.0;
    if (quickBrand === 'Hyundai') base = 16.8;
    if (quickBrand === 'Toyota') base = 19.2;
    if (quickBrand === 'Skoda') base = 17.5;
    if (quickBrand === 'Tata') base = 14.2;

    const yearFactor = (Number(quickYear) - 2020) * 1.5;
    const finalMin = (base + yearFactor - 1.2).toFixed(1);
    const finalMax = (base + yearFactor + 0.8).toFixed(1);
    return `₹${finalMin}L - ₹${finalMax}L`;
  };

  const handleFakeFileUpload = () => {
    setUploadedFiles(['exterior_front.jpg', 'interior_odometer.jpg', 'rc_document.pdf']);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side quick checks
    if (!sellerName.trim() || sellerName.trim().length < 2) {
      setErrorMessage('Please enter your full name (minimum 2 characters)');
      return;
    }

    const cleanPhone = sellerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile phone number');
      return;
    }

    if (!sellerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sellerEmail.trim())) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (!brand.trim()) {
      setErrorMessage('Please specify the manufacturer / brand');
      return;
    }

    if (!model.trim()) {
      setErrorMessage('Please specify the vehicle model and variant');
      return;
    }

    const numericKm = parseInt(km, 10);
    if (isNaN(numericKm) || numericKm < 0) {
      setErrorMessage('Please provide a valid odometer reading in kilometers');
      return;
    }

    if (!rtoCity.trim()) {
      setErrorMessage('Please enter the RTO registration state or city');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        ownerName: sellerName.trim(),
        phone: sellerPhone.trim(),
        email: sellerEmail.trim().toLowerCase(),
        carBrand: brand.trim(),
        carModel: model.trim(),
        carYear: parseInt(year, 10),
        kilometers: numericKm,
        fuelType: fuel,
        transmission,
        expectedPrice: expectedPrice.trim() ? parseFloat(expectedPrice.trim()) : null,
        location: rtoCity.trim(),
        message: message.trim() || undefined,
      };

      const res = await fetch('/api/sell-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to submit vehicle valuation request');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during submission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'How quickly does Aureus disburse funds for an acquired vehicle?',
      a: 'Following our certified 160-point doorstep technical inspection, a firm purchase agreement is generated. Upon digital signing, our corporate treasury executes an immediate RTGS bank transfer in under 60 minutes.',
    },
    {
      q: 'What if my vehicle is currently under an active bank loan or hypothecation?',
      a: 'Aureus handles complete loan foreclosure directly with your lending bank. We obtain the formal foreclosure statement, clear the outstanding principal directly, and credit the net equity balance into your personal bank account.',
    },
    {
      q: 'Who is legally responsible for RC (Registration Certificate) name transfer?',
      a: 'Aureus provides an unconditional, legally binding Indemnity Bond upon vehicle handover, assuming 100% legal responsibility. Our legal liaison team processes the RTO title transfer into the new buyer’s name within 30 to 45 business days.',
    },
    {
      q: 'Is the doorstep 160-point evaluation completely free of charge?',
      a: 'Yes. Our certified diagnostic evaluators travel to your residence or corporate office across Mumbai, Bengaluru, Delhi NCR, and Hyderabad at zero cost, regardless of whether you decide to accept our valuation offer.',
    },
  ];

  return (
    <div className={styles.pageWrapper}>
      <Navbar onOpenTestDrive={() => setIsTestDriveOpen(true)} />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Section 1: Conversion Split Hero */}
          <section className={styles.heroSection}>
            <div className={styles.heroGrid}>
              <div>
                <span className="eyebrow-badge" style={{ padding: '0.25rem 0.65rem' }}>
                  INSTITUTIONAL DIRECT ACQUISITIONS
                </span>
                <h1 className={styles.heroHeadline}>
                  Sell Your Car with <em>Absolute Certainty</em> & Instant Settlement.
                </h1>
                <p className={styles.heroSubtext}>
                  Skip endless classified tire-kickers, predatory dealer cuts, and lingering title liabilities.
                  Receive a transparent institutional valuation backed by algorithmic market precision.
                </p>

                {/* Instant Valuation Calculator Widget */}
                <div className={styles.instantWidget}>
                  <div className={styles.widgetHeader}>
                    <span className={styles.widgetTitle}>Instant Valuation Estimator</span>
                    <span className={styles.widgetBadge}>Real-Time Algorithmic Model</span>
                  </div>

                  <div className={styles.widgetRow}>
                    <div className={styles.widgetInputGroup}>
                      <label className={styles.widgetLabel}>Make / Manufacturer</label>
                      <select
                        value={quickBrand}
                        onChange={(e) => setQuickBrand(e.target.value)}
                        className={styles.widgetSelect}
                      >
                        <option value="Mahindra">Mahindra</option>
                        <option value="Hyundai">Hyundai</option>
                        <option value="Toyota">Toyota</option>
                        <option value="Tata">Tata</option>
                        <option value="Kia">Kia</option>
                        <option value="Skoda">Skoda</option>
                        <option value="Volkswagen">Volkswagen</option>
                        <option value="Honda">Honda</option>
                      </select>
                    </div>

                    <div className={styles.widgetInputGroup}>
                      <label className={styles.widgetLabel}>Registration Year</label>
                      <select
                        value={quickYear}
                        onChange={(e) => setQuickYear(e.target.value)}
                        className={styles.widgetSelect}
                      >
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                        <option value="2021">2021</option>
                        <option value="2020">2020</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.estimateOutput}>
                    <span className={styles.estimateLabel}>Estimated Aureus Direct Payout</span>
                    <span className={styles.estimateValue}>{calculateEstimate()}</span>
                  </div>
                </div>
              </div>

              {/* Side Visual Hero Card */}
              <div className={styles.heroMediaWrapper}>
                <Image
                  src="/images/sell_inspection.jpg"
                  alt="Aureus certified evaluation specialist inspecting a vehicle"
                  fill
                  className={styles.heroImage}
                  priority
                />
              </div>
            </div>
          </section>

          {/* Section 2: 4-Step Acquisition Process */}
          <section className={styles.processSection}>
            <div className={styles.sectionHeaderCenter}>
              <span className="eyebrow-badge">THE PROTOCOL</span>
              <h2 className={styles.sectionTitle}>The 4-Step Direct Selling Protocol</h2>
              <p className={styles.sectionSubtitle}>
                Designed for discerning patrons who value their time, privacy, and legal protection.
              </p>
            </div>

            <div className={styles.processGrid}>
              <div className={styles.processCard}>
                <span className={styles.stepNumber}>01</span>
                <h3 className={styles.stepTitle}>Digital Dossier Submission</h3>
                <p className={styles.stepDesc}>
                  Share vehicle specs, mileage, and registration details via our encrypted seller portal in under 2 minutes.
                </p>
              </div>

              <div className={styles.processCard}>
                <span className={styles.stepNumber}>02</span>
                <h3 className={styles.stepTitle}>Free Doorstep Evaluation</h3>
                <p className={styles.stepDesc}>
                  A certified Aureus engineer conducts a thorough 160-point structural and diagnostic assessment at your convenience.
                </p>
              </div>

              <div className={styles.processCard}>
                <span className={styles.stepNumber}>03</span>
                <h3 className={styles.stepTitle}>Binding Institutional Offer</h3>
                <p className={styles.stepDesc}>
                  Receive a firm purchase offer valid for 7 days with zero price chipping, haggling, or surprise deductions.
                </p>
              </div>

              <div className={styles.processCard}>
                <span className={styles.stepNumber}>04</span>
                <h3 className={styles.stepTitle}>RTGS Payout & Legal Transfer</h3>
                <p className={styles.stepDesc}>
                  Instant bank transfer credited before vehicle collection, backed by complete legal RC indemnity protection.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Prominent Valuation & Sell Submission Form */}
          <section className={styles.formSection}>
            <div className={styles.formCard}>
              <div className={styles.formHeader}>
                <div className={styles.formStepIndicator}>
                  <span className={`${styles.stepPill} ${styles.stepPillActive}`}>
                    <span>1. Vehicle Specs</span>
                  </span>
                  <span>&rarr;</span>
                  <span className={`${styles.stepPill} ${styles.stepPillActive}`}>
                    <span>2. Condition</span>
                  </span>
                  <span>&rarr;</span>
                  <span className={`${styles.stepPill} ${styles.stepPillActive}`}>
                    <span>3. Payout Details</span>
                  </span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Submit Your Vehicle for Guaranteed Direct Purchase
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  Complete the vehicle profile below to receive a certified valuation call within 30 minutes.
                </p>
              </div>

              {/* Error Message Banner */}
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                      <label className={styles.formLabel}>Manufacturer / Brand *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mahindra, Hyundai, Tata"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className={styles.formInput}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Model & Variant *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. XUV700 AX7 Luxury Diesel AT"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className={styles.formInput}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Year of Registration *</label>
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
                        <option value="2015">2015</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Odometer (Kilometers) *</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 18500"
                        value={km}
                        onChange={(e) => setKm(e.target.value)}
                        className={styles.formInput}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Fuel Type *</label>
                      <select
                        value={fuel}
                        onChange={(e) => setFuel(e.target.value)}
                        className={styles.formSelect}
                        disabled={isSubmitting}
                      >
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Hybrid">Strong Hybrid</option>
                        <option value="Electric">Electric (EV)</option>
                        <option value="CNG">CNG</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Transmission *</label>
                      <select
                        value={transmission}
                        onChange={(e) => setTransmission(e.target.value)}
                        className={styles.formSelect}
                        disabled={isSubmitting}
                      >
                        <option value="Automatic">Automatic (AT / DCT / CVT / e-CVT)</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Ownership Record *</label>
                      <select
                        value={ownership}
                        onChange={(e) => setOwnership(e.target.value)}
                        className={styles.formSelect}
                        disabled={isSubmitting}
                      >
                        <option value="1st Owner">1st Owner (Individual)</option>
                        <option value="1st Owner (Company)">1st Owner (Company Registered)</option>
                        <option value="2nd Owner">2nd Owner</option>
                        <option value="3rd Owner+">3rd Owner+</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>RTO Registration State / City *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. MH-02 (Mumbai West), KA-01 (Bengaluru), DL-03"
                        value={rtoCity}
                        onChange={(e) => setRtoCity(e.target.value)}
                        className={styles.formInput}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Expected Price & Additional Information */}
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Expected Price (₹ in Lakhs or INR, Optional)</label>
                      <input
                        type="number"
                        placeholder="e.g. 1850000"
                        value={expectedPrice}
                        onChange={(e) => setExpectedPrice(e.target.value)}
                        className={styles.formInput}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Vehicle Images / Documents (Optional)</label>
                      <div className={styles.dropzone} onClick={handleFakeFileUpload}>
                        <div className={styles.dropzoneIcon}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                        <span className={styles.dropzoneText}>
                          {uploadedFiles.length > 0
                            ? `${uploadedFiles.length} files attached (${uploadedFiles.join(', ')})`
                            : 'Click to attach photos or RC copy'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Your Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Aditya Singhania"
                        value={sellerName}
                        onChange={(e) => setSellerName(e.target.value)}
                        className={styles.formInput}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Phone Number for Valuation *</label>
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

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="aditya@domain.com"
                      value={sellerEmail}
                      onChange={(e) => setSellerEmail(e.target.value)}
                      className={styles.formInput}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Additional Notes or Inspection Preferences (Optional)</label>
                    <textarea
                      rows={3}
                      placeholder="Mention service records, insurance validity, modifications, or preferred doorstep inspection timing..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className={styles.formInput}
                      style={{ resize: 'none' }}
                      disabled={isSubmitting}
                    />
                  </div>

                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={isSubmitting}
                    style={{ opacity: isSubmitting ? 0.75 : 1 }}
                  >
                    <span>{isSubmitting ? 'Transmitting Request...' : 'Request Valuation & Doorstep Inspection'}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
                  <div
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '50%',
                      background: 'rgba(25, 135, 84, 0.12)',
                      color: '#198754',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.5rem',
                    }}
                  >
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.85rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                    Request Received
                  </h3>
                  <p style={{ color: '#c8a97e', fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem' }}>
                    Our team will review your details and contact you.
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', maxWidth: '480px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
                    Thank you, <strong>{sellerName}</strong>. Your valuation request for the <strong>{year} {brand} {model}</strong> has been logged in our institutional acquisition queue. Our senior acquisition lead will reach out to you at <strong>{sellerPhone}</strong> to schedule a complimentary doorstep inspection.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setBrand('');
                      setModel('');
                      setKm('');
                      setRtoCity('');
                      setExpectedPrice('');
                      setMessage('');
                    }}
                    style={{
                      padding: '12px 28px',
                      background: '#1A1A1A',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background 0.2s ease',
                    }}
                  >
                    Submit Another Vehicle
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Section 4: Comparison Table */}
          <section className={styles.comparisonSection}>
            <div className={styles.sectionHeaderCenter}>
              <span className="eyebrow-badge">UNCOMPROMISING STANDARDS</span>
              <h2 className={styles.sectionTitle}>Aureus Direct Purchase vs. Open Market</h2>
              <p className={styles.sectionSubtitle}>
                Why premium vehicle owners choose our institutional acquisition process over peer-to-peer portals.
              </p>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.comparisonTable}>
                <thead>
                  <tr>
                    <th>Attributes</th>
                    <th className={styles.colAureus}>Aureus Institutional Acquisition</th>
                    <th>Traditional Classifieds / Portals</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Settlement Speed</strong></td>
                    <td className={styles.colAureus}>Instant RTGS Bank Transfer (60 Minutes)</td>
                    <td>Weeks or months of negotiations and failed cheques</td>
                  </tr>
                  <tr>
                    <td><strong>Legal Title Liability</strong></td>
                    <td className={styles.colAureus}>100% Legal Indemnity Bond from Handover</td>
                    <td>High risk of unresolved fines, accidents under your name</td>
                  </tr>
                  <tr>
                    <td><strong>Inspection Comfort</strong></td>
                    <td className={styles.colAureus}>100% Free Doorstep Single Evaluation</td>
                    <td>Dozens of strangers visiting your private residence</td>
                  </tr>
                  <tr>
                    <td><strong>Price Reliability</strong></td>
                    <td className={styles.colAureus}>Binding Firm Offer Backed by Algorithmic Data</td>
                    <td>Relentless on-the-spot haggling and last-minute cancellations</td>
                  </tr>
                  <tr>
                    <td><strong>Loan Foreclosure Assistance</strong></td>
                    <td className={styles.colAureus}>Direct bank settlement and NOC retrieval</td>
                    <td>Seller must self-fund loan payoff upfront</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5: Seller FAQ Accordion */}
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
                    <span style={{ fontSize: '1.2rem', color: '#8C6D3F' }}>
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

      <TestDriveModal
        isOpen={isTestDriveOpen}
        onClose={() => setIsTestDriveOpen(false)}
      />
    </div>
  );
}
