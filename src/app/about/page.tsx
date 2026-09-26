'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './AboutPage.module.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TestDriveModal } from '@/components/common/TestDriveModal';

export default function AboutPage() {
  const [isTestDriveOpen, setIsTestDriveOpen] = useState(false);

  const pillars = [
    {
      title: 'Structural & Apron Integrity',
      desc: 'Forensic digital ultrasound and magnetic paint-depth scanning across 42 chassis contact points. Zero structural compromise or accidental repair tolerance.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      title: 'Powertrain & Gearbox Calibration',
      desc: 'Dynamic cylinder compression, valve clearance, and dual-clutch transmission thermal profiling under rigorous peak-torque operational conditions.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
    {
      title: 'ADAS, Sensors & Module Telematics',
      desc: 'Complete factory-level OBD-II interrogation checking for cleared fault codes, ECU tampering, sensor drifts, and radar millimeter calibration.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      ),
    },
    {
      title: 'Braking Hydraulics & Active Suspension',
      desc: 'Disc runout tolerances, pad compound thickness (minimum 80% life required), electronic damping, and anti-roll bushing stress evaluations.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      title: 'Provenance & Single-Owner Heritage',
      desc: 'Direct cross-referencing with authorized OEM dealer service databases across India. Meter-rollback verification with absolute legal indemnity.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
    {
      title: 'Cabin Sterilization & Acoustic Sealed',
      desc: 'Deep ultrasonic extraction, hospital-grade ozone sterilization, leather moisture replenishment, and acoustic insulation certification.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
  ];

  return (
    <div className={styles.pageWrapper}>
      <Navbar onOpenTestDrive={() => setIsTestDriveOpen(true)} />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Section 1: Editorial Magazine Hero */}
          <section className={styles.editorialHero}>
            <div className={styles.heroHeaderArea}>
              <span className="eyebrow-badge">THE AUREUS MANIFESTO</span>
              <h1 className={styles.heroHeadline}>
                The Pursuit of <em>Automotive Rectitude</em> in India.
              </h1>
              <p className={styles.heroLeadText}>
                We established Aureus Motors not to sell more vehicles, but to resolve a fundamental market
                compromise. For decades, acquiring a pre-owned car in India meant navigating ambiguity, opaque
                histories, and superficial cosmetic cover-ups. We created an institution built on radical
                engineering transparency.
              </p>
            </div>

            {/* Asymmetrical Visual & Philosophy Feature */}
            <div className={styles.asymmetricShowcase}>
              <div className={styles.showcaseImageWrapper}>
                <Image
                  src="/images/about_craftsmanship.jpg"
                  alt="Aureus master engineer performing precision diagnostic inspection"
                  fill
                  className={styles.showcaseImage}
                  priority
                />
              </div>

              <div className={styles.showcaseCaption}>
                <span className="eyebrow-badge">MASTER DIAGNOSTICS</span>
                <h2 className={styles.captionTitle}>
                  Only 1 in 14 vehicles inspected earns the Aureus Certification seal.
                </h2>
                <p className={styles.captionBody}>
                  Our diagnostic evaluation rejects vehicles for subtle inconsistencies that most secondary
                  market dealers dismiss: non-OEM paint overspray, sub-millimeter chassis flex, unrecorded
                  minor water ingress, or micro-tampering of telematics. When you acquire a car from Aureus,
                  its pedigree is proven beyond technical doubt.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Numerical Milestones */}
          <section className={styles.metricsSection}>
            <div className={styles.metricsGrid}>
              <div className={styles.metricItem}>
                <span className={styles.metricValue}>2,480+</span>
                <span className={styles.metricLabel}>Curated Deliveries</span>
                <span className={styles.metricDesc}>Executive & luxury automobiles transferred across India.</span>
              </div>

              <div className={styles.metricItem}>
                <span className={styles.metricValue}>160/160</span>
                <span className={styles.metricLabel}>Audit Checkpoints</span>
                <span className={styles.metricDesc}>Forensic mechanical, electronic, and structural evaluation.</span>
              </div>

              <div className={styles.metricItem}>
                <span className={styles.metricValue}>100%</span>
                <span className={styles.metricLabel}>Zero Accident Record</span>
                <span className={styles.metricDesc}>Zero tolerance for flood, structural, or frame compromise.</span>
              </div>

              <div className={styles.metricItem}>
                <span className={styles.metricValue}>99.4%</span>
                <span className={styles.metricLabel}>Client Retention</span>
                <span className={styles.metricDesc}>Patrons who return to upgrade or recommend our concierge.</span>
              </div>
            </div>
          </section>

          {/* Section 3: The Founding Story & Curator Manifesto */}
          <section className={styles.manifestoSection}>
            <div className={styles.manifestoGrid}>
              <div className={styles.manifestoTitleArea}>
                <span className="eyebrow-badge">SANCTUARY VALUES</span>
                <h2 className={styles.manifestoHeading}>
                  Radical honesty as an engineering philosophy.
                </h2>
              </div>

              <div className={styles.manifestoTextColumn}>
                <p>
                  In traditional automotive retail, information asymmetry favors the seller. Minor repairs are
                  concealed, electronic fault codes are temporarily cleared, and meter rollbacks are obscured by
                  clever detailing.
                </p>
                <p>
                  <strong>Aureus operates as a sanctuary.</strong> Every vehicle dossier includes unvarnished
                  records: factory paint thickness measurements, ECU scan timestamps, suspension damper wear
                  coefficients, and tire tread depth micrometer readings. We believe true luxury begins with
                  truth.
                </p>
                <p>
                  Our relationship with a patron does not conclude when the car leaves the studio floor. We back
                  every certified vehicle with our 1-Year Comprehensive Warranty, a 7-Day No-Questions
                  Exchange privilege, and a Guaranteed Buyback agreement within 24 months.
                </p>

                <div className={styles.curatorSignOff}>
                  <span className={styles.signOffName}>Devendra Vardhan Singhal</span>
                  <span className={styles.signOffRole}>Chief Curator & Engineering Director · Aureus Motors</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: The 6 Forensic Inspection Pillars */}
          <section className={styles.pillarsSection}>
            <div className={styles.sectionCenterHeader}>
              <span className="eyebrow-badge">FORENSIC PRECISION</span>
              <h2 className={styles.sectionTitle}>The 6 Pillars of the Aureus 160-Point Audit</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                Conducted by factory-trained master technicians utilizing aerospace-grade diagnostic instruments.
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

          {/* Section 5: Editorial Testimonial Spread */}
          <section className={styles.quoteSpreadSection}>
            <div className={styles.quoteContainer}>
              <span className={styles.quoteSymbol}>&ldquo;</span>
              <blockquote className={styles.quoteText}>
                Acquiring my executive SUV through Aureus felt less like buying a pre-owned vehicle and more like
                commissioning a tailored timepiece. The technical dossier provided deeper provenance than many
                new-car dealerships could offer.
              </blockquote>
              <div className={styles.quoteAuthor}>
                <span className={styles.authorName}>Rajeshwar M. Singhania</span>
                <span className={styles.authorTitle}>Managing Partner · Singhania Capital Advisors, Mumbai</span>
              </div>
            </div>
          </section>

          {/* Section 6: Final Brand CTA */}
          <section className={styles.finalCtaSection}>
            <div className={styles.ctaInner}>
              <span className="eyebrow-badge">DISCOVER THE DIFFERENCE</span>
              <h2 className={styles.ctaHeadline}>Experience Curated Automotive Excellence</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Visit our flagship studio in Bandra Kurla Complex, Mumbai, or explore our currently certified
                collection online.
              </p>

              <div className={styles.ctaButtons}>
                <Link
                  href="/cars"
                  style={{
                    padding: '13px 28px',
                    background: '#1A1A1A',
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
                    color: '#1A1A1A',
                    border: '1px solid var(--color-border-subtle)',
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

      <TestDriveModal
        isOpen={isTestDriveOpen}
        onClose={() => setIsTestDriveOpen(false)}
      />
    </div>
  );
}
