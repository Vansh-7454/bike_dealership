'use client';

import React from 'react';
import styles from './CarFilters.module.css';

export interface FilterState {
  search: string;
  brand: string;
  fuelType: string;
  transmission: string;
  bodyType: string;
  sort: string;
}

interface CarFiltersProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onResetFilters: () => void;
  totalResults: number;
  availableBrands?: string[];
  availableFuelTypes?: string[];
  availableBodyTypes?: string[];
}

export const CarFilters: React.FC<CarFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
  availableBrands = ['Hyundai', 'Mahindra', 'Kia', 'Tata', 'Honda', 'Maruti Suzuki', 'Toyota', 'Skoda', 'Volkswagen'],
  availableFuelTypes = ['Petrol', 'Diesel', 'Hybrid', 'Electric'],
  availableBodyTypes = ['SUV', 'Sedan', 'Crossover'],
}) => {
  const hasActiveFilters =
    Boolean(filters.search) ||
    filters.brand !== 'All' ||
    filters.fuelType !== 'All' ||
    filters.transmission !== 'All' ||
    filters.bodyType !== 'All' ||
    filters.sort !== 'newest';

  return (
    <div className={styles.filterSection}>
      {/* Search Input Row */}
      <div className={styles.searchRow}>
        <div className={styles.searchInputWrapper}>
          <svg
            className={styles.searchIcon}
            width="16"
            height="16"
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
            placeholder="Search by brand, model, or keyword (e.g. Creta, XUV700, Hybrid)..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className={styles.searchInput}
          />

          {filters.search && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={() => onFilterChange('search', '')}
              aria-label="Clear search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Filters Grid */}
      <div className={styles.dropdownGrid}>
        {/* Brand */}
        <div className={styles.selectGroup}>
          <label className={styles.selectLabel}>Make / Brand</label>
          <div className={styles.selectWrapper}>
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
            <svg className={styles.selectArrow} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* Fuel Type */}
        <div className={styles.selectGroup}>
          <label className={styles.selectLabel}>Powertrain / Fuel</label>
          <div className={styles.selectWrapper}>
            <select
              value={filters.fuelType}
              onChange={(e) => onFilterChange('fuelType', e.target.value)}
              className={styles.select}
            >
              <option value="All">All Fuel Types</option>
              {availableFuelTypes.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <svg className={styles.selectArrow} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* Transmission */}
        <div className={styles.selectGroup}>
          <label className={styles.selectLabel}>Transmission</label>
          <div className={styles.selectWrapper}>
            <select
              value={filters.transmission}
              onChange={(e) => onFilterChange('transmission', e.target.value)}
              className={styles.select}
            >
              <option value="All">All Transmissions</option>
              <option value="Automatic">Automatic (DCT / IVT / AT)</option>
              <option value="Manual">Manual</option>
            </select>
            <svg className={styles.selectArrow} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* Body Type */}
        <div className={styles.selectGroup}>
          <label className={styles.selectLabel}>Body Type</label>
          <div className={styles.selectWrapper}>
            <select
              value={filters.bodyType}
              onChange={(e) => onFilterChange('bodyType', e.target.value)}
              className={styles.select}
            >
              <option value="All">All Body Types</option>
              {availableBodyTypes.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <svg className={styles.selectArrow} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* Sorting */}
        <div className={styles.selectGroup}>
          <label className={styles.selectLabel}>Sort By</label>
          <div className={styles.selectWrapper}>
            <select
              value={filters.sort}
              onChange={(e) => onFilterChange('sort', e.target.value)}
              className={styles.select}
            >
              <option value="newest">Newest Additions</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="km_asc">Kilometers: Low to High</option>
              <option value="year_desc">Model Year: New to Old</option>
            </select>
            <svg className={styles.selectArrow} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Active Filter Tags & Reset Bar */}
      <div className={styles.activeTagsBar}>
        <div className={styles.resultsCount}>
          Showing <strong>{totalResults}</strong> certified vehicles
        </div>

        {hasActiveFilters && (
          <div className={styles.tagsGroup}>
            {filters.search && (
              <span className={styles.tagPill}>
                &ldquo;{filters.search}&rdquo;
                <button
                  type="button"
                  className={styles.tagRemoveBtn}
                  onClick={() => onFilterChange('search', '')}
                >
                  ✕
                </button>
              </span>
            )}

            {filters.brand !== 'All' && (
              <span className={styles.tagPill}>
                Brand: {filters.brand}
                <button
                  type="button"
                  className={styles.tagRemoveBtn}
                  onClick={() => onFilterChange('brand', 'All')}
                >
                  ✕
                </button>
              </span>
            )}

            {filters.fuelType !== 'All' && (
              <span className={styles.tagPill}>
                Fuel: {filters.fuelType}
                <button
                  type="button"
                  className={styles.tagRemoveBtn}
                  onClick={() => onFilterChange('fuelType', 'All')}
                >
                  ✕
                </button>
              </span>
            )}

            {filters.transmission !== 'All' && (
              <span className={styles.tagPill}>
                {filters.transmission}
                <button
                  type="button"
                  className={styles.tagRemoveBtn}
                  onClick={() => onFilterChange('transmission', 'All')}
                >
                  ✕
                </button>
              </span>
            )}

            {filters.bodyType !== 'All' && (
              <span className={styles.tagPill}>
                {filters.bodyType}
                <button
                  type="button"
                  className={styles.tagRemoveBtn}
                  onClick={() => onFilterChange('bodyType', 'All')}
                >
                  ✕
                </button>
              </span>
            )}

            <button type="button" className={styles.resetBtn} onClick={onResetFilters}>
              Reset All
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarFilters;
