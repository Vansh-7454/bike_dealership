'use client';

import React from 'react';
import Link from 'next/link';
import styles from './CarCard.module.css';
import { ICarDocument } from '@/models/Car';

interface CarCardProps {
  car: ICarDocument;
  variant?: 'normal' | 'wide';
}

export const CarCard: React.FC<CarCardProps> = ({ car, variant = 'normal' }) => {
  const formatPrice = (price: number) => {
    const lakhs = (price / 100000).toFixed(2);
    return `₹${lakhs} Lakh`;
  };

  const calculateEmi = (price: number) => {
    // Approx 5-year loan at 9.5% interest with 20% down
    const principal = price * 0.8;
    const ratePerMonth = 0.095 / 12;
    const months = 60;
    const emi = Math.round(
      (principal * ratePerMonth * Math.pow(1 + ratePerMonth, months)) /
        (Math.pow(1 + ratePerMonth, months) - 1)
    );
    return `Est. EMI ₹${emi.toLocaleString()}/mo`;
  };

  const primaryImage = car.images && car.images.length > 0 ? car.images[0] : '/images/car_xuv700_showroom.jpg';
  const detailUrl = `/cars/${car.slug || car._id}`;

  return (
    <article className={`${styles.card} ${variant === 'wide' ? styles.cardWide : ''}`}>
      {/* Vehicle Media Area */}
      <div className={styles.imageWrapper}>
        <Link href={detailUrl} className="block w-full h-full">
          <img
            src={primaryImage}
            alt={car.title}
            className={styles.image}
            loading="lazy"
          />
        </Link>

        {/* Floating Badges */}
        <div className={styles.badgeTopLeft}>
          {car.featured && (
            <span className={styles.featuredBadge}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Featured
            </span>
          )}
          <span className="eyebrow-badge" style={{ padding: '0.2rem 0.55rem', fontSize: '0.66rem' }}>
            {car.inspectionScore}/160 Audit
          </span>
        </div>

        <div className={styles.badgeTopRight}>
          <span
            className={`${styles.statusBadge} ${
              car.status === 'Available' ? styles.statusAvailable : styles.statusReserved
            }`}
          >
            {car.status}
          </span>
        </div>

        {car.media360?.enabled && (
          <div className={styles.media360Pill} title="360° Studio Inspection Ready">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>360° View</span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className={styles.content}>
        <div className={styles.headerInfo}>
          <div className={styles.yearBrand}>
            <span>{car.year}</span>
            <span>•</span>
            <span>{car.brand}</span>
            {car.ownership && (
              <>
                <span>•</span>
                <span>{car.ownership}</span>
              </>
            )}
          </div>

          <Link href={detailUrl} style={{ textDecoration: 'none' }}>
            <h3 className={styles.title}>{car.title}</h3>
          </Link>

          <div className={styles.locationRow}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{car.location}</span>
          </div>
        </div>

        {/* Quick Specs Strip */}
        <div className={styles.specsStrip}>
          <div className={styles.specPill}>
            <span>KM:</span>
            <strong>{car.kilometers.toLocaleString()}</strong>
          </div>
          <div className={styles.specPill}>
            <span>Fuel:</span>
            <strong>{car.fuelType}</strong>
          </div>
          <div className={styles.specPill}>
            <span>Trans:</span>
            <strong>{car.transmission}</strong>
          </div>
          <div className={styles.specPill}>
            <span>Body:</span>
            <strong>{car.bodyType}</strong>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className={styles.footer}>
          <div className={styles.priceBlock}>
            <span className={styles.priceLabel}>Aureus Value</span>
            <span className={styles.priceAmount}>{formatPrice(car.price)}</span>
            <span className={styles.priceEmi}>{calculateEmi(car.price)}</span>
          </div>

          <Link href={detailUrl} className={styles.ctaButton}>
            <span>Explore Car</span>
            <svg
              className={styles.ctaArrow}
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default CarCard;
