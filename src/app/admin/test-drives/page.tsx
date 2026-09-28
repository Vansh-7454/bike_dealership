'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import styles from './AdminTestDrives.module.css';
import { ITestDriveBookingDocument, BookingStatus } from '@/models/TestDriveBooking';

export default function AdminTestDrivesPage() {
  const [bookings, setBookings] = useState<ITestDriveBookingDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<ITestDriveBookingDocument | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/test-drives?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setBookings(json.data || []);
      }
    } catch (err) {
      console.error('Error fetching admin test drives:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Sort upcoming test drives by date/time ascending, past bookings below
  const sortedBookings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming: ITestDriveBookingDocument[] = [];
    const past: ITestDriveBookingDocument[] = [];

    bookings.forEach((b) => {
      const bDate = new Date(b.preferredDate);
      if (bDate >= today) {
        upcoming.push(b);
      } else {
        past.push(b);
      }
    });

    // Upcoming sorted earliest to latest
    upcoming.sort((a, b) => new Date(a.preferredDate).getTime() - new Date(b.preferredDate).getTime());
    // Past sorted latest to earliest
    past.sort((a, b) => new Date(b.preferredDate).getTime() - new Date(a.preferredDate).getTime());

    return [...upcoming, ...past];
  }, [bookings]);

  // Update status (inline or in modal)
  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    try {
      const res = await fetch(`/api/admin/test-drives/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b))
        );
        if (selectedBooking && selectedBooking._id === id) {
          setSelectedBooking({ ...selectedBooking, status: newStatus });
        }
      }
    } catch (err) {
      console.error('Failed to update test-drive status:', err);
    }
  };

  const isDateUpcoming = (dateVal: string | Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(dateVal);
    return d >= today;
  };

  const formatDate = (dateVal: string | Date) => {
    try {
      return new Date(dateVal).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return String(dateVal);
    }
  };

  const getStatusSelectClass = (status: string) => {
    switch (status) {
      case 'Pending':
        return styles.statusPending;
      case 'Confirmed':
        return styles.statusConfirmed;
      case 'Completed':
        return styles.statusCompleted;
      case 'Cancelled':
        return styles.statusCancelled;
      default:
        return '';
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Test Drive Management</h1>
          <p className={styles.pageSubtitle}>
            Manage VIP customer driving experiences, confirm slots, and record appointment statuses
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
              placeholder="Search by customer name, email, phone, car..."
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
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.testDrivesTable}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Requested Vehicle</th>
                <th>Preferred Appointment</th>
                <th>Location</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    Loading test-drive reservations...
                  </td>
                </tr>
              ) : sortedBookings.length > 0 ? (
                sortedBookings.map((b) => {
                  const upcoming = isDateUpcoming(b.preferredDate);

                  return (
                    <tr key={b._id}>
                      <td>
                        <div className={styles.customerCell}>
                          <span className={styles.customerName}>{b.customerName}</span>
                          <span className={styles.customerMeta}>
                            {b.phone} • {b.email}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {b.carSnapshot?.primaryImage && (
                            <Image
                              src={b.carSnapshot.primaryImage}
                              alt={b.carSnapshot.title || 'Car'}
                              width={48}
                              height={34}
                              style={{ borderRadius: '4px', objectFit: 'cover' }}
                              unoptimized
                            />
                          )}
                          <span className={styles.vehicleTitle}>
                            {b.carSnapshot?.title || 'Selected Vehicle'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.dateTimeCell}>
                          <div className={styles.dateText}>{formatDate(b.preferredDate)}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className={styles.timeSlotText}>{b.preferredTime}</span>
                            <span className={upcoming ? styles.upcomingBadge : styles.pastBadge}>
                              {upcoming ? 'Upcoming' : 'Past'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          {b.location || 'Mumbai Flagship Studio'}
                        </span>
                      </td>
                      <td>
                        <select
                          value={b.status}
                          onChange={(e) =>
                            handleStatusChange(b._id, e.target.value as BookingStatus)
                          }
                          className={`${styles.statusSelect} ${getStatusSelectClass(b.status)}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setSelectedBooking(b)}
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
                    No test drive bookings found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Test Drive Booking Dossier</h2>
              <button
                onClick={() => setSelectedBooking(null)}
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
              {/* Client Info */}
              <div className={styles.detailSection}>
                <span className={styles.sectionLabel}>Client Information</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                  {selectedBooking.customerName}
                </div>

                <div className={styles.contactRow}>
                  <a href={`tel:${selectedBooking.phone}`} className={styles.contactBtn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>Call: {selectedBooking.phone}</span>
                  </a>

                  <a href={`mailto:${selectedBooking.email}`} className={styles.contactBtn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <span>Email Client</span>
                  </a>
                </div>
              </div>

              {/* Appointment Slot */}
              <div className={styles.detailSection}>
                <span className={styles.sectionLabel}>Scheduled Experience Slot</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff' }}>
                  {formatDate(selectedBooking.preferredDate)} •{' '}
                  <span style={{ color: '#c8a97e', textTransform: 'uppercase' }}>
                    {selectedBooking.preferredTime}
                  </span>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  Location: {selectedBooking.location || 'Mumbai Flagship Studio (One BKC)'}
                </div>
              </div>

              {/* Vehicle Snapshot */}
              {selectedBooking.carSnapshot && (
                <div className={styles.detailSection}>
                  <span className={styles.sectionLabel}>Reserved Vehicle</span>
                  <div className={styles.carBanner}>
                    {selectedBooking.carSnapshot.primaryImage && (
                      <Image
                        src={selectedBooking.carSnapshot.primaryImage}
                        alt={selectedBooking.carSnapshot.title}
                        width={80}
                        height={55}
                        style={{ borderRadius: '6px', objectFit: 'cover' }}
                        unoptimized
                      />
                    )}
                    <div>
                      <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.95rem' }}>
                        {selectedBooking.carSnapshot.year} {selectedBooking.carSnapshot.title}
                      </div>
                      <div style={{ color: '#c8a97e', fontWeight: 700, fontSize: '0.9rem' }}>
                        ₹{(selectedBooking.carSnapshot.price / 100000).toFixed(2)} Lakh
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Special Requests */}
              <div className={styles.detailSection}>
                <span className={styles.sectionLabel}>Client Requests / Notes</span>
                <div className={styles.messageBox}>
                  {selectedBooking.message || 'No special requests submitted for this driving appointment.'}
                </div>
              </div>

              {/* Status Update */}
              <div className={styles.statusChangerRow}>
                <div>
                  <span className={styles.sectionLabel}>Appointment Status</span>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    Status in MongoDB: <strong style={{ color: '#ffffff' }}>{selectedBooking.status}</strong>
                  </div>
                </div>

                <select
                  value={selectedBooking.status}
                  onChange={(e) =>
                    handleStatusChange(selectedBooking._id, e.target.value as BookingStatus)
                  }
                  className={`${styles.statusSelect} ${getStatusSelectClass(selectedBooking.status)}`}
                  style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
