'use client';

import React from 'react';
import Link from 'next/link';
import { IBike } from '@/types';
import styles from './FeaturedBikeSpotlight.module.css';

interface FeaturedBikeSpotlightProps {
  bike: IBike;
  onBookTestRide: (bike: IBike) => void;
}

export const FeaturedBikeSpotlight: React.FC<FeaturedBikeSpotlightProps> = ({
  bike,
  onBookTestRide,
}) => {
  const formatPrice = (price: number) => {
    return (price / 100000).toFixed(2);
  };

  const primaryImage =
    bike.images && bike.images.length > 0 ? bike.images[0] : '/images/bikes/hunter_350_hero.jpg';

  const detailUrl = `/bikes/${bike.slug || bike.id}`;

  return (
    <section className={styles.spotlightSection} aria-label="Curated Motorcycle Spotlight">
      <div className={styles.container}>
        {/* Top Meta Bar */}
        <div className={styles.topMeta}>
          <div className={styles.eyebrowBadge}>
            <span className={styles.badgePulse} />
            Showroom Spotlight Machine
          </div>
          <div className={styles.locationTag}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Available for Immediate Inspection · {bike.location}
          </div>
        </div>

        {/* Main 2-Column Showcase */}
        <div className={styles.mainGrid}>
          {/* Left Column: Big Photography */}
          <div className={styles.visualWrapper}>
            <div className={styles.imageFrame}>
              <img
                src={primaryImage}
                alt={`${bike.title} in spotlight`}
                className={styles.mainImage}
                loading="lazy"
              />
            </div>
          </div>

          {/* Right Column: Detailed Motorcycle Specs & CTAs */}
          <div className={styles.detailsCol}>
            <div className={styles.titleArea}>
              <span className={styles.yearBrand}>
                {bike.year} · {bike.brand} · {bike.ownership}
              </span>
              <h2 className={styles.title}>{bike.title}</h2>
              <span className={styles.variant}>
                {bike.variant} · {bike.bikeType}
              </span>
            </div>

            {/* Price Box */}
            <div className={styles.priceBox}>
              <span className={styles.currentPrice}>₹{formatPrice(bike.price)} Lakh</span>
              {bike.originalMsrp && (
                <span className={styles.originalPrice}>₹{formatPrice(bike.originalMsrp)} Lakh New</span>
              )}
              <span className={styles.priceNote}>Save ~20% vs Showroom MSRP</span>
            </div>

            {/* Specs Row */}
            <div className={styles.specsRow}>
              <div className={styles.specCard}>
                <span className={styles.specLabel}>Engine</span>
                <span className={styles.specValue}>{bike.engineCC} cc</span>
              </div>
              <div className={styles.specCard}>
                <span className={styles.specLabel}>Odometer</span>
                <span className={styles.specValue}>{bike.kilometers.toLocaleString()} km</span>
              </div>
              <div className={styles.specCard}>
                <span className={styles.specLabel}>Efficiency</span>
                <span className={styles.specValue}>{bike.mileage} kmpl</span>
              </div>
              <div className={styles.specCard}>
                <span className={styles.specLabel}>Inspection</span>
                <span className={styles.specValue}>{bike.inspectionScore || 120}/120</span>
              </div>
            </div>

            {/* Highlights List */}
            <div className={styles.highlightsList}>
              <div className={styles.highlightItem}>
                <svg className={styles.highlightIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Full authorized service records logged with genuine odometer verification</span>
              </div>
              <div className={styles.highlightItem}>
                <svg className={styles.highlightIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Chassis laser alignment and fork runout verified zero accidental</span>
              </div>
              <div className={styles.highlightItem}>
                <svg className={styles.highlightIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Backed by 6-Month Powertrain Warranty and 7-Day Exchange</span>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.actionRow}>
              <button
                type="button"
                onClick={() => onBookTestRide(bike)}
                className={styles.primaryBtn}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10 8 16 12 10 16 10 8" />
                </svg>
                <span>Book Test Ride</span>
              </button>

              <Link href={detailUrl} className={styles.secondaryBtn}>
                <span>View Full Motorcycle Dossier &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBikeSpotlight;
