'use client';

import React from 'react';
import styles from './BikeGrid.module.css';
import { BikeCard } from './BikeCard';
import { IBikeDocument } from '@/models/Bike';

interface BikeGridProps {
  bikes: IBikeDocument[];
  loading?: boolean;
  error?: string | null;
  onResetFilters?: () => void;
  featuredFirstWide?: boolean;
}

export const BikeGrid: React.FC<BikeGridProps> = ({
  bikes,
  loading = false,
  error = null,
  onResetFilters,
  featuredFirstWide = false,
}) => {
  if (loading) {
    return (
      <div className={styles.loadingSkeleton}>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className={styles.skeletonCard} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3 className={styles.emptyTitle}>Unable to Load Inventory</h3>
        <p className={styles.emptyDesc}>{error}</p>
      </div>
    );
  }

  if (bikes.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <h3 className={styles.emptyTitle}>No Matching Motorcycles Found</h3>
        <p className={styles.emptyDesc}>
          We couldn&apos;t find any motorcycles matching your current filter criteria. Try expanding your search
          parameters or reset your filters.
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            style={{
              padding: '10px 20px',
              background: 'var(--color-text-primary)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              marginTop: '0.5rem',
            }}
          >
            Reset Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {bikes.map((bike, index) => {
        const isWide = featuredFirstWide && index === 0 && bike.featured;
        return <BikeCard key={bike._id || bike.slug || index} bike={bike} variant={isWide ? 'wide' : 'normal'} />;
      })}
    </div>
  );
};

export default BikeGrid;
