'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './CarsPage.module.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CarFilters, FilterState } from '@/components/cars/CarFilters';
import { CarGrid } from '@/components/cars/CarGrid';
import { TestDriveModal } from '@/components/common/TestDriveModal';
import { ICarDocument } from '@/models/Car';

function CarsInventoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial query params from URL
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    brand: searchParams.get('brand') || 'All',
    fuelType: searchParams.get('fuelType') || 'All',
    transmission: searchParams.get('transmission') || 'All',
    bodyType: searchParams.get('bodyType') || 'All',
    sort: searchParams.get('sort') || 'newest',
  });

  const [cars, setCars] = useState<ICarDocument[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Available filter options dynamically populated from database
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableFuelTypes, setAvailableFuelTypes] = useState<string[]>([]);
  const [availableBodyTypes, setAvailableBodyTypes] = useState<string[]>([]);

  // Test drive modal state
  const [isTestDriveOpen, setIsTestDriveOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedTestDriveCar, setSelectedTestDriveCar] = useState<any>(null);

  // Fetch cars from API
  const fetchCars = useCallback(async (currentFilters: FilterState) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (currentFilters.search.trim()) params.set('search', currentFilters.search.trim());
      if (currentFilters.brand !== 'All') params.set('brand', currentFilters.brand);
      if (currentFilters.fuelType !== 'All') params.set('fuelType', currentFilters.fuelType);
      if (currentFilters.transmission !== 'All') params.set('transmission', currentFilters.transmission);
      if (currentFilters.bodyType !== 'All') params.set('bodyType', currentFilters.bodyType);
      if (currentFilters.sort) params.set('sort', currentFilters.sort);
      params.set('limit', '18');

      const res = await fetch(`/api/cars?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch inventory (status: ${res.status})`);
      }

      const data = await res.json();
      setCars(data.cars || []);
      setTotal(data.total || 0);

      if (data.brands?.length) setAvailableBrands(data.brands);
      if (data.fuelTypes?.length) setAvailableFuelTypes(data.fuelTypes);
      if (data.bodyTypes?.length) setAvailableBodyTypes(data.bodyTypes);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while loading cars';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update URL search parameters when filters change
  const syncUrlParams = useCallback(
    (newFilters: FilterState) => {
      const params = new URLSearchParams();
      if (newFilters.search.trim()) params.set('search', newFilters.search.trim());
      if (newFilters.brand !== 'All') params.set('brand', newFilters.brand);
      if (newFilters.fuelType !== 'All') params.set('fuelType', newFilters.fuelType);
      if (newFilters.transmission !== 'All') params.set('transmission', newFilters.transmission);
      if (newFilters.bodyType !== 'All') params.set('bodyType', newFilters.bodyType);
      if (newFilters.sort !== 'newest') params.set('sort', newFilters.sort);

      const queryString = params.toString();
      const newPath = queryString ? `/cars?${queryString}` : '/cars';
      router.push(newPath, { scroll: false });
    },
    [router]
  );

  // Handle single filter change
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    syncUrlParams(updated);
  };

  // Reset all filters
  const handleResetFilters = () => {
    const defaultFilters: FilterState = {
      search: '',
      brand: 'All',
      fuelType: 'All',
      transmission: 'All',
      bodyType: 'All',
      sort: 'newest',
    };
    setFilters(defaultFilters);
    syncUrlParams(defaultFilters);
  };

  // Debounced/triggered fetch when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCars(filters);
    }, 250);

    return () => clearTimeout(timer);
  }, [filters, fetchCars]);

  return (
    <div className={styles.pageWrapper}>
      <Navbar onOpenTestDrive={() => setIsTestDriveOpen(true)} />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Editorial Header */}
          <header className={styles.pageHeader}>
            <div className={styles.headerTop}>
              <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
                <Link href="/" className={styles.breadcrumbLink}>
                  Home
                </Link>
                <span className={styles.breadcrumbSep}>/</span>
                <span className={styles.breadcrumbCurrent}>Inventory Showroom</span>
              </nav>

              <span className="eyebrow-badge" style={{ padding: '0.25rem 0.65rem' }}>
                100% Audited Provenance
              </span>
            </div>

            <div className={styles.titleArea}>
              <h1 className={styles.headline}>
                Find Your <em>Next Vehicle</em>
              </h1>
              <p className={styles.subheadline}>
                Explore our strictly curated collection of verified pre-owned automobiles. Every vehicle has
                passed our 160-point structural, mechanical, and electronic audit with guaranteed single-owner
                pedigree.
              </p>
            </div>

            {/* Value Trust Strip */}
            <div className={styles.trustStrip}>
              <div className={styles.trustItem}>
                <svg className={styles.trustIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>160-Point Audit Certified</span>
              </div>
              <div className={styles.trustItem}>
                <svg className={styles.trustIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
                <span>7-Day Money Back / Exchange</span>
              </div>
              <div className={styles.trustItem}>
                <svg className={styles.trustIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                <span>1-Year Comprehensive Warranty</span>
              </div>
              <div className={styles.trustItem}>
                <svg className={styles.trustIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span>Direct Home Doorstep Delivery</span>
              </div>
            </div>
          </header>

          {/* Filter & Cars Grid Section */}
          <div className={styles.inventoryLayout}>
            <CarFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              totalResults={total}
              availableBrands={availableBrands.length ? availableBrands : undefined}
              availableFuelTypes={availableFuelTypes.length ? availableFuelTypes : undefined}
              availableBodyTypes={availableBodyTypes.length ? availableBodyTypes : undefined}
            />

            <CarGrid
              cars={cars}
              loading={loading}
              error={error}
              onResetFilters={handleResetFilters}
              featuredFirstWide={true}
            />
          </div>
        </div>
      </main>

      <Footer />

      <TestDriveModal
        isOpen={isTestDriveOpen}
        onClose={() => setIsTestDriveOpen(false)}
        car={selectedTestDriveCar}
      />
    </div>
  );
}

export default function CarsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#1A1A1A' }}>
              Loading Aureus Showroom...
            </p>
          </div>
        </div>
      }
    >
      <CarsInventoryContent />
    </Suspense>
  );
}
