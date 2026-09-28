'use client';

import React from 'react';
import Link from 'next/link';
import styles from './BikeDetailModal.module.css';
import { IBike } from '@/types';

interface BikeDetailModalProps {
  bike: IBike | null;
  isOpen: boolean;
  onClose: () => void;
  onBookTestRide: (bike: IBike) => void;
}

export const BikeDetailModal: React.FC<BikeDetailModalProps> = ({
  bike,
  isOpen,
  onClose,
  onBookTestRide,
}) => {
  if (!isOpen || !bike) return null;

  const image = bike.images?.[0] || '/images/bikes/hunter_350_hero.jpg';

  const formatPrice = (price: number) => {
    const lakhs = (price / 100000).toFixed(2);
    return `₹${lakhs} Lakh`;
  };

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        {/* Gallery Section */}
        <div className={styles.gallerySection}>
          <div className={styles.badgeOverlay}>
            <span className={styles.certBadge}>
              <span className={styles.verifiedDot}></span>
              120-Point Certified Provenance
            </span>
          </div>

          <div className={styles.mainImageWrapper}>
            <img src={image} alt={bike.title} className={styles.mainImage} />
          </div>
        </div>

        {/* Content Section */}
        <div className={styles.contentSection}>
          <div className={styles.headerArea}>
            <div className={styles.titleRow}>
              <div>
                <span className={styles.bodyTypeBadge}>{bike.bikeType}</span>
                <h3 className={styles.vehicleTitle}>{bike.title}</h3>
                <p className={styles.vehicleVariant}>{bike.variant}</p>
              </div>

              <div className={styles.priceContainer}>
                <span className={styles.priceLabel}>Verified Price</span>
                <span className={styles.priceValue}>{formatPrice(bike.price)}</span>
              </div>
            </div>
          </div>

          {/* Motorcycle Specifications Grid */}
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
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Transmission</span>
              <span className={styles.specValue}>{bike.transmission}</span>
            </div>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Ownership</span>
              <span className={styles.specValue}>{bike.ownership}</span>
            </div>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Location</span>
              <span className={styles.specValue}>{bike.location}</span>
            </div>
          </div>

          {/* Description */}
          <p className={styles.descriptionText}>{bike.description}</p>

          {/* Actions */}
          <div className={styles.ctaRow}>
            <button
              type="button"
              className={styles.bookDriveBtn}
              onClick={() => onBookTestRide(bike)}
            >
              Book Test Ride
            </button>
            <Link
              href={`/bikes/${bike.slug || bike.id}`}
              className={styles.viewFullDossierLink}
              onClick={onClose}
            >
              Full Motorcycle Dossier &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BikeDetailModal;
