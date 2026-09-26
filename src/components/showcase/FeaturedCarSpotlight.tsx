'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ICar } from '@/types';
import styles from './FeaturedCarSpotlight.module.css';

interface FeaturedCarSpotlightProps {
  car: ICar;
  onInspect: (car: ICar) => void;
  onBookTestDrive: (car: ICar) => void;
}

export function FeaturedCarSpotlight({
  car,
  onInspect,
  onBookTestDrive,
}: FeaturedCarSpotlightProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = car.gallery && car.gallery.length > 0
    ? car.gallery
    : [car.featuredImages.hero || '/images/inventory/xuv700_hero.jpg'];

  const currentImage = images[activeImageIndex] || images[0];

  const formatPrice = (price: number) => {
    return (price / 100000).toFixed(2);
  };

  const originalPriceFormatted = car.originalMsrp
    ? (car.originalMsrp / 100000).toFixed(2)
    : null;

  return (
    <section className={styles.spotlightSection} aria-label="Curated Flagship Spotlight">
      <div className={styles.ambientGlow} />

      <div className={styles.container}>
        {/* Top Meta Bar */}
        <div className={styles.topMeta}>
          <div className={styles.eyebrowBadge}>
            <span className={styles.badgePulse} />
            Showroom Spotlight Vehicle
          </div>
          <div className={styles.locationTag}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Available for Immediate Inspection · {car.locationCity}
          </div>
        </div>

        {/* Main 2-Column Showcase */}
        <div className={styles.mainGrid}>
          {/* Left Column: Big Interactive Photography & Gallery */}
          <div className={styles.visualWrapper} onClick={() => onInspect(car)}>
            <div className={styles.imageFrame}>
              <Image
                src={currentImage}
                alt={`${car.year} ${car.title} flagship vehicle`}
                fill
                priority
                sizes="(max-width: 960px) 100vw, 55vw"
                className={styles.carImage}
              />
              <div className={styles.imageGradientOverlay} />

              {/* Thumbnails to switch angle */}
              {images.length > 1 && (
                <div 
                  className={styles.galleryThumbnails}
                  onClick={(e) => e.stopPropagation()}
                >
                  {images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`${styles.thumbBtn} ${idx === activeImageIndex ? styles.thumbBtnActive : ''}`}
                      onClick={() => setActiveImageIndex(idx)}
                      aria-label={`View angle ${idx + 1}`}
                    >
                      <Image
                        src={imgUrl}
                        alt={`Angle ${idx + 1}`}
                        width={54}
                        height={36}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Prompt to open full dossier */}
              <div className={styles.interactivePill}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
                Click to Open Complete 160-Point Audit Dossier
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Details */}
          <div className={styles.contentColumn}>
            <div className={styles.yearSubheading}>
              {car.year} · {car.brand} Flagship Collection
            </div>
            <h2 className={styles.headline}>
              {car.model} {car.variant.split(' ')[0]}
            </h2>
            <p className={styles.variantNote}>
              {car.variant} · Finished in {car.exteriorColor} over {car.interiorColor}. Single owner, verified history.
            </p>

            {/* Price Box */}
            <div className={styles.priceBox}>
              <div className={styles.currentPrice}>
                ₹{formatPrice(car.price)} Lakh
              </div>
              {originalPriceFormatted && (
                <div className={styles.originalPrice}>
                  ₹{originalPriceFormatted} Lakh New
                </div>
              )}
              {car.originalMsrp && (
                <span className={styles.savingsBadge}>
                  Save ₹{((car.originalMsrp - car.price) / 100000).toFixed(2)} Lakh
                </span>
              )}
              <div className={styles.emiText}>
                Estimated EMI: <span className={styles.emiHighlight}>₹38,450/month</span> at 8.75% for 60 months
              </div>
            </div>

            {/* Key Specs Matrix */}
            <div className={styles.specsGrid}>
              <div className={styles.specCard}>
                <div className={styles.specLabel}>Odometer</div>
                <div className={styles.specValue}>{car.mileageKm.toLocaleString('en-IN')} km</div>
              </div>
              <div className={styles.specCard}>
                <div className={styles.specLabel}>Transmission</div>
                <div className={styles.specValue}>{car.transmission}</div>
              </div>
              <div className={styles.specCard}>
                <div className={styles.specLabel}>Drivetrain / Fuel</div>
                <div className={styles.specValue}>{car.fuelType} AWD</div>
              </div>
              <div className={styles.specCard}>
                <div className={styles.specLabel}>Peak Power</div>
                <div className={styles.specValue}>{car.specs.powerHp} HP mHawk</div>
              </div>
              <div className={styles.specCard}>
                <div className={styles.specLabel}>Peak Torque</div>
                <div className={styles.specValue}>{car.specs.torqueNm} Nm</div>
              </div>
              <div className={styles.specCard}>
                <div className={styles.specLabel}>RTO Registration</div>
                <div className={styles.specValue}>{car.registrationState.split(' ')[0]}</div>
              </div>
            </div>

            {/* CTAs */}
            <div className={styles.ctaRow}>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => onInspect(car)}
              >
                Inspect Vehicle Dossier
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => onBookTestDrive(car)}
              >
                Schedule Private Test Drive
              </button>
            </div>

            {/* Certification Strip */}
            <div className={styles.certStrip}>
              <div className={styles.certItem}>
                <svg className={styles.certIcon} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                160-Point Audit: 160/160
              </div>
              <div className={styles.certItem}>
                <svg className={styles.certIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                1-Year Pan-India Warranty
              </div>
              <div className={styles.certItem}>
                <svg className={styles.certIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                7-Day Money Back Guarantee
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
