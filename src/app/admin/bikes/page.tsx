'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './AdminBikes.module.css';
import { IBike } from '@/types';

interface BikeFormData {
  _id?: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  price: number;
  fuelType: 'Petrol' | 'Electric';
  transmission: 'Manual' | 'Automatic';
  kilometers: number;
  bikeType: 'Commuter' | 'Naked / Roadster' | 'Cruiser' | 'Sport' | 'Adventure' | 'Scooter';
  engineCC: number;
  mileage: number;
  color: string;
  ownership: string;
  location: string;
  description: string;
  features: string;
  images: string[];
  featured: boolean;
  status: 'Available' | 'Sold' | 'Archived';
}

const DEFAULT_FORM: BikeFormData = {
  brand: '',
  model: '',
  variant: '',
  year: new Date().getFullYear(),
  price: 150000,
  fuelType: 'Petrol',
  transmission: 'Manual',
  kilometers: 8500,
  bikeType: 'Naked / Roadster',
  engineCC: 350,
  mileage: 36,
  color: 'Dapper Ash',
  ownership: '1st Owner',
  location: 'Bengaluru Studio (Indiranagar)',
  description: 'Certified pre-owned motorcycle with zero accident history, fresh brake pads, verified chain tension, and full service documentation.',
  features: 'Dual-Channel ABS, Digital Console, USB Charging Port, Tripper Navigation Pod',
  images: ['/images/bikes/hunter_350_hero.jpg'],
  featured: false,
  status: 'Available',
};

export default function AdminBikesPage() {
  const [bikes, setBikes] = useState<IBike[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBikeId, setEditingBikeId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BikeFormData>(DEFAULT_FORM);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Fetch bikes
  const fetchBikes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (brandFilter !== 'all') params.set('brand', brandFilter);

      const res = await fetch(`/api/admin/bikes?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setBikes(json.data || []);
      }
    } catch (err) {
      console.error('Error fetching admin bikes:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, brandFilter]);

  useEffect(() => {
    fetchBikes();
  }, [fetchBikes]);

  // Extract distinct brands
  const availableBrands = Array.from(new Set(bikes.map((b) => b.brand))).filter(Boolean).sort();

  // Open Add Bike Modal
  const handleOpenAddModal = () => {
    setEditingBikeId(null);
    setFormData(DEFAULT_FORM);
    setNewImageUrl('');
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open Edit Bike Modal
  const handleOpenEditModal = (bike: IBike) => {
    setEditingBikeId(bike._id || null);
    setFormData({
      _id: bike._id,
      brand: bike.brand,
      model: bike.model,
      variant: bike.variant || '',
      year: bike.year,
      price: bike.price,
      fuelType: bike.fuelType as any,
      transmission: bike.transmission as any,
      kilometers: bike.kilometers,
      bikeType: bike.bikeType as any,
      engineCC: bike.engineCC || 350,
      mileage: bike.mileage || 35,
      color: bike.color,
      ownership: bike.ownership,
      location: bike.location,
      description: bike.description,
      features: Array.isArray(bike.features) ? bike.features.join(', ') : '',
      images: bike.images && bike.images.length > 0 ? bike.images : ['/images/bikes/hunter_350_hero.jpg'],
      featured: bike.featured || false,
      status: (bike.status === 'Sold' ? 'Sold' : bike.status === 'Archived' ? 'Archived' : 'Available'),
    });
    setNewImageUrl('');
    setModalError(null);
    setIsModalOpen(true);
  };

  // Save (Create or Update)
  const handleSaveBike = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setModalError(null);

    try {
      const payload = {
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        variant: formData.variant.trim(),
        year: Number(formData.year),
        price: Number(formData.price),
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        kilometers: Number(formData.kilometers),
        bikeType: formData.bikeType,
        engineCC: Number(formData.engineCC),
        mileage: Number(formData.mileage),
        color: formData.color.trim(),
        ownership: formData.ownership.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        features: formData.features
          .split(',')
          .map((f) => f.trim())
          .filter(Boolean),
        images: formData.images.filter(Boolean),
        featured: Boolean(formData.featured),
        status: formData.status,
      };

      const url = editingBikeId ? `/api/admin/bikes/${editingBikeId}` : '/api/admin/bikes';
      const method = editingBikeId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save motorcycle record');
      }

      setIsModalOpen(false);
      fetchBikes();
    } catch (err: any) {
      setModalError(err.message || 'Error occurred while saving motorcycle');
    } finally {
      setSaving(false);
    }
  };

  // Delete Bike
  const handleDeleteBike = async (bikeId: string, bikeTitle: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${bikeTitle}" from inventory?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/bikes/${bikeId}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        setBikes((prev) => prev.filter((b) => b._id !== bikeId));
      } else {
        alert(json.error || 'Failed to delete motorcycle');
      }
    } catch (err) {
      console.error('Error deleting bike:', err);
      alert('Network error while deleting motorcycle');
    }
  };

  // Add Image URL to form
  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()],
      }));
      setNewImageUrl('');
    }
  };

  // Remove Image from form
  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const formatPrice = (val: number) => {
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakh`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return styles.badgeAvailable;
      case 'Sold':
        return styles.badgeSold;
      case 'Archived':
        return styles.badgeReserved;
      default:
        return styles.badgeAvailable;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Motorcycle Inventory Management</h1>
          <p className={styles.pageSubtitle}>
            Certified pre-owned motorcycles in Torque Two-Wheelers inventory
          </p>
        </div>

        <button onClick={handleOpenAddModal} className={styles.addBtn} type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Add Motorcycle</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by brand, model or variant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          {search && (
            <button onClick={() => setSearch('')} className={styles.clearSearchBtn}>
              ✕
            </button>
          )}
        </div>

        <div className={styles.filterGroup}>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className={styles.selectFilter}
          >
            <option value="all">All Brands</option>
            {availableBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.selectFilter}
          >
            <option value="all">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Sold">Sold</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Motorcycle</th>
                <th>Specifications</th>
                <th>Price</th>
                <th>Type & CC</th>
                <th>Status</th>
                <th>Featured</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    Loading motorcycle catalog...
                  </td>
                </tr>
              ) : bikes.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    No motorcycles found matching current filters.
                  </td>
                </tr>
              ) : (
                bikes.map((bike) => (
                  <tr key={bike._id}>
                    <td>
                      <div className={styles.bikeIdentity}>
                        <div className={styles.bikeThumbnail}>
                          <Image
                            src={bike.images?.[0] || '/images/bikes/hunter_350_hero.jpg'}
                            alt={bike.title}
                            fill
                            className={styles.thumbnailImg}
                          />
                        </div>
                        <div className={styles.bikeDetails}>
                          <span className={styles.bikeTitle}>{bike.title}</span>
                          <span className={styles.bikeSub}>
                            {bike.year} • {bike.ownership}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className={styles.specsCell}>
                        <span>{bike.kilometers.toLocaleString('en-IN')} km</span>
                        <span className={styles.specSub}>
                          {bike.fuelType} • {bike.transmission}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className={styles.priceCell}>
                        <span className={styles.pricePrimary}>{formatPrice(bike.price)}</span>
                      </div>
                    </td>

                    <td>
                      <div className={styles.bodyTypeCell}>
                        <span>{bike.bikeType}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{bike.engineCC} cc</span>
                      </div>
                    </td>

                    <td>
                      <span className={`${styles.badge} ${getStatusBadge(bike.status)}`}>
                        {bike.status}
                      </span>
                    </td>

                    <td>
                      {bike.featured ? (
                        <span className={styles.featuredBadge}>★ Featured</span>
                      ) : (
                        <span className={styles.notFeatured}>—</span>
                      )}
                    </td>

                    <td>
                      <div className={styles.actionButtons}>
                        <Link
                          href={`/bikes/${bike._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.iconBtn}
                          title="View on Public Website"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </Link>

                        <button
                          onClick={() => handleOpenEditModal(bike)}
                          className={styles.iconBtn}
                          title="Edit Motorcycle"
                          type="button"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => handleDeleteBike(bike._id!, bike.title)}
                          className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
                          title="Delete Motorcycle"
                          type="button"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Motorcycle Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingBikeId ? 'Edit Motorcycle Details' : 'Add New Motorcycle'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className={styles.modalCloseBtn}
                type="button"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className={styles.modalAlert}>
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveBike} className={styles.modalForm}>
              <div className={styles.formSection}>
                <h3 className={styles.sectionHeading}>Basic Information</h3>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Brand *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royal Enfield"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Model *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hunter 350"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Variant</label>
                    <input
                      type="text"
                      placeholder="e.g. Dapper Edition"
                      value={formData.variant}
                      onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Manufacturing Year *</label>
                    <input
                      type="number"
                      required
                      min={2010}
                      max={2027}
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Selling Price (₹ INR) *</label>
                    <input
                      type="number"
                      required
                      min={10000}
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Kilometers Clocked *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.kilometers}
                      onChange={(e) => setFormData({ ...formData, kilometers: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.sectionHeading}>Motorcycle Specifications</h3>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Bike Category *</label>
                    <select
                      value={formData.bikeType}
                      onChange={(e) => setFormData({ ...formData, bikeType: e.target.value as any })}
                    >
                      <option value="Commuter">Commuter</option>
                      <option value="Naked / Roadster">Naked / Roadster</option>
                      <option value="Cruiser">Cruiser</option>
                      <option value="Sport">Sport</option>
                      <option value="Adventure">Adventure</option>
                      <option value="Scooter">Scooter</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Engine Displacement (CC) *</label>
                    <input
                      type="number"
                      required
                      min={50}
                      max={2500}
                      value={formData.engineCC}
                      onChange={(e) => setFormData({ ...formData, engineCC: Number(e.target.value) })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Mileage (kmpl)</label>
                    <input
                      type="number"
                      min={5}
                      max={100}
                      value={formData.mileage}
                      onChange={(e) => setFormData({ ...formData, mileage: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Fuel Type *</label>
                    <select
                      value={formData.fuelType}
                      onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as any })}
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Transmission *</label>
                    <select
                      value={formData.transmission}
                      onChange={(e) => setFormData({ ...formData, transmission: e.target.value as any })}
                    >
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Color</label>
                    <input
                      type="text"
                      placeholder="e.g. Matte Black"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Ownership</label>
                    <input
                      type="text"
                      placeholder="e.g. 1st Owner"
                      value={formData.ownership}
                      onChange={(e) => setFormData({ ...formData, ownership: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Studio Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Bengaluru Studio (Indiranagar)"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    >
                      <option value="Available">Available</option>
                      <option value="Sold">Sold</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.sectionHeading}>Details & Imagery</h3>
                <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Features (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Dual-Channel ABS, Digital Console, USB Port..."
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Images</label>
                  <div className={styles.imageUrlRow}>
                    <input
                      type="text"
                      placeholder="Paste image URL (e.g. /images/bikes/hunter_350_hero.jpg)"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                    />
                    <button type="button" onClick={handleAddImage} className={styles.addImageBtn}>
                      Add Image
                    </button>
                  </div>

                  <div className={styles.imageThumbnailsGrid}>
                    {formData.images.map((img, idx) => (
                      <div key={idx} className={styles.imageThumbnailCard}>
                        <div className={styles.thumbWrapper}>
                          <Image src={img} alt={`Bike Preview ${idx + 1}`} fill className={styles.thumbImg} />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className={styles.removeImageBtn}
                          title="Remove image"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    <span>Highlight as Featured Showcase Motorcycle on Homepage</span>
                  </label>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={styles.cancelBtn}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? 'Saving Motorcycle...' : editingBikeId ? 'Update Motorcycle' : 'Create Motorcycle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
