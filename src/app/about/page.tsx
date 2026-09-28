'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './AboutPage.module.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TestRideModal } from '@/components/common/TestRideModal';

export default function AboutPage() {
  const [isTestRideOpen, setIsTestRideOpen] = useState(false);

  const pillars = [
    {
      title: 'Chassis & Fork Laser Alignment',
      desc: 'Precision laser runout and frame gauge scanning across all structural weld points. Zero tolerance for bent forks, frame flex, or accidental straightening.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      title: 'Powertrain & Valve Calibration',
      desc: 'Dynamic cylinder compression, tappet valve clearances, and clutch plate slip analysis under operational peak-torque thermal conditions.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
    {
      title: 'Electronic Fuel Injection & ECU Map',
      desc: 'OEM diagnostic scanner interrogation checking for cleared fault codes, sensor drift, stator charging voltages, and unapproved ECU tampering.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      ),
    },
    {
      title: 'Braking Hydraulics & ABS Modules',
      desc: 'Disc rotor thickness micrometer scan, pad compound life (minimum 80% required), brake line fluid moisture test, and ABS electronic modulator check.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      title: 'Chain, Sprockets & Suspension',
      desc: 'Drive chain pitch elongation, sprocket tooth symmetry, rear monoshock damping response, and front telescopic fork seal inspection.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
    },
    {
      title: 'Provenance & Single-Owner Title',
      desc: 'Direct cross-referencing with authorized OEM dealer service networks across India. Odometer rollback verification with absolute legal title indemnity.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
  ];

  return (
    <div className={styles.pageWrapper}>
      <Navbar onOpenTestRide={() => setIsTestRideOpen(true)} />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Section 1: Hero */}
          <section className={styles.editorialHero}>
            <div className={styles.heroHeaderArea}>
              <span className="eyebrow-badge">THE TORQUE MANIFESTO</span>
              <h1 className={styles.heroHeadline}>
                The Pursuit of <em>Motorcycle Rectitude</em> in India.
              </h1>
              <p className={styles.heroLeadText}>
                We founded Torque Two-Wheelers to resolve a pervasive marketplace compromise. For years, buying a
                pre-owned motorcycle in India meant navigating rolled-back odometers, accident covers, and
                hidden engine wear. We engineered a platform built on absolute diagnostic transparency.
              </p>
            </div>

            {/* Asymmetrical Visual & Philosophy Feature */}
            <div className={styles.asymmetricShowcase}>
              <div className={styles.showcaseImageWrapper}>
                <img
                  src="/images/bikes/classic_350.jpg"
                  alt="Torque master diagnostic technician inspecting a motorcycle"
                  className={styles.showcaseImage}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div className={styles.showcaseCaption}>
                <span className="eyebrow-badge">DIAGNOSTIC RIGOR</span>
                <h2 className={styles.captionTitle}>
                  Only 1 in 10 motorcycles inspected earns the Torque Certification seal.
                </h2>
                <p className={styles.captionBody}>
                  Our diagnostic evaluation rejects bikes for subtle inconsistencies that most street-corner dealers
                  ignore: sub-millimeter fork bend, aftermarket unmapped exhausts, altered wiring looms, or
                  unrecorded drops. When you ride out with a motorcycle from Torque, its pedigree is proven beyond
                  technical doubt.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Numerical Milestones */}
          <section className={styles.metricsSection}>
            <div className={styles.metricsGrid}>
              <div className={styles.metricItem}>
                <span className={styles.metricValue}>3,200+</span>
                <span className={styles.metricLabel}>Curated Deliveries</span>
                <span className={styles.metricDesc}>Certified motorcycles handed over to riders across India.</span>
              </div>

              <div className={styles.metricItem}>
                <span className={styles.metricValue}>120/120</span>
                <span className={styles.metricLabel}>Audit Checkpoints</span>
                <span className={styles.metricDesc}>Forensic mechanical, electronic, and chassis evaluation.</span>
              </div>

              <div className={styles.metricItem}>
                <span className={styles.metricValue}>100%</span>
                <span className={styles.metricLabel}>Zero Accident Record</span>
                <span className={styles.metricDesc}>Zero tolerance for frame flex, flood, or structural repair.</span>
              </div>

              <div className={styles.metricItem}>
                <span className={styles.metricValue}>99.2%</span>
                <span className={styles.metricLabel}>Rider Retention</span>
                <span className={styles.metricDesc}>Patrons who return to upgrade or recommend our concierge.</span>
              </div>
            </div>
          </section>

          {/* Section 3: Manifesto */}
          <section className={styles.manifestoSection}>
            <div className={styles.manifestoGrid}>
              <div className={styles.manifestoTitleArea}>
                <span className="eyebrow-badge">SANCTUARY VALUES</span>
                <h2 className={styles.manifestoHeading}>
                  Radical transparency as an engineering philosophy.
                </h2>

                {/* Dark Luxury Mechanical Covenant Card */}
                <div className={styles.manifestoCard}>
                  <div className={styles.manifestoCardHeader}>
                    <span className={styles.manifestoCardTitle}>Torque Mechanical Covenant</span>
                    <span className={styles.manifestoCardBadge}>Zero Compromise</span>
                  </div>

                  <div className={styles.manifestoList}>
                    <div className={styles.manifestoItem}>
                      <span className={styles.manifestoCheck}>✓</span>
                      <span>Chassis laser collimation & zero frame deformation tolerance</span>
                    </div>
                    <div className={styles.manifestoItem}>
                      <span className={styles.manifestoCheck}>✓</span>
                      <span>Factory compression baseline with live ECU diagnostic logs</span>
                    </div>
                    <div className={styles.manifestoItem}>
                      <span className={styles.manifestoCheck}>✓</span>
                      <span>Verified single-owner lineage & legal indemnity RC transfer</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.manifestoTextColumn}>
                <p>
                  In traditional two-wheeler retail, information asymmetry favors the seller. Minor accident repairs
                  are concealed with fresh decals, exhaust blow-by is masked with heavy oil, and meter rollbacks are
                  rampant.
                </p>
                <p>
                  <strong>Torque operates as a sanctuary.</strong> Every motorcycle dossier includes unvarnished
                  records: factory compression figures, ECU scan logs, brake pad thickness measurements, and chain
                  wear coefficients. We believe true passion begins with truth.
                </p>
                <p>
                  Our relationship with a rider does not end when you ride off the showroom floor. We back every
                  certified machine with our 6-Month Powertrain Warranty, a 7-Day Exchange privilege, and a
                  Guaranteed Buyback agreement within 24 months.
                </p>

                <div className={styles.curatorSignOff}>
                  <span className={styles.signOffName}>Sameer V. Rane</span>
                  <span className={styles.signOffRole}>Chief Curator & Master Technician · Torque Two-Wheelers</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: 6 Forensic Inspection Pillars */}
          <section className={styles.pillarsSection}>
            <div className={styles.sectionCenterHeader}>
              <span className="eyebrow-badge">FORENSIC PRECISION</span>
              <h2 className={styles.sectionTitle}>The 6 Pillars of the Torque 120-Point Audit</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                Conducted by factory-trained motorcycle technicians utilizing aerospace-grade diagnostic instruments.
              </p>
            </div>

            <div className={styles.pillarsGrid}>
              {pillars.map((pillar, i) => (
                <div key={i} className={styles.pillarCard}>
                  <div className={styles.pillarIconWrapper}>{pillar.icon}</div>
                  <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                  <p className={styles.pillarDesc}>{pillar.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5: Quote Spread */}
          <section className={styles.quoteSpreadSection}>
            <div className={styles.quoteContainer}>
              <span className={styles.quoteSymbol}>&ldquo;</span>
              <blockquote className={styles.quoteText}>
                Acquiring my Hunter 350 through Torque felt less like buying a used bike and more like picking up a
                precision timepiece. The mechanical dossier provided deeper provenance than most new-bike dealerships
                could offer.
              </blockquote>
              <div className={styles.quoteAuthor}>
                <span className={styles.authorName}>Aditya R. Nair</span>
                <span className={styles.authorTitle}>Creative Director & Motorcycle Tourer · Mumbai</span>
              </div>
            </div>
          </section>

          {/* Section 6: Final CTA */}
          <section className={styles.finalCtaSection}>
            <div className={styles.ctaInner}>
              <span className="eyebrow-badge">EXPERIENCE THE DIFFERENCE</span>
              <h2 className={styles.ctaHeadline}>Ride With Absolute Confidence</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Visit our flagship studio in Bandra Kurla Complex, Mumbai, or explore our currently certified
                motorcycle collection online.
              </p>

              <div className={styles.ctaButtons}>
                <Link
                  href="/bikes"
                  style={{
                    padding: '13px 28px',
                    background: 'var(--color-text-primary)',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontSize: '0.92rem',
                  }}
                >
                  Explore Current Inventory &rarr;
                </Link>
                <Link
                  href="/contact"
                  style={{
                    padding: '12px 24px',
                    background: 'transparent',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-strong)',
                    borderRadius: '8px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    fontSize: '0.92rem',
                  }}
                >
                  Schedule Studio Visit
                </Link>
              </div>
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
