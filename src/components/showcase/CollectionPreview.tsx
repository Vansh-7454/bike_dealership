'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './CollectionPreview.module.css';
import { ICarDocument } from '@/models/Car';

interface CollectionPreviewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onViewDetails?: (car: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onBookTestDrive?: (car: any) => void;
}

type FilterCategory = 'all' | 'suv' | 'sedan' | 'hybrid';

export const CollectionPreview: React.FC<CollectionPreviewProps> = ({
  onBookTestDrive,
}) => {
  const [cars, setCars] = useState<ICarDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');

  useEffect(() => {
    async function loadCars() {
      try {
        setLoading(true);
        // Fetch real inventory from MongoDB endpoint
        const res = await fetch('/api/cars?limit=8');
        if (res.ok) {
          const data = await res.json();
          if (data.cars && data.cars.length > 0) {
            setCars(data.cars);
          }
        }
      } catch (err) {
        console.warn('Failed to load showcase cars:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCars();
  }, []);

  const filteredCars = cars.filter((car) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'suv') return car.bodyType === 'SUV';
    if (activeCategory === 'sedan') return car.bodyType === 'Sedan';
    if (activeCategory === 'hybrid') return car.fuelType === 'Hybrid';
    return true;
  });

  const formatPrice = (price: number) => {
    const lakhs = (price / 100000).toFixed(2);
    return `₹${lakhs} Lakh`;
  };

  const calculateEmi = (price: number) => {
    const principal = price * 0.8;
    const ratePerMonth = 0.095 / 12;
    const months = 60;
    const emi = Math.round(
      (principal * ratePerMonth * Math.pow(1 + ratePerMonth, months)) /
        (Math.pow(1 + ratePerMonth, months) - 1)
    );
    return `₹${emi.toLocaleString()}/m`;
  };

  return (
    <section id="collection" className={styles.section}>
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <span className="eyebrow-badge">VERIFIED SHOWROOM STOCK</span>
            <h2 className={styles.headline}>
              Select vehicles ready for <em>immediate delivery</em>.
            </h2>
            <p className={styles.subheadline}>
              Every vehicle has undergone our rigorous 160-point mechanical and digital audit. Complete service
              provenance, single-owner pedigree, and zero accidental history guaranteed.
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className={styles.filterRow} role="tablist">
          <button
            type="button"
            className={`${styles.filterBtn} ${activeCategory === 'all' ? styles.filterBtnActive : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All Certified ({cars.length})
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${activeCategory === 'suv' ? styles.filterBtnActive : ''}`}
            onClick={() => setActiveCategory('suv')}
          >
            SUVs ({cars.filter((c) => c.bodyType === 'SUV').length})
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${activeCategory === 'sedan' ? styles.filterBtnActive : ''}`}
            onClick={() => setActiveCategory('sedan')}
          >
            Executive Sedans ({cars.filter((c) => c.bodyType === 'Sedan').length})
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${activeCategory === 'hybrid' ? styles.filterBtnActive : ''}`}
            onClick={() => setActiveCategory('hybrid')}
          >
            Strong Hybrids ({cars.filter((c) => c.fuelType === 'Hybrid').length})
          </button>
        </div>

        {/* Dynamic Cars Grid */}
        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className={styles.carCard}
                style={{ minHeight: '380px', background: '#F5F3EF', opacity: 0.7 }}
              >
                <div style={{ height: '220px', background: '#E8E4DC' }} />
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div style={{ height: '14px', width: '40%', background: '#E0DDD5', borderRadius: '4px' }} />
                  <div style={{ height: '24px', width: '80%', background: '#E0DDD5', borderRadius: '4px' }} />
                  <div style={{ height: '18px', width: '50%', background: '#E0DDD5', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredCars.slice(0, 6).map((car) => {
              const isHybrid = car.fuelType === 'Hybrid';
              const detailUrl = `/cars/${car.slug || car._id}`;
              const primaryImage = car.images?.[0] || '/images/inventory/xuv700_hero.jpg';

              return (
                <article key={car._id || car.slug} className={styles.carCard}>
                  {/* Vehicle Photography */}
                  <div className={styles.imageWrapper}>
                    <Link href={detailUrl} style={{ display: 'block', width: '100%', height: '100%' }}>
                      <img
                        src={primaryImage}
                        alt={`${car.year} ${car.title}`}
                        className={styles.carImage}
                        loading="lazy"
                      />
                    </Link>
                    <div className={styles.imageGradient} />

                    {/* Badges */}
                    <span className={styles.badgeLeft}>
                      <span className={styles.verifiedDot} />
                      {isHybrid ? 'Hybrid Powertrain' : `${car.inspectionScore}/160 Certified`}
                    </span>

                    <span className={styles.locationRight}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {car.location.split(',')[0]}
                    </span>
                  </div>

                  {/* Card Content Body */}
                  <div className={styles.cardBody}>
                    <div className={styles.metaRow}>
                      <span>{car.year}</span>
                      <span className={styles.metaDot}>•</span>
                      <span>{car.brand}</span>
                      <span className={styles.metaDot}>•</span>
                      <span>{car.ownership}</span>
                    </div>

                    <Link href={detailUrl} style={{ textDecoration: 'none' }}>
                      <h3 className={styles.carTitle}>{car.title}</h3>
                    </Link>

                    <p className={styles.variantLine}>
                      {car.variant} · {car.color}
                    </p>

                    {/* Clean 4-Item Spec Ribbon */}
                    <div className={styles.specsStrip}>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Odometer</span>
                        <span className={styles.specValue}>{car.kilometers.toLocaleString('en-IN')} km</span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Gearbox</span>
                        <span className={styles.specValue}>{car.transmission.split(' ')[0]}</span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Fuel</span>
                        <span className={styles.specValue}>{car.fuelType}</span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Audit</span>
                        <span className={styles.specValue}>{car.inspectionScore}/160</span>
                      </div>
                    </div>

                    {/* Footer: Price & Actions */}
                    <div className={styles.cardFooter}>
                      <div className={styles.priceRow}>
                        <div className={styles.priceBlock}>
                          <span className={styles.priceLabel}>Acquisition Price</span>
                          <span className={styles.priceValue}>{formatPrice(car.price)}</span>
                        </div>
                        <span className={styles.emiBadge}>EMI {calculateEmi(car.price)}</span>
                      </div>

                      <div className={styles.actionRow}>
                        <Link href={detailUrl} className={styles.inspectBtn}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                          </svg>
                          Inspect Dossier
                        </Link>
                        <button
                          type="button"
                          className={styles.testDriveBtn}
                          onClick={() => onBookTestDrive?.(car)}
                        >
                          Test Drive
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* View All Cars Call To Action */}
        <div className={styles.viewAllContainer}>
          <Link href="/cars" className={styles.viewAllBtn}>
            <span>View All Cars in Showroom</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <span className={styles.viewAllSubtext}>
            Explore all {cars.length > 0 ? `${cars.length}+` : ''} 160-point certified executive & luxury vehicles
          </span>
        </div>
      </div>
    </section>
  );
};

export default CollectionPreview;
