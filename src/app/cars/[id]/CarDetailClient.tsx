'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './CarDetailPage.module.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TestDriveModal } from '@/components/common/TestDriveModal';
import { EnquiryModal } from '@/components/common/EnquiryModal';
import { ICarDocument } from '@/models/Car';

interface CarDetailClientProps {
  car: ICarDocument;
}

export const CarDetailClient: React.FC<CarDetailClientProps> = ({ car }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isTestDriveOpen, setIsTestDriveOpen] = useState(false);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'photos' | '360'>('photos');

  const images = car.images && car.images.length > 0 ? car.images : ['/images/inventory/xuv700_hero.jpg'];

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
    const principal = price * 0.8;
    const ratePerMonth = 0.095 / 12;
    const months = 60;
    const emi = Math.round(
      (principal * ratePerMonth * Math.pow(1 + ratePerMonth, months)) /
        (Math.pow(1 + ratePerMonth, months) - 1)
    );
    return `₹${emi.toLocaleString()}/month`;
  };

  // 160-Point Audit Inspection Categories
  const inspectionPoints = [
    { title: 'Engine Compression & Drivetrain', status: 'Passed (Flawless)' },
    { title: 'Automatic / Manual Transmission Flow', status: 'Passed (Flawless)' },
    { title: 'Chassis Structural & Apron Integrity', status: 'Zero Accidental' },
    { title: 'Electricals, Sensors & ADAS Calibration', status: '100% Operational' },
    { title: 'Suspension, Dampers & Bushings', status: 'Factory Spec' },
    { title: 'Braking Disc & ABS Hydraulics', status: '85%+ Pad Life' },
    { title: 'Air Conditioning & Cabin Filtration', status: 'Sterilized & Chilled' },
    { title: 'Service Provenance & Digital Title', status: 'Single Owner Verified' },
  ];

  return (
    <div className={styles.pageWrapper}>
      <Navbar onOpenTestDrive={() => setIsTestDriveOpen(true)} />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Top Breadcrumb & Back Action */}
          <div className={styles.topBar}>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
              <Link href="/" className={styles.breadcrumbLink}>
                Home
              </Link>
              <span className={styles.breadcrumbSep}>/</span>
              <Link href="/cars" className={styles.breadcrumbLink}>
                Inventory Showroom
              </Link>
              <span className={styles.breadcrumbSep}>/</span>
              <span className={styles.breadcrumbCurrent}>{car.title}</span>
            </nav>

            <Link href="/cars" className={styles.backBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to Inventory
            </Link>
          </div>

          {/* Showroom Showcase Grid */}
          <div className={styles.showcaseGrid}>
            {/* Left Column: Gallery & Comprehensive Technical Dossier */}
            <div className={styles.galleryColumn}>
              {/* Media Gallery / 360 Studio Selector */}
              <div className={styles.galleryCard}>
                {/* Media Mode Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-base)' }}>
                  <button
                    onClick={() => setActiveTab('photos')}
                    style={{
                      padding: '12px 20px',
                      background: activeTab === 'photos' ? 'var(--color-bg-surface)' : 'transparent',
                      border: 'none',
                      borderBottom: activeTab === 'photos' ? '2px solid #C8A97E' : '2px solid transparent',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: activeTab === 'photos' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    Studio Gallery ({images.length})
                  </button>

                  <button
                    onClick={() => setActiveTab('360')}
                    style={{
                      padding: '12px 20px',
                      background: activeTab === '360' ? 'var(--color-bg-surface)' : 'transparent',
                      border: 'none',
                      borderBottom: activeTab === '360' ? '2px solid #C8A97E' : '2px solid transparent',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: activeTab === '360' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                    </svg>
                    360° Studio Turntable
                  </button>
                </div>

                {activeTab === 'photos' ? (
                  <>
                    <div className={styles.mainImageContainer}>
                      <img
                        src={images[activeImageIndex]}
                        alt={`${car.title} - angle ${activeImageIndex + 1}`}
                        className={styles.mainImage}
                      />

                      {/* Floating Badges */}
                      <div className={styles.badgeOverlay}>
                        <span className="eyebrow-badge" style={{ padding: '0.25rem 0.65rem' }}>
                          {car.inspectionScore}/160 Audit Passed
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '20px',
                            background: car.status === 'Available' ? 'rgba(25, 135, 84, 0.9)' : 'rgba(255, 193, 7, 0.9)',
                            color: '#FFF',
                          }}
                        >
                          {car.status}
                        </span>
                      </div>

                      {/* Next / Previous Controls */}
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

                    {/* Thumbnail Strip */}
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
                  </>
                ) : (
                  /* 360 Inspection Ready Architecture Tab */
                  <div className={styles.media360Section} style={{ border: 'none', borderRadius: 0 }}>
                    <div className={styles.media360Header}>
                      <span className={styles.media360Title}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                          <path d="M2 12h20" />
                        </svg>
                        360° Studio Turntable Architecture
                      </span>
                      <span className={styles.media360Badge}>Interactive Turntable Ready</span>
                    </div>

                    <div className={styles.media360Canvas}>
                      <img src={images[0]} alt={`${car.title} 360 view`} />
                      <div className={styles.media360Instruction}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                        </svg>
                        Multi-angle rotation sequence prepared for VIP digital showroom
                      </div>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                      This vehicle profile is provisioned with our high-definition 360° rotational inspection
                      pipeline. Every surface, tyre depth, and chassis reflection is calibrated for seamless digital evaluation.
                    </p>
                  </div>
                )}
              </div>

              {/* Description & Editorial Dossier */}
              <section className={styles.detailSection}>
                <h2 className={styles.sectionTitle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  Curator&apos;s Vehicle Dossier
                </h2>
                <p className={styles.descriptionText}>{car.description}</p>
              </section>

              {/* 160-Point Audit Mechanical Report */}
              <section className={styles.detailSection}>
                <h2 className={styles.sectionTitle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  160-Point Mechanical & Electronic Audit
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

              {/* Key Features Grid */}
              {car.features && car.features.length > 0 && (
                <section className={styles.detailSection}>
                  <h2 className={styles.sectionTitle}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Factory Features & Luxury Amenities
                  </h2>
                  <div className={styles.featuresGrid}>
                    {car.features.map((feature, idx) => (
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

            {/* Right Column: Sticky Commercial & Actions Panel */}
            <aside className={styles.sidebarColumn}>
              <div className={styles.summaryCard}>
                <div className={styles.titleArea}>
                  <span className={styles.brandYear}>
                    {car.year} · {car.brand} · {car.ownership}
                  </span>
                  <h1 className={styles.carHeadline}>{car.title}</h1>
                  <span className={styles.variantTag}>
                    {car.variant} · {car.color} Exterior
                  </span>
                </div>

                {/* Price Display */}
                <div className={styles.priceSection}>
                  <span className={styles.priceLabel}>Aureus Verified Acquisition Price</span>
                  <div className={styles.priceRow}>
                    <span className={styles.mainPrice}>{formatPrice(car.price)}</span>
                    <span className={styles.calculatedEmi}>Est. EMI {calculateEmi(car.price)}</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Inclusive of 160-point certification, 1-year warranty & RC transfer assistance.
                  </div>
                </div>

                {/* Primary Technical Specifications Table */}
                <div className={styles.specsTable}>
                  <div className={styles.specBox}>
                    <span className={styles.specBoxLabel}>Kilometers</span>
                    <span className={styles.specBoxValue}>{car.kilometers.toLocaleString()} km</span>
                  </div>

                  <div className={styles.specBox}>
                    <span className={styles.specBoxLabel}>Transmission</span>
                    <span className={styles.specBoxValue}>{car.transmission}</span>
                  </div>

                  <div className={styles.specBox}>
                    <span className={styles.specBoxLabel}>Fuel / Powertrain</span>
                    <span className={styles.specBoxValue}>{car.fuelType}</span>
                  </div>

                  <div className={styles.specBox}>
                    <span className={styles.specBoxLabel}>Body Style</span>
                    <span className={styles.specBoxValue}>{car.bodyType}</span>
                  </div>

                  <div className={styles.specBox}>
                    <span className={styles.specBoxLabel}>Ownership</span>
                    <span className={styles.specBoxValue}>{car.ownership}</span>
                  </div>

                  <div className={styles.specBox}>
                    <span className={styles.specBoxLabel}>Location</span>
                    <span className={styles.specBoxValue}>{car.location}</span>
                  </div>
                </div>

                {/* CTA Action Buttons */}
                <div className={styles.ctaArea}>
                  <button
                    type="button"
                    onClick={() => setIsTestDriveOpen(true)}
                    className={styles.primaryCta}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <polygon points="10 8 16 12 10 16 10 8" />
                    </svg>
                    Book a Test Drive
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEnquiryOpen(true)}
                    className={styles.secondaryCta}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    I&apos;m Interested
                  </button>
                </div>

                {/* Direct Concierge Line */}
                <div className={styles.conciergeStrip}>
                  <div className={styles.conciergeText}>
                    <strong>Need Immediate Assistance?</strong>
                    Speak with our vehicle concierge specialist
                  </div>
                  <a
                    href="https://wa.me/919820098200"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.conciergePhone}
                  >
                    WhatsApp &rarr;
                  </a>
                </div>
              </div>

              {/* Aureus Assurance Badges */}
              <div className={styles.assuranceCard}>
                <span className={styles.assuranceTitle}>Aureus Ownership Guarantee</span>

                <div className={styles.assuranceItem}>
                  <div className={styles.assuranceItemIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </div>
                  <div className={styles.assuranceItemText}>
                    <h4>1-Year Comprehensive Warranty</h4>
                    <p>Covers engine, transmission, steering rack, and high-voltage electrical components.</p>
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
                    <p>If the vehicle doesn&apos;t meet your standards, exchange it for another car from our showroom.</p>
                  </div>
                </div>

                <div className={styles.assuranceItem}>
                  <div className={styles.assuranceItemIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div className={styles.assuranceItemText}>
                    <h4>Zero Accidental Provenance</h4>
                    <p>Guaranteed clean legal title with no flood, meter-tampering, or structural compromise history.</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />

      <TestDriveModal
        isOpen={isTestDriveOpen}
        onClose={() => setIsTestDriveOpen(false)}
        car={car}
      />

      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        car={car}
      />
    </div>
  );
};

export default CarDetailClient;
