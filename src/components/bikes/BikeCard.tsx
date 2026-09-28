'use client';

import React from 'react';
import Link from 'next/link';
import styles from './BikeCard.module.css';
import { IBikeDocument } from '@/models/Bike';

interface BikeCardProps {
  bike: IBikeDocument;
  variant?: 'normal' | 'wide';
}

export const BikeCard: React.FC<BikeCardProps> = ({ bike, variant = 'normal' }) => {
  const formatPrice = (price: number) => {
    const lakhs = (price / 100000).toFixed(2);
    return `₹${lakhs} Lakh`;
  };

  const primaryImage =
    bike.images && bike.images.length > 0 ? bike.images[0] : '/images/bikes/hunter_350_hero.jpg';
  const detailUrl = `/bikes/${bike.slug || bike._id}`;

  return (
    <article className={`${styles.card} ${variant === 'wide' ? styles.cardWide : ''}`}>
      {/* Vehicle Media Area */}
      <div className={styles.imageWrapper}>
        <Link href={detailUrl} className="block w-full h-full">
          <img src={primaryImage} alt={bike.title} className={styles.image} loading="lazy" />
        </Link>

        {/* Floating Badges */}
        <div className={styles.badgeTopLeft}>
          {bike.featured && (
            <span className={styles.featuredBadge}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Featured
            </span>
          )}
          <span
            className="eyebrow-badge"
            style={{ padding: '0.2rem 0.55rem', fontSize: '0.66rem' }}
          >
            {bike.inspectionScore || 120}/120 Inspected
          </span>
        </div>

        {bike.status === 'Sold' && (
          <span className={`${styles.statusBadge} ${styles.statusSold}`}>Sold</span>
        )}
      </div>

      {/* Card Content Area */}
      <div className={styles.content}>
        <div className={styles.headerArea}>
          <div className={styles.brandYear}>
            {bike.year} · {bike.brand} · {bike.ownership}
          </div>
          <Link href={detailUrl} style={{ textDecoration: 'none' }}>
            <h3 className={styles.title}>{bike.title}</h3>
          </Link>
          <div className={styles.variantTag}>
            {bike.variant} · {bike.bikeType}
          </div>
        </div>

        {/* Key Motorcycle Specifications */}
        <div className={styles.specsGrid}>
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Engine</span>
            <span className={styles.specValue}>{bike.engineCC} cc</span>
          </div>
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Odometer</span>
            <span className={styles.specValue}>{bike.kilometers.toLocaleString()} km</span>
          </div>
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Mileage</span>
            <span className={styles.specValue}>{bike.mileage} kmpl</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className={styles.footerRow}>
          <div className={styles.priceCol}>
            <span className={styles.priceLabel}>Verified Price</span>
            <span className={styles.priceValue}>{formatPrice(bike.price)}</span>
          </div>

          <Link href={detailUrl} className={styles.viewBtn}>
            <span>View Details</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BikeCard;
