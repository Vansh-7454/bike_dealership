'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from '../enquiries/AdminEnquiries.module.css';
import { IContactEnquiryDocument, ContactEnquiryStatus } from '@/models/ContactEnquiry';

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<IContactEnquiryDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState<IContactEnquiryDocument | null>(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/contacts?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setContacts(json.contacts || json.data || []);
      }
    } catch (err) {
      console.error('Error fetching admin contacts:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleStatusChange = async (id: string, newStatus: ContactEnquiryStatus) => {
    try {
      const res = await fetch('/api/admin/contacts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        setContacts((prev) =>
          prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c))
        );
        if (selectedContact && selectedContact._id === id) {
          setSelectedContact({ ...selectedContact, status: newStatus });
        }
      }
    } catch (err) {
      console.error('Failed to update contact status:', err);
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
          <h1 className={styles.pageTitle}>General Contact Enquiries</h1>
          <p className={styles.pageSubtitle}>
            Review general showroom inquiries, rider advisory questions, and studio visit requests
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
              placeholder="Search by name, email, phone, or message content..."
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
          <table className={styles.enquiriesTable}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Topic / Intent</th>
                <th>Message Content</th>
                <th>Date Received</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    Loading contact enquiries...
                  </td>
                </tr>
              ) : contacts.length > 0 ? (
                contacts.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div className={styles.customerCell}>
                        <span className={styles.customerName}>{c.name}</span>
                        <span className={styles.customerMeta}>
                          {c.phone} • {c.email}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className={styles.typeBadgeGeneral}>
                        {c.topic || 'General Inquiry'}
                      </span>
                    </td>

                    <td>
                      <div className={styles.messageSnippet} title={c.message}>
                        {c.message}
                      </div>
                    </td>

                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(c.createdAt)}</td>

                    <td>
                      <select
                        value={c.status}
                        onChange={(e) =>
                          handleStatusChange(c._id, e.target.value as ContactEnquiryStatus)
                        }
                        className={`${styles.statusSelect} ${getStatusSelectClass(c.status)}`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>

                    <td>
                      <div className={styles.actionsCell}>
                        <button
                          onClick={() => setSelectedContact(c)}
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
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    No contact submissions found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Contact Dossier</h2>
              <button
                onClick={() => setSelectedContact(null)}
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
              <div className={styles.detailSection}>
                <span className={styles.sectionLabel}>Client Information</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                  {selectedContact.name}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                  Received on {formatDate(selectedContact.createdAt)}
                </div>

                <div className={styles.contactRow}>
                  <a href={`tel:${selectedContact.phone}`} className={styles.contactBtn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>Call: {selectedContact.phone}</span>
                  </a>

                  <a href={`mailto:${selectedContact.email}`} className={styles.contactBtn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <span>Email Client</span>
                  </a>
                </div>
              </div>

              <div className={styles.detailSection}>
                <span className={styles.sectionLabel}>Topic / Inquiry Subject</span>
                <div style={{ color: '#C86D3B', fontWeight: 600, fontSize: '0.95rem' }}>
                  {selectedContact.topic}
                </div>
                {selectedContact.preferredDate && (
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
                    Preferred Date: <strong>{selectedContact.preferredDate}</strong>
                  </div>
                )}
              </div>

              <div className={styles.detailSection}>
                <span className={styles.sectionLabel}>Inquiry Message</span>
                <div className={styles.messageBox}>
                  {selectedContact.message}
                </div>
              </div>

              <div className={styles.statusChangerRow}>
                <div>
                  <span className={styles.sectionLabel}>Admin Status</span>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    Current status: <strong style={{ color: '#ffffff' }}>{selectedContact.status}</strong>
                  </div>
                </div>

                <select
                  value={selectedContact.status}
                  onChange={(e) =>
                    handleStatusChange(selectedContact._id, e.target.value as ContactEnquiryStatus)
                  }
                  className={`${styles.statusSelect} ${getStatusSelectClass(selectedContact.status)}`}
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
