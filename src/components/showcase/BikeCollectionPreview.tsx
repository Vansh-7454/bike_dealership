'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './BikeCollectionPreview.module.css';
import { BikeCard } from '@/components/bikes/BikeCard';
import { IBikeDocument } from '@/models/Bike';

export const BikeCollectionPreview: React.FC = () => {
  const [bikes, setBikes] = useState<IBikeDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    async function loadBikes() {
      try {
        setLoading(true);
        const res = await fetch('/api/bikes?limit=8');
        if (res.ok) {
          const data = await res.json();
          if (data.bikes && data.bikes.length > 0) {
            setBikes(data.bikes);
          }
        }
      } catch (err) {
        console.warn('Failed to load showcase bikes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBikes();
  }, []);

  const filteredBikes = bikes.filter((b) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'street') return b.bikeType === 'Street / Naked';
    if (activeCategory === 'cruiser') return b.bikeType === 'Cruiser';
    if (activeCategory === 'commuter') return b.bikeType === 'Commuter';
    return true;
  });

  return (
    <section className={styles.section} id="collection">
      <div className="container">
        {/* Header & Category Filter Tabs */}
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <span className="eyebrow-badge">CURATED INVENTORY</span>
            <h2 className={styles.headline}>
              Recently Added <em>Motorcycles</em>
            </h2>
            <p className={styles.subheadline}>
              Every machine is verified with our 120-point mechanical inspection, zero accident tolerance, and genuine odometer reading.
            </p>
          </div>

          <div className={styles.categoryTabs}>
            <button
              onClick={() => setActiveCategory('all')}
              className={`${styles.tabBtn} ${activeCategory === 'all' ? styles.tabBtnActive : ''}`}
            >
              All Models
            </button>
            <button
              onClick={() => setActiveCategory('street')}
              className={`${styles.tabBtn} ${activeCategory === 'street' ? styles.tabBtnActive : ''}`}
            >
              Street / Naked
            </button>
            <button
              onClick={() => setActiveCategory('cruiser')}
              className={`${styles.tabBtn} ${activeCategory === 'cruiser' ? styles.tabBtnActive : ''}`}
            >
              Cruiser
            </button>
            <button
              onClick={() => setActiveCategory('commuter')}
              className={`${styles.tabBtn} ${activeCategory === 'commuter' ? styles.tabBtnActive : ''}`}
            >
              Commuter
            </button>
          </div>
        </div>

        {/* Motorcycle Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-secondary)' }}>
            Loading certified inventory...
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredBikes.map((bike) => (
              <BikeCard key={bike._id || bike.slug} bike={bike} />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className={styles.footerCta}>
          <Link href="/bikes" className={styles.viewAllBtn}>
            <span>View Complete Inventory ({bikes.length}+ Motorcycles)</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            Doorstep test rides available across Mumbai, Bengaluru, Delhi NCR, and Pune
          </span>
        </div>
      </div>
    </section>
  );
};

export default BikeCollectionPreview;
