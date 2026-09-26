'use client';

import React from 'react';
import Link from 'next/link';
import styles from './BrandStoryTestimonials.module.css';

export const BrandStoryTestimonials: React.FC = () => {
  const testimonials = [
    {
      quote:
        'Aureus delivered my XUV700 directly to our residence in Juhu. The 160-point inspection dossier gave us complete peace of mind that a standard pre-owned lot could never match.',
      author: 'Vikramaditya S. Singhania',
      role: 'Acquired 2023 Mahindra XUV700 AX7L · Mumbai',
    },
    {
      quote:
        'The absolute transparency in diagnostic telemetry and paint thickness scanning is refreshing. You are dealing with engineers and automotive curators, not commission-driven middlemen.',
      author: 'Ananya Deshmukh',
      role: 'Acquired 2023 Hyundai Creta SX(O) · Bengaluru',
    },
    {
      quote:
        'Selling our corporate fleet vehicle through their direct acquisition protocol was executed with clockwork precision. Valuation confirmed at 11 AM, RTGS credited by 12:30 PM.',
      author: 'Rohan Mehra',
      role: 'Managing Director · Mehra Logistics, Delhi NCR',
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className="eyebrow-badge">THE PATRON RECORD</span>
          <h2 className={styles.headline}>
            Endorsed by India&apos;s Most <em>Discerning Drivers</em>
          </h2>
          <p className={styles.subheadline}>
            Discover why entrepreneurs, executives, and automotive collectors entrust their acquisitions to
            the Aureus sanctuary.
          </p>
        </div>

        {/* 3-Column Testimonial Cards */}
        <div className={styles.testimonialsGrid}>
          {testimonials.map((t, idx) => (
            <div key={idx} className={styles.card}>
              <p className={styles.quoteText}>&ldquo;{t.quote}&rdquo;</p>
              <div className={styles.clientInfo}>
                <span className={styles.clientName}>{t.author}</span>
                <span className={styles.clientVehicle}>{t.role}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Final Brand Experience Invitation */}
        <div className={styles.invitationBox}>
          <div className={styles.invitationText}>
            <h3 className={styles.invitationTitle}>Experience the Aureus Sanctuary</h3>
            <p className={styles.invitationDesc}>
              Explore our current collection of 160-point certified pre-owned automobiles or visit our flagship
              studio salon in Bandra Kurla Complex, Mumbai.
            </p>
          </div>

          <div className={styles.invitationActions}>
            <Link href="/cars" className={styles.primaryBtn}>
              Explore All Cars &rarr;
            </Link>
            <Link href="/contact" className={styles.secondaryBtn}>
              Contact Concierge
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandStoryTestimonials;
