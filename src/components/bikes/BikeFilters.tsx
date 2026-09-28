'use client';

import React from 'react';
import styles from './BikeFilters.module.css';

export interface BikeFilterState {
  search: string;
  brand: string;
  bikeType: string;
  fuelType: string;
  transmission: string;
  sort: string;
}

interface BikeFiltersProps {
  filters: BikeFilterState;
  onFilterChange: (key: keyof BikeFilterState, value: string) => void;
  onResetFilters: () => void;
  totalResults: number;
  availableBrands?: string[];
  availableBikeTypes?: string[];
  availableFuelTypes?: string[];
}

export const BikeFilters: React.FC<BikeFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
  availableBrands = ['Royal Enfield', 'Bajaj', 'Yamaha', 'TVS', 'Honda', 'Hero', 'KTM'],
  availableBikeTypes = ['Street / Naked', 'Cruiser', 'Commuter', 'Sports', 'Scooter', 'Adventure'],
  availableFuelTypes = ['Petrol', 'Electric'],
}) => {
  return (
    <div className={styles.filtersContainer}>
      {/* Search Input Bar */}
      <div className={styles.searchRow}>
        <div className={styles.searchInputWrapper}>
          <svg
            className={styles.searchIcon}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by model, brand, or cc (e.g. Hunter 350, Pulsar, Classic)..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Select Filter Group Grid */}
      <div className={styles.filterGroupGrid}>
        {/* Brand */}
        <div className={styles.filterItem}>
          <label className={styles.label}>Make / Brand</label>
          <select
            value={filters.brand}
            onChange={(e) => onFilterChange('brand', e.target.value)}
            className={styles.select}
          >
            <option value="All">All Brands</option>
            {availableBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Bike Type */}
        <div className={styles.filterItem}>
          <label className={styles.label}>Motorcycle Category</label>
          <select
            value={filters.bikeType}
            onChange={(e) => onFilterChange('bikeType', e.target.value)}
            className={styles.select}
          >
            <option value="All">All Categories</option>
            {availableBikeTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Fuel Type */}
        <div className={styles.filterItem}>
          <label className={styles.label}>Powertrain</label>
          <select
            value={filters.fuelType}
            onChange={(e) => onFilterChange('fuelType', e.target.value)}
            className={styles.select}
          >
            <option value="All">All Fuels</option>
            {availableFuelTypes.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Transmission */}
        <div className={styles.filterItem}>
          <label className={styles.label}>Transmission</label>
          <select
            value={filters.transmission}
            onChange={(e) => onFilterChange('transmission', e.target.value)}
            className={styles.select}
          >
            <option value="All">All Transmissions</option>
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic / CVT</option>
          </select>
        </div>

        {/* Sort */}
        <div className={styles.filterItem}>
          <label className={styles.label}>Sort By</label>
          <select
            value={filters.sort}
            onChange={(e) => onFilterChange('sort', e.target.value)}
            className={styles.select}
          >
            <option value="newest">Recently Added</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="km_asc">Kilometers: Lowest First</option>
            <option value="engine_desc">Displacement: Highest CC</option>
          </select>
        </div>
      </div>

      {/* Footer Info & Reset Action */}
      <div className={styles.filterFooter}>
        <span className={styles.resultsCount}>
          Showing <strong>{totalResults}</strong> certified {totalResults === 1 ? 'motorcycle' : 'motorcycles'}
        </span>
        <button type="button" onClick={onResetFilters} className={styles.resetBtn}>
          Clear All Filters
        </button>
      </div>
    </div>
  );
};

export default BikeFilters;
