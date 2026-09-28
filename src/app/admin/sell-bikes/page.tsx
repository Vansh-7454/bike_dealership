'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './AdminSellBikes.module.css';
import { ISellBikeDocument, SellBikeStatus } from '@/models/SellBikeRequest';

export default function AdminSellBikesPage() {
  const [sellRequests, setSellRequests] = useState<ISellBikeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<ISellBikeDocument | null>(null);

  const fetchSellRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/sell-bikes?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setSellRequests(json.requests || []);
      }
    } catch (err) {
      console.error('Error fetching sell bike requests:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchSellRequests();
  }, [fetchSellRequests]);

  const handleStatusChange = async (id: string, newStatus: SellBikeStatus) => {
    try {
      const res = await fetch('/api/admin/sell-bikes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        setSellRequests((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
        );
        if (selectedRequest && selectedRequest._id === id) {
          setSelectedRequest({ ...selectedRequest, status: newStatus });
        }
      }
    } catch (err) {
      console.error('Failed to update sell bike request status:', err);
    }
  };

  const formatDate = (isoStr?: string | Date) => {
    if (!isoStr) return '—';
    try {
      return new Date(isoStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(isoStr);
    }
  };

  const formatPrice = (val?: number | null) => {
    if (!val || isNaN(val)) return 'Not Specified';
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakh`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const getStatusClass = (status: SellBikeStatus) => {
    switch (status) {
      case 'New':
        return styles.statusPending;
      case 'Contacted':
        return styles.statusInspected;
      case 'Closed':
        return styles.statusPurchased;
      default:
        return '';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Sell Bike Appraisal Requests</h1>
          <p className={styles.pageSubtitle}>
            Manage owner motorcycle submissions, inspection scheduling, and procurement offers
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by owner name, phone, city, or motorcycle title..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.selectFilter}
          >
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Owner Details</th>
                <th>Motorcycle Specification</th>
                <th>Expected Valuation</th>
                <th>Date Received</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    Loading sell bike submissions...
                  </td>
                </tr>
              ) : sellRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    No sell bike requests found matching criteria.
                  </td>
                </tr>
              ) : (
                sellRequests.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div className={styles.customerCell}>
                        <span className={styles.customerName}>{r.ownerName}</span>
                        <span className={styles.customerPhone}>{r.phone}</span>
                        <span className={styles.customerEmail}>{r.location}</span>
                      </div>
                    </td>

                    <td>
                      <div className={styles.vehicleCell}>
                        <span className={styles.vehicleTitle}>
                          {r.brand || r.bikeBrand} {r.model || r.bikeModel}
                        </span>
                        <span className={styles.vehicleSpecs}>
                          {r.year || r.bikeYear} • {r.kilometers?.toLocaleString('en-IN')} km • {r.fuelType || r.bikeType}
                        </span>
                        {r.engineCC && (
                          <span style={{ fontSize: '0.75rem', color: '#C86D3B' }}>
                            Engine: {r.engineCC} cc
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className={styles.priceCell}>{formatPrice(r.expectedPrice)}</span>
                    </td>

                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className={styles.dateCell}>{formatDate(r.createdAt)}</span>
                    </td>

                    <td>
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r._id, e.target.value as SellBikeStatus)}
                        className={`${styles.statusSelect} ${getStatusClass(r.status)}`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>

                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => setSelectedRequest(r)}
                          className={styles.viewDetailsBtn}
                          type="button"
                        >
                          View Details
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

      {/* Details Modal */}
      {selectedRequest && (
        <div className={styles.modalOverlay} onClick={() => setSelectedRequest(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Appraisal Dossier</h2>
                <span className={styles.modalSub}>Submission ID: {selectedRequest._id}</span>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className={styles.modalCloseBtn}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalSection}>
                <h3 className={styles.sectionTitle}>Owner Credentials</h3>
                <div className={styles.detailGrid}>
                  <div>
                    <label>Owner Name</label>
                    <p>{selectedRequest.ownerName}</p>
                  </div>
                  <div>
                    <label>Phone Number</label>
                    <p>
                      <a href={`tel:${selectedRequest.phone}`}>{selectedRequest.phone}</a>
                    </p>
                  </div>
                  <div>
                    <label>Email Address</label>
                    <p>
                      <a href={`mailto:${selectedRequest.email}`}>{selectedRequest.email}</a>
                    </p>
                  </div>
                  <div>
                    <label>Location / City</label>
                    <p>{selectedRequest.location}</p>
                  </div>
                </div>
              </div>

              <div className={styles.modalSection}>
                <h3 className={styles.sectionTitle}>Motorcycle Dossier</h3>
                <div className={styles.detailGrid}>
                  <div>
                    <label>Motorcycle</label>
                    <p>
                      <strong>
                        {selectedRequest.brand || selectedRequest.bikeBrand}{' '}
                        {selectedRequest.model || selectedRequest.bikeModel}{' '}
                        {selectedRequest.variant || ''}
                      </strong>
                    </p>
                  </div>
                  <div>
                    <label>Registration Year</label>
                    <p>{selectedRequest.year || selectedRequest.bikeYear}</p>
                  </div>
                  <div>
                    <label>Odometer Reading</label>
                    <p>{selectedRequest.kilometers?.toLocaleString('en-IN')} km</p>
                  </div>
                  <div>
                    <label>Bike Category</label>
                    <p>{selectedRequest.bikeType}</p>
                  </div>
                  {selectedRequest.engineCC && (
                    <div>
                      <label>Displacement</label>
                      <p>{selectedRequest.engineCC} cc</p>
                    </div>
                  )}
                  <div>
                    <label>Owner Expected Valuation</label>
                    <p style={{ color: '#C86D3B', fontWeight: 700 }}>
                      {formatPrice(selectedRequest.expectedPrice)}
                    </p>
                  </div>
                </div>
              </div>

              {selectedRequest.message && (
                <div className={styles.modalSection}>
                  <h3 className={styles.sectionTitle}>Owner Comments / Modifications</h3>
                  <p className={styles.notesText}>{selectedRequest.message}</p>
                </div>
              )}

              <div className={styles.modalSection}>
                <h3 className={styles.sectionTitle}>Procurement Status</h3>
                <div className={styles.statusButtonGroup}>
                  {(['New', 'Contacted', 'Closed'] as SellBikeStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(selectedRequest._id, st)}
                      className={`${styles.statusOptionBtn} ${
                        selectedRequest.status === st ? styles.statusOptionActive : ''
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                onClick={() => setSelectedRequest(null)}
                className={styles.modalDoneBtn}
                type="button"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
