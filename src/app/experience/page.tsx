'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './ExperiencePage.module.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TestDriveModal } from '@/components/common/TestDriveModal';

export default function ExperiencePage() {
  const [isTestDriveOpen, setIsTestDriveOpen] = useState(false);
  const [activeStage, setActiveStage] = useState('stage1');

  const scrollToStage = (id: string) => {
    setActiveStage(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const stages = [
    { id: 'stage1', num: '01', label: 'Discover' },
    { id: 'stage2', num: '02', label: 'Inspect' },
    { id: 'stage3', num: '03', label: 'Experience' },
    { id: 'stage4', num: '04', label: 'Decide' },
    { id: 'stage5', num: '05', label: 'Drive Away' },
  ];

  return (
    <div className={styles.pageWrapper}>
      <Navbar onOpenTestDrive={() => setIsTestDriveOpen(true)} />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Section 1: Atmospheric Visual Intro */}
          <section className={styles.experienceHero}>
            <div className={styles.heroContent}>
              <span className="eyebrow-badge">THE ACQUISITION PROTOCOL</span>
              <h1 className={styles.heroHeadline}>
                From Curated Discovery to the <em>Unveiling Ceremony</em>.
              </h1>
              <p className={styles.heroSubtext}>
                We dismantled the conventional used car buying ordeal to engineer an uncompromising,
                white-glove patronage experience worthy of India’s finest automobiles.
              </p>
            </div>
          </section>

          {/* Sticky Stage Navigation */}
          <div className={styles.stageNavSticky}>
            <div className={styles.stageNavInner}>
              {stages.map((stg) => (
                <button
                  key={stg.id}
                  onClick={() => scrollToStage(stg.id)}
                  className={`${styles.stageNavBtn} ${activeStage === stg.id ? styles.stageNavBtnActive : ''}`}
                >
                  <span className={styles.stageNavNum}>{stg.num}</span>
                  <span>{stg.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: 5 Visual Narrative Chapters */}
          <div className={styles.chaptersContainer}>
            {/* Chapter 01: Discover */}
            <section id="stage1" className={styles.chapterRow}>
              <div className={styles.chapterContent}>
                <span className={styles.chapterStepBadge}>
                  <span>Stage 01</span>
                  <span>•</span>
                  <span>Dossier Exploration</span>
                </span>
                <h2 className={styles.chapterHeading}>Curated Discovery with Forensic Transparency</h2>
                <p className={styles.chapterDesc}>
                  Your acquisition journey begins with digital dossiers that go far beyond standard portal
                  listings. Every car in our inventory is presented with studio 360° inspection photography,
                  unretouched body panel reflections, and verifiable digital service provenance.
                </p>

                <div className={styles.chapterPointsList}>
                  <div className={styles.chapterPointItem}>
                    <svg className={styles.chapterPointIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Zero concealed dealer markups or phantom inventory. What you see is parked in our studio.</span>
                  </div>
                  <div className={styles.chapterPointItem}>
                    <svg className={styles.chapterPointIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Single-owner lineage cross-referenced against authorized OEM databases.</span>
                  </div>
                </div>
              </div>

              {/* Graphical Digital Dossier Card */}
              <div className={styles.dossierGraphicCard}>
                <div className={styles.dossierGraphicHeader}>
                  <span className={styles.dossierVehicleName}>Digital Vehicle Dossier</span>
                  <span className={styles.dossierScoreBadge}>160/160 Certified</span>
                </div>
                <div className={styles.dossierSpecsRows}>
                  <div className={styles.dossierSpecItem}>
                    <span className={styles.dossierSpecLabel}>Structural Ultrasound</span>
                    <span className={styles.dossierSpecValue}>Passed (Zero Deformity)</span>
                  </div>
                  <div className={styles.dossierSpecItem}>
                    <span className={styles.dossierSpecLabel}>Paint Depth Micron Scan</span>
                    <span className={styles.dossierSpecValue}>110 - 135 µm (Factory OEM)</span>
                  </div>
                  <div className={styles.dossierSpecItem}>
                    <span className={styles.dossierSpecLabel}>ECU Telematics Status</span>
                    <span className={styles.dossierSpecValue}>0 Active Codes / Stock Map</span>
                  </div>
                  <div className={styles.dossierSpecItem}>
                    <span className={styles.dossierSpecLabel}>Title Provenance</span>
                    <span className={styles.dossierSpecValue}>1st Owner · Clean Legal Title</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Chapter 02: Inspect */}
            <section id="stage2" className={`${styles.chapterRow} ${styles.chapterRowReverse}`}>
              <div className={styles.chapterContent}>
                <span className={styles.chapterStepBadge}>
                  <span>Stage 02</span>
                  <span>•</span>
                  <span>Technical Due Diligence</span>
                </span>
                <h2 className={styles.chapterHeading}>Review the 160-Point Forensic Audit</h2>
                <p className={styles.chapterDesc}>
                  We do not ask you to trust our word; we invite you to review the physical diagnostics.
                  Inspect magnetic paint gauge readings, cylinder compression profiles, and OBD-II telemetry
                  accompanied by a dedicated Aureus technical diagnostician.
                </p>

                <div className={styles.chapterPointsList}>
                  <div className={styles.chapterPointItem}>
                    <svg className={styles.chapterPointIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Independent third-party inspection welcoming: Bring your trusted mechanic or technician.</span>
                  </div>
                  <div className={styles.chapterPointItem}>
                    <svg className={styles.chapterPointIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Live diagnostic scanner demonstration on the vehicle in our diagnostic bay.</span>
                  </div>
                </div>
              </div>

              <div className={styles.chapterMedia}>
                <Image
                  src="/images/about_craftsmanship.jpg"
                  alt="Aureus diagnostic engineer conducting vehicle evaluation"
                  fill
                  className={styles.chapterImage}
                />
              </div>
            </section>

            {/* Chapter 03: Experience */}
            <section id="stage3" className={styles.chapterRow}>
              <div className={styles.chapterContent}>
                <span className={styles.chapterStepBadge}>
                  <span>Stage 03</span>
                  <span>•</span>
                  <span>Private Viewing & Drive</span>
                </span>
                <h2 className={styles.chapterHeading}>The Doorstep or Studio Test Drive</h2>
                <p className={styles.chapterDesc}>
                  Experience the vehicle in the environment that matters to you. Request an executive doorstep
                  test drive delivered to your residence or corporate headquarters, or visit our flagship studio
                  salon for a private evening appointment over single-origin espresso.
                </p>

                <div className={styles.chapterPointsList}>
                  <div className={styles.chapterPointItem}>
                    <svg className={styles.chapterPointIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Extended dynamic road testing including high-speed expressway and urban traffic evaluations.</span>
                  </div>
                  <div className={styles.chapterPointItem}>
                    <svg className={styles.chapterPointIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Acoustic and cabin comfort evaluation with ADAS feature walkthrough.</span>
                  </div>
                </div>
              </div>

              <div className={styles.chapterMedia}>
                <Image
                  src="/images/sell_inspection.jpg"
                  alt="Aureus doorstep evaluation specialist"
                  fill
                  className={styles.chapterImage}
                />
              </div>
            </section>

            {/* Chapter 04: Decide */}
            <section id="stage4" className={`${styles.chapterRow} ${styles.chapterRowReverse}`}>
              <div className={styles.chapterContent}>
                <span className={styles.chapterStepBadge}>
                  <span>Stage 04</span>
                  <span>•</span>
                  <span>Transparent Acquisition</span>
                </span>
                <h2 className={styles.chapterHeading}>Bespoke Private Financing & Clean Title</h2>
                <p className={styles.chapterDesc}>
                  Once you decide, our financial concierge handles all complexities. Benefit from pre-arranged
                  private banking relationships with HDFC, ICICI, and Kotak at preferential new-car lending
                  rates, with single-day digital loan sanctioning and zero documentation friction.
                </p>

                <div className={styles.chapterPointsList}>
                  <div className={styles.chapterPointItem}>
                    <svg className={styles.chapterPointIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Transparent all-inclusive pricing: zero hidden documentation fees or dealer commissions.</span>
                  </div>
                  <div className={styles.chapterPointItem}>
                    <svg className={styles.chapterPointIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Comprehensive RC transfer expedited with complete legal indemnity bond.</span>
                  </div>
                </div>
              </div>

              {/* Graphic Financial Dossier */}
              <div className={styles.dossierGraphicCard}>
                <div className={styles.dossierGraphicHeader}>
                  <span className={styles.dossierVehicleName}>Aureus Financial Framework</span>
                  <span className={styles.dossierScoreBadge}>Same-Day Sanction</span>
                </div>
                <div className={styles.dossierSpecsRows}>
                  <div className={styles.dossierSpecItem}>
                    <span className={styles.dossierSpecLabel}>Preferred Rate Tier</span>
                    <span className={styles.dossierSpecValue}>From 8.75% per annum</span>
                  </div>
                  <div className={styles.dossierSpecItem}>
                    <span className={styles.dossierSpecLabel}>Loan Tenure</span>
                    <span className={styles.dossierSpecValue}>Up to 84 Months (7 Years)</span>
                  </div>
                  <div className={styles.dossierSpecItem}>
                    <span className={styles.dossierSpecLabel}>RC Transfer Timeline</span>
                    <span className={styles.dossierSpecValue}>30 - 45 Business Days</span>
                  </div>
                  <div className={styles.dossierSpecItem}>
                    <span className={styles.dossierSpecLabel}>Legal Protection</span>
                    <span className={styles.dossierSpecValue}>100% Indemnity Guaranteed</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Chapter 05: Drive Away */}
            <section id="stage5" className={styles.chapterRow}>
              <div className={styles.chapterContent}>
                <span className={styles.chapterStepBadge}>
                  <span>Stage 05</span>
                  <span>•</span>
                  <span>The Handover Ceremony</span>
                </span>
                <h2 className={styles.chapterHeading}>The Unveiling & Lifelong Sanctuary Protection</h2>
                <p className={styles.chapterDesc}>
                  Vehicle delivery is an occasion to celebrate. Your automobile is presented under theatrical
                  studio illumination, accompanied by our signature handover gift, bespoke leather presentation
                  key box, and complete 1-Year Comprehensive Warranty documentation.
                </p>

                <div className={styles.chapterPointsList}>
                  <div className={styles.chapterPointItem}>
                    <svg className={styles.chapterPointIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>7-Day No-Questions Exchange: If you are not completely delighted, exchange it.</span>
                  </div>
                  <div className={styles.chapterPointItem}>
                    <svg className={styles.chapterPointIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Assured Buyback Value agreed in writing valid for up to 24 months.</span>
                  </div>
                </div>
              </div>

              <div className={styles.chapterMedia}>
                <Image
                  src="/images/experience_unveil.jpg"
                  alt="Aureus client handover unveiling ceremony"
                  fill
                  className={styles.chapterImage}
                />
              </div>
            </section>
          </div>

          {/* Section 3: The Aureus Patron Compact */}
          <section className={styles.compactSection}>
            <div className={styles.compactHeader}>
              <span className="eyebrow-badge">SANCTUARY COVENANT</span>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 700 }}>
                The Aureus Patron Compact
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                Four institutional guarantees that accompany every certified vehicle in our sanctuary.
              </p>
            </div>

            <div className={styles.compactGrid}>
              <div className={styles.compactCard}>
                <div className={styles.compactCardIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                </div>
                <h3 className={styles.compactCardTitle}>7-Day Exchange</h3>
                <p className={styles.compactCardDesc}>
                  Drive your acquired car for 7 days. If it fails to meet your highest expectations, return it
                  for full credit toward another vehicle.
                </p>
              </div>

              <div className={styles.compactCard}>
                <div className={styles.compactCardIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <h3 className={styles.compactCardTitle}>1-Year Warranty</h3>
                <p className={styles.compactCardDesc}>
                  Comprehensive coverage protecting engine mechanicals, automatic gearbox hydraulics, steering
                  electronics, and high-voltage modules.
                </p>
              </div>

              <div className={styles.compactCard}>
                <div className={styles.compactCardIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <h3 className={styles.compactCardTitle}>Guaranteed Buyback</h3>
                <p className={styles.compactCardDesc}>
                  Pre-agreed buyback valuation defined at time of acquisition, valid for up to 24 months,
                  guaranteeing depreciation protection.
                </p>
              </div>

              <div className={styles.compactCard}>
                <div className={styles.compactCardIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <h3 className={styles.compactCardTitle}>24/7 Roadside Concierge</h3>
                <p className={styles.compactCardDesc}>
                  Pan-India roadside assistance with luxury replacement vehicle mobility in major metropolitan
                  cities.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Final Experience CTA */}
          <section className={styles.experienceCta}>
            <div className={styles.experienceCtaInner}>
              <span className="eyebrow-badge">COMMENCE YOUR ACQUISITION</span>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 700 }}>
                Begin Your Acquisition Journey Today
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: '1.6' }}>
                Explore our certified inventory or speak directly with an Aureus senior vehicle advisor.
              </p>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
                <Link
                  href="/cars"
                  style={{
                    padding: '14px 30px',
                    background: '#1A1A1A',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                  }}
                >
                  Explore Showroom Inventory &rarr;
                </Link>
                <button
                  type="button"
                  onClick={() => setIsTestDriveOpen(true)}
                  style={{
                    padding: '14px 24px',
                    background: 'transparent',
                    color: '#1A1A1A',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                  }}
                >
                  Schedule Private Test Drive
                </button>
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
