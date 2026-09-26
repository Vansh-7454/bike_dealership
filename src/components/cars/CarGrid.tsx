'use client';

import React from 'react';
import styles from './CarGrid.module.css';
import CarCard from './CarCard';
import { ICarDocument } from '@/models/Car';

interface CarGridProps {
  cars: ICarDocument[];
  loading?: boolean;
  error?: string | null;
  onResetFilters?: () => void;
  featuredFirstWide?: boolean;
}

export const CarGrid: React.FC<CarGridProps> = ({
  cars,
  loading = false,
  error = null,
  onResetFilters,
  featuredFirstWide = true,
}) => {
  if (loading) {
    return (
      <div className={styles.gridContainer}>
        <div className={styles.cardsGrid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className={styles.skeletonCard}>
              <div className={styles.skeletonImage} />
              <div className={styles.skeletonContent}>
                <div className={styles.skeletonLine} style={{ width: '40%' }} />
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonLine} style={{ width: '60%' }} />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '0.8rem',
                    alignItems: 'center',
                  }}
                >
                  <div className={styles.skeletonPrice} />
                  <div
                    className={styles.skeletonLine}
                    style={{ width: '80px', height: '32px', borderRadius: '6px' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <div className={styles.errorTitle}>Unable to load inventory</div>
        <p className={styles.errorText}>{error}</p>
        {onResetFilters && (
          <button onClick={onResetFilters} className={styles.emptyResetBtn}>
            Try Resetting Filters
          </button>
        )}
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </div>
        <h3 className={styles.emptyTitle}>No cars match your criteria</h3>
        <p className={styles.emptyText}>
          We couldn&apos;t find any pre-owned vehicles matching your selected filters. Try broadening your
          search parameters or clear filters to view our full collection.
        </p>
        {onResetFilters && (
          <button onClick={onResetFilters} className={styles.emptyResetBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Clear All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.gridContainer}>
      <div className={styles.cardsGrid}>
        {cars.map((car, index) => {
          // Editorial Rhythm: First car is wide if featuredFirstWide is true AND car is featured,
          // OR an occasional wide card at position 0 to give editorial hierarchy.
          const isWide = featuredFirstWide && index === 0 && car.featured;

          return (
            <CarCard
              key={car._id || car.slug || index}
              car={car}
              variant={isWide ? 'wide' : 'normal'}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CarGrid;
