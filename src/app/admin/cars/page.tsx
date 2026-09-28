'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './AdminCars.module.css';
import { ICarDocument } from '@/models/Car';

interface CarFormData {
  _id?: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  price: number;
  fuelType: string;
  transmission: string;
  kilometers: number;
  bodyType: string;
  color: string;
  ownership: string;
  location: string;
  description: string;
  features: string;
  images: string[];
  featured: boolean;
  status: string;
}

const DEFAULT_FORM: CarFormData = {
  brand: '',
  model: '',
  variant: '',
  year: new Date().getFullYear(),
  price: 2500000,
  fuelType: 'Petrol',
  transmission: 'Automatic',
  kilometers: 15000,
  bodyType: 'SUV',
  color: 'Pearl White',
  ownership: '1st Owner',
  location: 'Mumbai Studio (BKC)',
  description: 'Meticulously maintained, verified single-owner automobile in immaculate mechanical and aesthetic condition.',
  features: 'Panoramic Sunroof, Ventilated Seats, ADAS Level 2, 360 Camera, Wireless CarPlay',
  images: ['/images/inventory/xuv700_hero.jpg'],
  featured: false,
  status: 'Available',
};

export default function AdminCarsPage() {
  const [cars, setCars] = useState<ICarDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CarFormData>(DEFAULT_FORM);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Fetch cars
  const fetchCars = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (brandFilter !== 'all') params.set('brand', brandFilter);

      const res = await fetch(`/api/admin/cars?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setCars(json.data || []);
      }
    } catch (err) {
      console.error('Error fetching admin cars:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, brandFilter]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // Extract distinct brands from list
  const availableBrands = Array.from(new Set(cars.map((c) => c.brand))).filter(Boolean).sort();

  // Open Add Car Modal
  const handleOpenAddModal = () => {
    setEditingCarId(null);
    setFormData(DEFAULT_FORM);
    setNewImageUrl('');
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open Edit Car Modal
  const handleOpenEditModal = (car: ICarDocument) => {
    setEditingCarId(car._id);
    setFormData({
      _id: car._id,
      brand: car.brand || '',
      model: car.model || '',
      variant: car.variant || '',
      year: car.year || new Date().getFullYear(),
      price: car.price || 0,
      fuelType: car.fuelType || 'Petrol',
      transmission: car.transmission || 'Automatic',
      kilometers: car.kilometers || 0,
      bodyType: car.bodyType || 'SUV',
      color: car.color || '',
      ownership: car.ownership || '1st Owner',
      location: car.location || '',
      description: car.description || '',
      features: Array.isArray(car.features) ? car.features.join(', ') : '',
      images: car.images && car.images.length > 0 ? car.images : ['/images/inventory/xuv700_hero.jpg'],
      featured: Boolean(car.featured),
      status: car.status || 'Available',
    });
    setNewImageUrl('');
    setModalError(null);
    setIsModalOpen(true);
  };

  // Image helpers
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, newImageUrl.trim()],
    }));
    setNewImageUrl('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (formData.images.length <= 1) {
      alert('A vehicle must have at least one image.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== indexToRemove),
    }));
  };

  const handleSetMainImage = (indexToMain: number) => {
    const list = [...formData.images];
    const [selected] = list.splice(indexToMain, 1);
    list.unshift(selected);
    setFormData((prev) => ({ ...prev, images: list }));
  };

  // Save Form (Create / Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setModalError(null);

    try {
      const payload = {
        ...formData,
        features: formData.features
          .split(',')
          .map((f) => f.trim())
          .filter(Boolean),
      };

      const url = editingCarId
        ? `/api/admin/cars/${editingCarId}`
        : '/api/admin/cars';
      const method = editingCarId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save vehicle');
      }

      setIsModalOpen(false);
      fetchCars();
    } catch (err: any) {
      setModalError(err.message || 'Error saving vehicle to database');
    } finally {
      setSaving(false);
    }
  };

  // Quick toggle status (Available <-> Sold)
  const handleToggleStatus = async (car: ICarDocument) => {
    const newStatus = car.status === 'Available' ? 'Sold' : 'Available';
    try {
      const res = await fetch(`/api/admin/cars/${car._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchCars();
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  // Safe Archive or Delete
  const handleArchive = async (car: ICarDocument) => {
    const confirmMsg = `Archive "${car.year} ${car.brand} ${car.model}"? It will no longer appear in public inventory, but all existing customer enquiries/test drives will be preserved.`;
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/admin/cars/${car._id}?action=archive`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchCars();
      }
    } catch (err) {
      console.error('Archive failed:', err);
    }
  };

  const formatPriceLakhs = (price: number) => {
    return `₹${(price / 100000).toFixed(2)} Lakh`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return <span className={`${styles.statusBadge} ${styles.statusAvailable}`}>Available</span>;
      case 'Sold':
        return <span className={`${styles.statusBadge} ${styles.statusSold}`}>Sold</span>;
      case 'Reserved':
        return <span className={`${styles.statusBadge} ${styles.statusReserved}`}>Reserved</span>;
      case 'Archived':
        return <span className={`${styles.statusBadge} ${styles.statusArchived}`}>Archived</span>;
      default:
        return <span className={styles.statusBadge}>{status}</span>;
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Vehicle Inventory</h1>
          <p className={styles.pageSubtitle}>
            Add, update, curate images, and manage availability of your automotive collection
          </p>
        </div>

        <button onClick={handleOpenAddModal} className={styles.addBtn} type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchGroup}>
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
              placeholder="Search by brand, model, variant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.filterSelects}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.select}
          >
            <option value="all">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Sold">Sold</option>
            <option value="Reserved">Reserved</option>
            <option value="Archived">Archived</option>
          </select>

          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className={styles.select}
          >
            <option value="all">All Brands</option>
            {availableBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.inventoryTable}>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Price</th>
                <th>Year</th>
                <th>Status</th>
                <th>Featured</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    Loading vehicle inventory...
                  </td>
                </tr>
              ) : cars.length > 0 ? (
                cars.map((car) => {
                  const primaryImage =
                    car.images && car.images.length > 0
                      ? car.images[0]
                      : '/images/inventory/xuv700_hero.jpg';

                  return (
                    <tr key={car._id}>
                      <td>
                        <div className={styles.carCell}>
                          <Image
                            src={primaryImage}
                            alt={car.title || car.model}
                            width={64}
                            height={44}
                            className={styles.carThumbnail}
                            unoptimized
                          />
                          <div className={styles.carMeta}>
                            <span className={styles.carTitle}>
                              {car.brand} {car.model} {car.variant}
                            </span>
                            <span className={styles.carSpecs}>
                              <span>{car.kilometers.toLocaleString()} km</span>
                              <span>•</span>
                              <span>{car.fuelType}</span>
                              <span>•</span>
                              <span>{car.transmission}</span>
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={styles.priceCell}>{formatPriceLakhs(car.price)}</span>
                      </td>
                      <td>{car.year}</td>
                      <td>{getStatusBadge(car.status)}</td>
                      <td>
                        {car.featured ? (
                          <span className={styles.featuredBadge}>
                            ★ Featured
                          </span>
                        ) : (
                          <span style={{ color: '#475569', fontSize: '0.8rem' }}>—</span>
                        )}
                      </td>
                      <td>
                        <div className={styles.actionsCell}>
                          <button
                            onClick={() => handleOpenEditModal(car)}
                            className={styles.actionBtn}
                            title="Edit Vehicle Details"
                            type="button"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            <span>Edit</span>
                          </button>

                          <Link
                            href={`/cars/${car.slug || car._id}`}
                            target="_blank"
                            className={styles.actionBtn}
                            title="View Public Listing"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            <span>View</span>
                          </Link>

                          <button
                            onClick={() => handleToggleStatus(car)}
                            className={`${styles.actionBtn} ${styles.actionBtnSold}`}
                            title={car.status === 'Available' ? 'Mark as Sold' : 'Mark as Available'}
                            type="button"
                          >
                            <span>{car.status === 'Available' ? 'Mark Sold' : 'Make Available'}</span>
                          </button>

                          {car.status !== 'Archived' && (
                            <button
                              onClick={() => handleArchive(car)}
                              className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                              title="Archive Vehicle"
                              type="button"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                              <span>Archive</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    No vehicles found matching current search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Vehicle Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingCarId ? 'Edit Vehicle Listing' : 'Add New Curated Vehicle'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className={styles.closeBtn}
                type="button"
                aria-label="Close modal"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitForm}>
              <div className={styles.modalBody}>
                {modalError && (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#f87171',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                    }}
                  >
                    {modalError}
                  </div>
                )}

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Brand *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mercedes-Benz"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Model *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. C-Class"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Variant</label>
                    <input
                      type="text"
                      placeholder="e.g. C 220d AMG Line"
                      value={formData.variant}
                      onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Year *</label>
                    <input
                      type="number"
                      required
                      min={2000}
                      max={2030}
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Price (₹ INR) *</label>
                    <input
                      type="number"
                      required
                      min={100000}
                      step={50000}
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Fuel Type *</label>
                    <select
                      value={formData.fuelType}
                      onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                      className={styles.input}
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="CNG">CNG</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Transmission *</label>
                    <select
                      value={formData.transmission}
                      onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                      className={styles.input}
                    >
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Kilometers *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.kilometers}
                      onChange={(e) => setFormData({ ...formData, kilometers: Number(e.target.value) })}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Body Type *</label>
                    <select
                      value={formData.bodyType}
                      onChange={(e) => setFormData({ ...formData, bodyType: e.target.value })}
                      className={styles.input}
                    >
                      <option value="SUV">SUV</option>
                      <option value="Sedan">Sedan</option>
                      <option value="Hatchback">Hatchback</option>
                      <option value="Crossover">Crossover</option>
                      <option value="Coupe">Coupe</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Color</label>
                    <input
                      type="text"
                      placeholder="e.g. Obsidian Black"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Ownership</label>
                    <input
                      type="text"
                      placeholder="e.g. 1st Owner"
                      value={formData.ownership}
                      onChange={(e) => setFormData({ ...formData, ownership: e.target.value })}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Showroom Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai Flagship Studio (BKC)"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className={styles.input}
                    >
                      <option value="Available">Available</option>
                      <option value="Sold">Sold</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>

                  <div className={styles.formGroup} style={{ justifyContent: 'center' }}>
                    <label className={styles.label} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        style={{ width: 18, height: 18, accentColor: '#c8a97e' }}
                      />
                      <span>Featured Vehicle Spotlight</span>
                    </label>
                  </div>
                </div>

                <div className={styles.formGroupFull}>
                  <label className={styles.label}>Description</label>
                  <textarea
                    rows={3}
                    placeholder="Editorial summary of condition, provenance, and luxury appointment..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={styles.textarea}
                  />
                </div>

                <div className={styles.formGroupFull}>
                  <label className={styles.label}>Features (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Panoramic Sunroof, 360 Camera, Burmester Audio, ADAS"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    className={styles.input}
                  />
                </div>

                {/* Image Management Section */}
                <div className={styles.imageSection}>
                  <label className={styles.label} style={{ color: '#c8a97e' }}>
                    Car Image Management (First image is primary thumbnail)
                  </label>

                  <div className={styles.imageInputRow}>
                    <input
                      type="text"
                      placeholder="Add Image URL (e.g. /images/inventory/car.jpg or remote URL)"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className={styles.input}
                    />
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className={styles.addImageBtn}
                    >
                      + Add Image
                    </button>
                  </div>

                  <div className={styles.imageGrid}>
                    {formData.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className={`${styles.imageCard} ${idx === 0 ? styles.imageCardMain : ''}`}
                      >
                        <Image
                          src={imgUrl}
                          alt={`Vehicle image ${idx + 1}`}
                          fill
                          className={styles.imagePreview}
                          unoptimized
                        />
                        {idx === 0 && <span className={styles.mainBadge}>Main</span>}

                        <div className={styles.imageActions}>
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetMainImage(idx)}
                              className={styles.imgActionBtn}
                            >
                              Make Main
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className={`${styles.imgActionBtn} ${styles.imgActionRemove}`}
                            title="Remove image"
                          >
                            ✕ Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={styles.saveBtn}
                >
                  {saving ? 'Saving...' : editingCarId ? 'Update Vehicle' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
