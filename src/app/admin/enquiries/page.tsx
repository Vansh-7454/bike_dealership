'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import styles from './AdminEnquiries.module.css';
import { IEnquiryDocument } from '@/models/Enquiry';

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<IEnquiryDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'bike' | 'general'>('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<IEnquiryDocument | null>(null);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/enquiries?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setEnquiries(json.data || []);
      }
    } catch (err) {
      console.error('Error fetching admin enquiries:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const filteredEnquiries = enquiries.filter((e) => {
    if (typeFilter === 'bike') {
      return Boolean(e.bikeId || e.bikeSnapshot);
    }
    if (typeFilter === 'general') {
      return !e.bikeId && !e.bikeSnapshot;
    }
    return true;
  });

  // Update status
  const handleStatusChange = async (id: string, newStatus: 'New' | 'Contacted' | 'Closed') => {
    try {
      const res = await fetch('/api/admin/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((e) => (e._id === id ? { ...e, status: newStatus } : e))
        );
        if (selectedEnquiry && selectedEnquiry._id === id) {
          setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
        }
      }
    } catch (err) {
      console.error('Failed to update enquiry status:', err);
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
          <h1 className={styles.pageTitle}>Customer Enquiries</h1>
          <p className={styles.pageSubtitle}>
            Manage incoming purchase inquiries, rider studio contact status, and bike preferences
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
              placeholder="Search by customer name, email, phone, motorcycle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.filterSelects}>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'bike' | 'general')}
            className={styles.select}
          >
            <option value="all">All Inquiry Types</option>
            <option value="bike">Motorcycle Inquiries Only</option>
            <option value="general">General Studio Only</option>
          </select>

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
          <table className={styles.enquiriesTable}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Inquiry Nature & Bike</th>
                <th>Message</th>
                <th>Received Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    Loading customer enquiries...
                  </td>
                </tr>
              ) : filteredEnquiries.length > 0 ? (
                filteredEnquiries.map((enq) => {
                  const isBike = Boolean(enq.bikeId || enq.bikeSnapshot);

                  return (
                    <tr key={enq._id}>
                      <td>
                        <div className={styles.customerCell}>
                          <span className={styles.customerName}>{enq.customerName}</span>
                          <span className={styles.customerMeta}>
                            {enq.phone} • {enq.email}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div>
                            {isBike ? (
                              <span className={styles.typeBadgeVehicle}>Motorcycle Inquiry</span>
                            ) : (
                              <span className={styles.typeBadgeGeneral}>General Studio</span>
                            )}
                          </div>
                          <div className={styles.bikeCell}>
                            {enq.bikeSnapshot?.primaryImage ? (
                              <Image
                                src={enq.bikeSnapshot.primaryImage}
                                alt={enq.bikeSnapshot.title || 'Motorcycle'}
                                width={48}
                                height={34}
                                className={styles.bikeThumb}
                                unoptimized
                              />
                            ) : (
                              <div
                                style={{
                                  width: 48,
                                  height: 34,
                                  borderRadius: 4,
                                  backgroundColor: '#1a1e27',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#C86D3B',
                                }}
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                              </div>
                            )}
                            <span className={styles.bikeTitle}>
                              {enq.bikeSnapshot?.title || enq.acquisitionPreference || 'Studio Advisory'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.messageSnippet} title={enq.message || 'No message'}>
                          {enq.message || <em style={{ color: '#475569' }}>No message provided</em>}
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(enq.createdAt)}</td>
                      <td>
                        <select
                          value={enq.status}
                          onChange={(e) =>
                            handleStatusChange(enq._id, e.target.value as 'New' | 'Contacted' | 'Closed')
                          }
                          className={`${styles.statusSelect} ${getStatusSelectClass(enq.status)}`}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                      <td>
                        <div className={styles.actionsCell}>
                          <button
                            onClick={() => setSelectedEnquiry(enq)}
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
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    No customer enquiries found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enquiry Detail Modal */}
      {selectedEnquiry && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Enquiry Dossier</h2>
              <button
                onClick={() => setSelectedEnquiry(null)}
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

            <div className={styles.modalBody}>
              {/* Customer Info */}
              <div className={styles.detailSection}>
                <span className={styles.sectionLabel}>Client Information</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                  {selectedEnquiry.customerName}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                  Received on {formatDate(selectedEnquiry.createdAt)}
                </div>

                <div className={styles.contactRow}>
                  <a href={`tel:${selectedEnquiry.phone}`} className={styles.contactBtn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>Call: {selectedEnquiry.phone}</span>
                  </a>

                  <a href={`mailto:${selectedEnquiry.email}`} className={styles.contactBtn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <span>Email Client</span>
                  </a>
                </div>
              </div>

              {/* Bike Snapshot */}
              {selectedEnquiry.bikeSnapshot ? (
                <div className={styles.detailSection}>
                  <span className={styles.sectionLabel}>Associated Motorcycle</span>
                  <div className={styles.bikeBanner}>
                    {selectedEnquiry.bikeSnapshot.primaryImage && (
                      <Image
                        src={selectedEnquiry.bikeSnapshot.primaryImage}
                        alt={selectedEnquiry.bikeSnapshot.title}
                        width={80}
                        height={55}
                        style={{ borderRadius: '6px', objectFit: 'cover' }}
                        unoptimized
                      />
                    )}
                    <div>
                      <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.95rem' }}>
                        {selectedEnquiry.bikeSnapshot.year} {selectedEnquiry.bikeSnapshot.title}
                      </div>
                      <div style={{ color: '#C86D3B', fontWeight: 700, fontSize: '0.9rem' }}>
                        {selectedEnquiry.bikeSnapshot.price >= 100000
                          ? `₹${(selectedEnquiry.bikeSnapshot.price / 100000).toFixed(2)} Lakh`
                          : `₹${selectedEnquiry.bikeSnapshot.price.toLocaleString('en-IN')}`}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.detailSection}>
                  <span className={styles.sectionLabel}>Inquiry Scope</span>
                  <div style={{ color: '#C86D3B', fontWeight: 600, fontSize: '0.95rem' }}>
                    General Studio Advisory & Sourcing
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '2px' }}>
                    Submitted via Torque Two-Wheelers Studio Portal
                  </div>
                </div>
              )}

              {/* Acquisition Preference */}
              {selectedEnquiry.acquisitionPreference && (
                <div className={styles.detailSection}>
                  <span className={styles.sectionLabel}>Financing / Purchase Preference</span>
                  <div style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>
                    {selectedEnquiry.acquisitionPreference}
                  </div>
                </div>
              )}

              {/* Message */}
              <div className={styles.detailSection}>
                <span className={styles.sectionLabel}>Client Message</span>
                <div className={styles.messageBox}>
                  {selectedEnquiry.message || 'No additional message was provided with this inquiry.'}
                </div>
              </div>

              {/* Status Update */}
              <div className={styles.statusChangerRow}>
                <div>
                  <span className={styles.sectionLabel}>Advisor Status</span>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    Current status in MongoDB: <strong style={{ color: '#ffffff' }}>{selectedEnquiry.status}</strong>
                  </div>
                </div>

                <select
                  value={selectedEnquiry.status}
                  onChange={(e) =>
                    handleStatusChange(
                      selectedEnquiry._id,
                      e.target.value as 'New' | 'Contacted' | 'Closed'
                    )
                  }
                  className={`${styles.statusSelect} ${getStatusSelectClass(selectedEnquiry.status)}`}
                  style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
