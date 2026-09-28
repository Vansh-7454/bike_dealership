'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './BikeDetailPage.module.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TestRideModal } from '@/components/common/TestRideModal';
import { EnquiryModal } from '@/components/common/EnquiryModal';
import { IBikeDocument } from '@/models/Bike';

interface BikeDetailClientProps {
  bike: IBikeDocument;
}

export const BikeDetailClient: React.FC<BikeDetailClientProps> = ({ bike }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isTestRideOpen, setIsTestRideOpen] = useState(false);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  const images =
    bike.images && bike.images.length > 0 ? bike.images : ['/images/bikes/hunter_350_hero.jpg'];

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const formatPrice = (price: number) => {
    const lakhs = (price / 100000).toFixed(2);
    return `₹${lakhs} Lakh`;
  };

  const calculateEmi = (price: number) => {
    // 36-month loan at 10.5% with 20% down
    const principal = price * 0.8;
    const ratePerMonth = 0.105 / 12;
    const months = 36;
    const emi = Math.round(
      (principal * ratePerMonth * Math.pow(1 + ratePerMonth, months)) /
        (Math.pow(1 + ratePerMonth, months) - 1)
    );
    return `₹${emi.toLocaleString()}/month`;
  };

  // 120-Point Motorcycle Inspection Checklist
  const inspectionPoints = [
    { title: 'Chassis, Apron & Fork Alignment', status: 'Zero Accidental' },
    { title: 'Engine Compression & Valve Clearance', status: 'Passed (Stock)' },
    { title: 'Chain Tension & Sprocket Tooth Profile', status: '85%+ Life Remaining' },
    { title: 'Disc Rotors & ABS Hydraulic Modulator', status: '100% Operational' },
    { title: 'Electronic Fuel Injection & ECU Telemetry', status: '0 Active Codes' },
    { title: 'Battery Health & Stator Charging Output', status: 'Certified Healthy' },
    { title: 'Front & Rear Tyres Tread Depth', status: '80%+ Tread Life' },
    { title: 'Service Provenance & Single Owner RC', status: 'Verified & Clear Title' },
  ];

  return (
    <div className={styles.pageWrapper}>
      <Navbar onOpenTestRide={() => setIsTestRideOpen(true)} />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Top Breadcrumbs & Back Link */}
          <div className={styles.topBar}>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
              <Link href="/" className={styles.breadcrumbLink}>
                Home
              </Link>
              <span className={styles.breadcrumbSep}>/</span>
              <Link href="/bikes" className={styles.breadcrumbLink}>
                Motorcycle Inventory
              </Link>
              <span className={styles.breadcrumbSep}>/</span>
              <span className={styles.breadcrumbCurrent}>{bike.title}</span>
            </nav>

            <Link href="/bikes" className={styles.backBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to Inventory
            </Link>
          </div>

          {/* Main Showcase Grid */}
          <div className={styles.showcaseGrid}>
            {/* Left Column: Gallery & Dossier */}
            <div className={styles.galleryColumn}>
              {/* Media Gallery Card */}
              <div className={styles.galleryCard}>
                <div className={styles.mainImageContainer}>
                  <img
                    src={images[activeImageIndex]}
                    alt={`${bike.title} - angle ${activeImageIndex + 1}`}
                    className={styles.mainImage}
                  />

                  {/* Badges Overlay */}
                  <div className={styles.badgeOverlay}>
                    <span className="eyebrow-badge" style={{ padding: '0.25rem 0.65rem' }}>
                      {bike.inspectionScore || 120}/120 Audit Passed
                    </span>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        padding: '5px 14px',
                        borderRadius: '20px',
                        background:
                          bike.status === 'Available'
                            ? 'rgba(25, 135, 84, 0.95)'
                            : bike.status === 'Sold'
                            ? '#DC3545'
                            : 'rgba(255, 193, 7, 0.95)',
                        color: '#FFF',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      }}
                    >
                      {bike.status === 'Sold' ? 'SOLD' : bike.status}
                    </span>
                  </div>

                  {/* Previous / Next Controls */}
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevImage}
                        className={`${styles.galleryNavBtn} ${styles.navPrev}`}
                        aria-label="Previous photo"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={handleNextImage}
                        className={`${styles.galleryNavBtn} ${styles.navNext}`}
                        aria-label="Next photo"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </>
                  )}

                  <div className={styles.imageCounter}>
                    {activeImageIndex + 1} / {images.length}
                  </div>
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className={styles.thumbnailStrip}>
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`${styles.thumbBtn} ${activeImageIndex === idx ? styles.thumbBtnActive : ''}`}
                        aria-label={`View photo ${idx + 1}`}
                      >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} className={styles.thumbImage} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Curator Description */}
              <section className={styles.detailSection}>
                <h2 className={styles.sectionTitle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-copper)" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  Curator&apos;s Motorcycle Dossier
                </h2>
                <p className={styles.descriptionText}>{bike.description}</p>
              </section>

              {/* 120-Point Mechanical Audit Report */}
              <section className={styles.detailSection}>
                <h2 className={styles.sectionTitle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-copper)" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  120-Point Mechanical & Frame Audit
                </h2>
                <div className={styles.auditGrid}>
                  {inspectionPoints.map((item, i) => (
                    <div key={i} className={styles.auditItem}>
                      <span className={styles.auditLabel}>{item.title}</span>
                      <span className={styles.auditStatus}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Factory Features */}
              {bike.features && bike.features.length > 0 && (
                <section className={styles.detailSection}>
                  <h2 className={styles.sectionTitle}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-copper)" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Factory Features & Equipment
                  </h2>
                  <div className={styles.featuresGrid}>
                    {bike.features.map((feature, idx) => (
                      <div key={idx} className={styles.featurePill}>
                        <svg className={styles.featureIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column: Sticky Summary & Actions */}
            <aside className={styles.sidebarColumn}>
              <div className={styles.summaryCard}>
                <div className={styles.titleArea}>
                  <span className={styles.brandYear}>
                    {bike.year} · {bike.brand} · {bike.ownership}
                  </span>
                  <h1 className={styles.carHeadline}>{bike.title}</h1>
                  <span className={styles.variantTag}>
                    {bike.variant} · {bike.color}
                  </span>
                </div>

                {/* Price Display */}
                <div className={styles.priceSection}>
                  <span className={styles.priceLabel}>Torque Verified Acquisition Price</span>
                  <div className={styles.priceRow}>
                    <span className={styles.mainPrice}>{formatPrice(bike.price)}</span>
                    <span className={styles.calculatedEmi}>Est. {calculateEmi(bike.price)}</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Inclusive of 120-point audit, 6-month warranty & RC transfer concierge.
                  </div>
                </div>

                {/* Sold Notice if bike is sold */}
                {bike.status === 'Sold' && (
                  <div
                    style={{
                      background: 'rgba(220, 53, 69, 0.12)',
                      border: '1px solid rgba(220, 53, 69, 0.4)',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      color: '#f87171',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '1rem',
                    }}
                  >
                    <span
                      style={{
                        background: '#DC3545',
                        color: '#fff',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        letterSpacing: '0.5px',
                      }}
                    >
                      SOLD
                    </span>
                    <span>This motorcycle has been acquired. Test ride booking is closed.</span>
                  </div>
                )}

                {/* Primary Specs Table */}
                <div className={styles.specsTable}>
                  <div className={styles.specBox}>
                    <span className={styles.specBoxLabel}>Displacement</span>
                    <span className={styles.specBoxValue}>{bike.engineCC} cc</span>
                  </div>

                  <div className={styles.specBox}>
                    <span className={styles.specBoxLabel}>Efficiency</span>
                    <span className={styles.specBoxValue}>{bike.mileage} kmpl</span>
                  </div>

                  <div className={styles.specBox}>
                    <span className={styles.specBoxLabel}>Odometer</span>
                    <span className={styles.specBoxValue}>{bike.kilometers.toLocaleString()} km</span>
                  </div>

                  <div className={styles.specBox}>
                    <span className={styles.specBoxLabel}>Transmission</span>
                    <span className={styles.specBoxValue}>{bike.transmission}</span>
                  </div>

                  <div className={styles.specBox}>
                    <span className={styles.specBoxLabel}>Ownership</span>
                    <span className={styles.specBoxValue}>{bike.ownership}</span>
                  </div>

                  <div className={styles.specBox}>
                    <span className={styles.specBoxLabel}>Category</span>
                    <span className={styles.specBoxValue}>{bike.bikeType}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.ctaArea}>
                  {bike.status === 'Sold' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                      <div
                        style={{
                          background: 'rgba(220, 53, 69, 0.12)',
                          border: '1px solid rgba(220, 53, 69, 0.35)',
                          borderRadius: '8px',
                          padding: '12px 14px',
                          color: '#f87171',
                          textAlign: 'center',
                          fontWeight: 600,
                          fontSize: '0.88rem',
                        }}
                      >
                        Motorcycle Sold & Delivered to Patron
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEnquiryOpen(true)}
                        className={styles.primaryCta}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        Inquire for Similar Machine
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsTestRideOpen(true)}
                        className={styles.primaryCta}
                        id="bike-detail-book-test-ride-btn"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10" />
                          <polygon points="10 8 16 12 10 16 10 8" />
                        </svg>
                        Book a Test Ride
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsEnquiryOpen(true)}
                        className={styles.secondaryCta}
                        id="bike-detail-enquire-btn"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        I&apos;m Interested
                      </button>
                    </>
                  )}
                </div>

                {/* WhatsApp Direct Line */}
                <div className={styles.conciergeStrip}>
                  <div className={styles.conciergeText}>
                    <strong>Need Immediate Details?</strong>
                    Speak with our motorcycle concierge specialist
                  </div>
                  <a
                    href="https://wa.me/919820086778"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.conciergePhone}
                  >
                    WhatsApp &rarr;
                  </a>
                </div>
              </div>

              {/* Torque Guarantees */}
              <div className={styles.assuranceCard}>
                <span className={styles.assuranceTitle}>Torque Ownership Guarantee</span>

                <div className={styles.assuranceItem}>
                  <div className={styles.assuranceItemIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </div>
                  <div className={styles.assuranceItemText}>
                    <h4>6-Month Powertrain Warranty</h4>
                    <p>Covers engine block, cylinder head, gearbox, fuel pump, and electrical alternator.</p>
                  </div>
                </div>

                <div className={styles.assuranceItem}>
                  <div className={styles.assuranceItemIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                  </div>
                  <div className={styles.assuranceItemText}>
                    <h4>7-Day No-Questions Exchange</h4>
                    <p>If the motorcycle fails to meet your highest standards, exchange it within 7 days.</p>
                  </div>
                </div>

                <div className={styles.assuranceItem}>
                  <div className={styles.assuranceItemIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div className={styles.assuranceItemText}>
                    <h4>Clean Legal Title & Indemnity</h4>
                    <p>Guaranteed clean legal title with zero hypothecation, accidental, or meter tampering liability.</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />

      <TestRideModal
        isOpen={isTestRideOpen}
        onClose={() => setIsTestRideOpen(false)}
        bike={bike}
      />

      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        bike={bike}
      />
    </div>
  );
};

export default BikeDetailClient;
