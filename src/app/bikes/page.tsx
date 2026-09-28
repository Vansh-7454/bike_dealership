'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './BikesPage.module.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BikeFilters, BikeFilterState } from '@/components/bikes/BikeFilters';
import { BikeGrid } from '@/components/bikes/BikeGrid';
import { TestRideModal } from '@/components/common/TestRideModal';
import { IBikeDocument } from '@/models/Bike';

function BikesInventoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<BikeFilterState>({
    search: searchParams.get('search') || '',
    brand: searchParams.get('brand') || 'All',
    bikeType: searchParams.get('bikeType') || 'All',
    fuelType: searchParams.get('fuelType') || 'All',
    transmission: searchParams.get('transmission') || 'All',
    sort: searchParams.get('sort') || 'newest',
  });

  const [bikes, setBikes] = useState<IBikeDocument[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableBikeTypes, setAvailableBikeTypes] = useState<string[]>([]);
  const [availableFuelTypes, setAvailableFuelTypes] = useState<string[]>([]);

  // Test ride modal state
  const [isTestRideOpen, setIsTestRideOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedTestRideBike, setSelectedTestRideBike] = useState<any>(null);

  const isMountedRef = React.useRef(false);

  const fetchBikes = useCallback(async (currentFilters: BikeFilterState) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (currentFilters.search.trim()) params.set('search', currentFilters.search.trim());
      if (currentFilters.brand !== 'All') params.set('brand', currentFilters.brand);
      if (currentFilters.bikeType !== 'All') params.set('bikeType', currentFilters.bikeType);
      if (currentFilters.fuelType !== 'All') params.set('fuelType', currentFilters.fuelType);
      if (currentFilters.transmission !== 'All') params.set('transmission', currentFilters.transmission);
      if (currentFilters.sort) params.set('sort', currentFilters.sort);
      params.set('limit', '24');
      params.set('t', Date.now().toString());

      const res = await fetch(`/api/bikes?${params.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch inventory (status: ${res.status})`);
      }

      const data = await res.json();
      const returnedBikes = data.bikes || [];
      setBikes(returnedBikes);
      setTotal(data.total ?? returnedBikes.length);

      if (data.brands?.length) setAvailableBrands(data.brands);
      if (data.bikeTypes?.length) setAvailableBikeTypes(data.bikeTypes);
      if (data.fuelTypes?.length) setAvailableFuelTypes(data.fuelTypes);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while loading bikes';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const syncUrlParams = useCallback(
    (newFilters: BikeFilterState) => {
      const params = new URLSearchParams();
      if (newFilters.search.trim()) params.set('search', newFilters.search.trim());
      if (newFilters.brand !== 'All') params.set('brand', newFilters.brand);
      if (newFilters.bikeType !== 'All') params.set('bikeType', newFilters.bikeType);
      if (newFilters.fuelType !== 'All') params.set('fuelType', newFilters.fuelType);
      if (newFilters.transmission !== 'All') params.set('transmission', newFilters.transmission);
      if (newFilters.sort !== 'newest') params.set('sort', newFilters.sort);

      const queryString = params.toString();
      const newPath = queryString ? `/bikes?${queryString}` : '/bikes';
      router.push(newPath, { scroll: false });
    },
    [router]
  );

  const handleFilterChange = (key: keyof BikeFilterState, value: string) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    syncUrlParams(updated);
  };

  const handleResetFilters = () => {
    const defaultFilters: BikeFilterState = {
      search: '',
      brand: 'All',
      bikeType: 'All',
      fuelType: 'All',
      transmission: 'All',
      sort: 'newest',
    };
    setFilters(defaultFilters);
    syncUrlParams(defaultFilters);
  };

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      fetchBikes(filters);
      return;
    }

    const timer = setTimeout(() => {
      fetchBikes(filters);
    }, 250);

    return () => clearTimeout(timer);
  }, [filters, fetchBikes]);

  return (
    <div className={styles.pageWrapper}>
      <Navbar onOpenTestRide={() => setIsTestRideOpen(true)} />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Header */}
          <header className={styles.pageHeader}>
            <div className={styles.headerTop}>
              <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
                <Link href="/" className={styles.breadcrumbLink}>
                  Home
                </Link>
                <span className={styles.breadcrumbSep}>/</span>
                <span className={styles.breadcrumbCurrent}>Motorcycle Inventory</span>
              </nav>

              <span className="eyebrow-badge" style={{ padding: '0.25rem 0.65rem' }}>
                120-Point Mechanical Audit
              </span>
            </div>

            <div className={styles.titleArea}>
              <h1 className={styles.headline}>
                Find Your <em>Next Motorcycle</em>
              </h1>
              <p className={styles.subheadline}>
                Explore our strictly curated collection of verified pre-owned motorcycles. Every two-wheeler has
                passed our 120-point mechanical, electrical, and chassis inspection with verified single-owner
                lineage.
              </p>
            </div>

            {/* Trust Strip */}
            <div className={styles.trustStrip}>
              <div className={styles.trustItem}>
                <svg className={styles.trustIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>120-Point Audit Certified</span>
              </div>
              <div className={styles.trustItem}>
                <svg className={styles.trustIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
                <span>7-Day Exchange Guarantee</span>
              </div>
              <div className={styles.trustItem}>
                <svg className={styles.trustIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                <span>6-Month Powertrain Warranty</span>
              </div>
              <div className={styles.trustItem}>
                <svg className={styles.trustIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span>Doorstep Test Ride Available</span>
              </div>
            </div>
          </header>

          {/* Filter & Grid Layout */}
          <div className={styles.inventoryLayout}>
            <BikeFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              totalResults={total}
              availableBrands={availableBrands.length ? availableBrands : undefined}
              availableBikeTypes={availableBikeTypes.length ? availableBikeTypes : undefined}
              availableFuelTypes={availableFuelTypes.length ? availableFuelTypes : undefined}
            />

            <BikeGrid
              bikes={bikes}
              loading={loading}
              error={error}
              onResetFilters={handleResetFilters}
              featuredFirstWide={true}
            />
          </div>
        </div>
      </main>

      <Footer />

      <TestRideModal
        isOpen={isTestRideOpen}
        onClose={() => setIsTestRideOpen(false)}
        bike={selectedTestRideBike}
      />
    </div>
  );
}

export default function BikesPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: 'var(--font-family-display)', fontSize: '1.25rem', fontWeight: 600, color: '#1A1A1A' }}>
            Loading Torque Two-Wheelers Showroom...
          </p>
        </div>
      }
    >
      <BikesInventoryContent />
    </Suspense>
  );
}
