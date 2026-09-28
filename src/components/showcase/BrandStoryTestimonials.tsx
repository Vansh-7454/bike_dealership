'use client';

import React from 'react';
import Link from 'next/link';
import styles from './BrandStoryTestimonials.module.css';

export const BrandStoryTestimonials: React.FC = () => {
  const testimonials = [
    {
      quote:
        'Torque delivered my Hunter 350 directly to my apartment in Bandra. The 120-point mechanical dossier with cylinder compression tests and fork runout gave me confidence no local bike dealer could ever offer.',
      author: 'Arjun N. Varma',
      role: 'Acquired 2023 Royal Enfield Hunter 350 · Mumbai',
    },
    {
      quote:
        'The absolute transparency in odometer history and chassis alignment was refreshing. You are dealing with passionate motorcycle engineers, not commission-driven middlemen pushing repainted accident bikes.',
      author: 'Pooja Kashyap',
      role: 'Acquired 2022 Royal Enfield Classic 350 · Bengaluru',
    },
    {
      quote:
        'Selling my Pulsar NS200 through their doorstep selling protocol was effortless. Inspection took 20 minutes, firm price agreed, and payment reached my account via RTGS before the bike left my driveway.',
      author: 'Kunal Deshmukh',
      role: 'Sold 2023 Bajaj Pulsar NS200 · Pune',
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className="eyebrow-badge">THE RIDER RECORD</span>
          <h2 className={styles.headline}>
            Endorsed by India&apos;s Most <em>Passionate Riders</em>
          </h2>
          <p className={styles.subheadline}>
            Discover why enthusiasts, commuters, and daily riders entrust their two-wheeler acquisitions to
            Torque Two-Wheelers.
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
            <h3 className={styles.invitationTitle}>Experience the Torque Benchmark</h3>
            <p className={styles.invitationDesc}>
              Visit our flagship showroom studio in BKC Mumbai, or browse our verified certified collection online.
            </p>
          </div>
          <div className={styles.invitationActions}>
            <Link href="/bikes" className={styles.ctaPrimary}>
              Explore All Motorcycles &rarr;
            </Link>
            <Link href="/sell-your-bike" className={styles.ctaSecondary}>
              Sell Your Bike
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandStoryTestimonials;
