'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './AdminSellRequests.module.css';
import { ISellRequestDocument, SellRequestStatus } from '@/models/SellRequest';

export default function AdminSellRequestsPage() {
  const [sellRequests, setSellRequests] = useState<ISellRequestDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<ISellRequestDocument | null>(null);

  const fetchSellRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/sell-requests?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setSellRequests(json.data || []);
      }
    } catch (err) {
      console.error('Error fetching sell requests:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchSellRequests();
  }, [fetchSellRequests]);

  const handleStatusChange = async (id: string, newStatus: SellRequestStatus) => {
    try {
      const res = await fetch(`/api/admin/sell-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
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
      console.error('Failed to update sell request status:', err);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this sell request record?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/sell-requests/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSellRequests((prev) => prev.filter((r) => r._id !== id));
        if (selectedRequest && selectedRequest._id === id) {
          setSelectedRequest(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete sell request:', err);
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

  const getStatusSelectClass = (status: string) => {
    switch (status) {
      case 'New':
        return styles.statusSelectNew;
      case 'Contacted':
        return styles.statusSelectContacted;
      case 'Closed':
        return styles.statusSelectClosed;
      default:
        return '';
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Vehicle Sell Requests</h1>
          <p className={styles.pageSubtitle}>
            Manage incoming pre-owned car valuation dossiers, doorstep evaluation bookings, and purchase statuses
          </p>
        </div>
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
              placeholder="Search by owner name, phone, email, make or model..."
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
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.sellRequestsTable}>
            <thead>
              <tr>
                <th>Owner / Contact</th>
                <th>Vehicle Profile</th>
                <th>Location</th>
                <th>Expected Price</th>
                <th>Submitted Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    Loading vehicle sell requests...
                  </td>
                </tr>
              ) : sellRequests.length > 0 ? (
                sellRequests.map((req) => (
                  <tr key={req._id}>
                    <td>
                      <div className={styles.ownerCell}>
                        <span className={styles.ownerName}>{req.ownerName}</span>
                        <span className={styles.ownerMeta}>
                          {req.phone} • {req.email}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.vehicleCell}>
                        <span className={styles.vehicleTitle}>
                          {req.carYear} {req.carBrand} {req.carModel}
                        </span>
                        <span className={styles.vehicleSpecs}>
                          {req.kilometers.toLocaleString('en-IN')} KM • {req.fuelType} • {req.transmission}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.locationCell}>{req.location}</span>
                    </td>
                    <td>
                      <span className={styles.priceTag}>{formatPrice(req.expectedPrice)}</span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(req.createdAt)}</td>
                    <td>
                      <select
                        value={req.status}
                        onChange={(e) =>
                          handleStatusChange(req._id, e.target.value as SellRequestStatus)
                        }
                        className={`${styles.statusSelect} ${getStatusSelectClass(req.status)}`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className={styles.actionBtn}
                          type="button"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          <span>Inspect</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    No vehicle sell requests found matching current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspector Modal */}
      {selectedRequest && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedRequest(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                Sell Dossier: {selectedRequest.carYear} {selectedRequest.carBrand} {selectedRequest.carModel}
              </h2>
              <button
                className={styles.closeBtn}
                onClick={() => setSelectedRequest(null)}
                aria-label="Close modal"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Owner Information */}
              <div className={styles.detailSection}>
                <span className={styles.sectionHeader}>Seller Contact Details</span>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Full Name</span>
                    <span className={styles.infoValue}>{selectedRequest.ownerName}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Phone Number</span>
                    <span className={styles.infoValue}>
                      <a href={`tel:${selectedRequest.phone}`} style={{ color: '#c8a97e' }}>
                        {selectedRequest.phone}
                      </a>
                    </span>
                  </div>
                  <div className={styles.infoItemFull}>
                    <span className={styles.infoLabel}>Email Address</span>
                    <span className={styles.infoValue}>
                      <a href={`mailto:${selectedRequest.email}`} style={{ color: '#cbd5e1' }}>
                        {selectedRequest.email}
                      </a>
                    </span>
                  </div>
                </div>
              </div>

              {/* Vehicle Specifications */}
              <div className={styles.detailSection}>
                <span className={styles.sectionHeader}>Vehicle Specifications</span>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Make & Model</span>
                    <span className={styles.infoValue}>
                      {selectedRequest.carBrand} {selectedRequest.carModel}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Registration Year</span>
                    <span className={styles.infoValue}>{selectedRequest.carYear}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Odometer (Mileage)</span>
                    <span className={styles.infoValue}>
                      {selectedRequest.kilometers.toLocaleString('en-IN')} KM
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Fuel & Transmission</span>
                    <span className={styles.infoValue}>
                      {selectedRequest.fuelType} • {selectedRequest.transmission}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>RTO City / State</span>
                    <span className={styles.infoValue}>{selectedRequest.location}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Expected Valuation</span>
                    <span className={styles.infoValueHighlight}>
                      {formatPrice(selectedRequest.expectedPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Seller Notes */}
              {selectedRequest.message && (
                <div className={styles.detailSection}>
                  <span className={styles.sectionHeader}>Seller Notes / Remarks</span>
                  <div className={styles.messageBox}>{selectedRequest.message}</div>
                </div>
              )}

              {/* Workflow Status Controls */}
              <div className={styles.detailSection}>
                <span className={styles.sectionHeader}>Acquisition Review Status</span>
                <div className={styles.statusChangeRow}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Set status:</span>
                  <div className={styles.statusBtnGroup}>
                    {(['New', 'Contacted', 'Closed'] as const).map((st) => {
                      const isActive = selectedRequest.status === st;
                      const activeClass =
                        st === 'New'
                          ? styles.statusChoiceBtnActiveNew
                          : st === 'Contacted'
                          ? styles.statusChoiceBtnActiveContacted
                          : styles.statusChoiceBtnActiveClosed;

                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleStatusChange(selectedRequest._id, st)}
                          className={`${styles.statusChoiceBtn} ${isActive ? activeClass : ''}`}
                        >
                          {st}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={() => handleDeleteRequest(selectedRequest._id)}
                className={styles.deleteBtn}
              >
                Delete Record
              </button>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className={styles.closeModalBtn}
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
