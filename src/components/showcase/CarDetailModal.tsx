'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './CarDetailModal.module.css';
import { Button } from '@/components/common/Button';
import { ICar } from '@/types';

interface CarDetailModalProps {
  car: ICar | null;
  isOpen: boolean;
  onClose: () => void;
  onBookTestDrive: (car: ICar) => void;
}

export const CarDetailModal: React.FC<CarDetailModalProps> = ({
  car,
  isOpen,
  onClose,
  onBookTestDrive,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!isOpen || !car) return null;

  const galleryImages = car.gallery && car.gallery.length > 0
    ? car.gallery
    : [car.featuredImages?.hero || '/images/inventory/xuv700_hero.jpg'];

  const formatPrice = (price: number) => {
    const lakhs = (price / 100000).toFixed(2);
    return `₹${lakhs} Lakh`;
  };

  const calculateEmi = (price: number) => {
    const est = Math.round((price * 0.8 * 0.09) / 12 + (price * 0.8) / 60);
    return `₹${est.toLocaleString('en-IN')}/mo`;
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
              {car.inspectionSummary?.certificationBadge || 'Aureus Gold Certified'}
            </span>
          </div>

          <div className={styles.mainImageWrapper}>
            <Image
              src={galleryImages[activeImageIndex] || galleryImages[0]}
              alt={car.title}
              fill
              className={styles.mainImage}
              priority
            />
          </div>

          {galleryImages.length > 1 && (
            <div className={styles.thumbnailBar}>
              {galleryImages.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  className={`${styles.thumbnailBtn} ${activeImageIndex === idx ? styles.thumbnailActive : ''}`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <Image src={img} alt={`${car.title} view ${idx + 1}`} fill className={styles.thumbnailImg} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          <div className={styles.titleArea}>
            <div className={styles.titleInfo}>
              <span className="eyebrow-badge">
                {car.year} • {car.bodyType} • {car.fuelType}
              </span>
              <h2 className={styles.carTitle}>{car.title}</h2>
              <p className={styles.carVariant}>{car.variant}</p>
            </div>

            <div className={styles.priceBlock}>
              <span className={styles.priceLabel}>Aureus Verified Value</span>
              <span className={styles.priceValue}>{formatPrice(car.price)}</span>
              <span className={styles.priceEmi}>Estimated EMI: {calculateEmi(car.price)}</span>
            </div>
          </div>

          {/* Key Metric Highlights */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Odometer</span>
              <span className={styles.metricValue}>{car.mileageKm.toLocaleString()} KM</span>
              <span className={styles.metricSub}>Genuine Authorized Logs</span>
            </div>

            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Ownership</span>
              <span className={styles.metricValue}>{car.ownersCount === 1 ? '1st Owner' : `${car.ownersCount} Owners`}</span>
              <span className={styles.metricSub}>{car.registrationState}</span>
            </div>

            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Transmission</span>
              <span className={styles.metricValue}>{car.transmission}</span>
              <span className={styles.metricSub}>{car.fuelType} Powertrain</span>
            </div>

            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Audit Status</span>
              <span className={styles.metricValue}>{car.inspectionSummary?.passedPoints || 160} / 160</span>
              <span className={styles.metricSub}>100% Comprehensive Pass</span>
            </div>
          </div>

          {/* Detailed Highlights & Inspection Pillars */}
          <div className={styles.twoColSection}>
            <div className={styles.colBlock}>
              <h3 className={styles.blockTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Inspection & Quality Highlights
              </h3>
              <ul className={styles.highlightList}>
                {car.keyHighlights?.map((hl, i) => (
                  <li key={i} className={styles.highlightItem}>
                    <span className={styles.checkIcon}>✓</span>
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.colBlock}>
              <h3 className={styles.blockTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                Studio Location & Handover
              </h3>
              <ul className={styles.highlightList}>
                <li className={styles.highlightItem}>
                  <span className={styles.checkIcon}>📍</span>
                  <span>Currently Available at: <strong>{car.locationCity}</strong></span>
                </li>
                <li className={styles.highlightItem}>
                  <span className={styles.checkIcon}>🛡️</span>
                  <span>7-Day Unconditional Money-Back Guarantee included</span>
                </li>
                <li className={styles.highlightItem}>
                  <span className={styles.checkIcon}>📜</span>
                  <span>Immediate RTO Transfer, NOC, and Comprehensive Insurance</span>
                </li>
                <li className={styles.highlightItem}>
                  <span className={styles.checkIcon}>🚚</span>
                  <span>Pan-India Doorstep Delivery via Enclosed Covered Carriers</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action CTAs */}
          <div className={styles.modalActions}>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                onClose();
                onBookTestDrive(car);
              }}
            >
              Request Callback & Audit Sheet
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => {
                onClose();
                onBookTestDrive(car);
              }}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              }
            >
              Book Test Drive
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
