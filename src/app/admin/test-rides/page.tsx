'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './AdminTestRides.module.css';
import { ITestRideBooking } from '@/types';
import { TestRideStatus } from '@/models/TestRide';

export default function AdminTestRidesPage() {
  const [bookings, setBookings] = useState<ITestRideBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<ITestRideBooking | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/test-rides?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setBookings(json.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching admin test rides:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Sort upcoming test rides by date/time ascending, past bookings below
  const sortedBookings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming: ITestRideBooking[] = [];
    const past: ITestRideBooking[] = [];

    bookings.forEach((b) => {
      const bDate = new Date(b.preferredDate);
      if (bDate >= today) {
        upcoming.push(b);
      } else {
        past.push(b);
      }
    });

    upcoming.sort((a, b) => new Date(a.preferredDate).getTime() - new Date(b.preferredDate).getTime());
    past.sort((a, b) => new Date(b.preferredDate).getTime() - new Date(a.preferredDate).getTime());

    return [...upcoming, ...past];
  }, [bookings]);

  // Update status (inline or in modal)
  const handleStatusChange = async (id: string, newStatus: TestRideStatus) => {
    try {
      const res = await fetch('/api/admin/test-rides', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
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
      console.error('Failed to update test-ride status:', err);
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

  const getStatusClass = (status: TestRideStatus) => {
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
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Test Ride Appointments</h1>
          <p className={styles.pageSubtitle}>
            Manage motorcycle test ride reservations, rider license verification, and studio slots
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
            placeholder="Search by customer name, phone, or bike title..."
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
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Rider</th>
                <th>Motorcycle</th>
                <th>Preferred Slot</th>
                <th>Studio & Notes</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    Loading test ride appointments...
                  </td>
                </tr>
              ) : sortedBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    No test ride bookings found matching criteria.
                  </td>
                </tr>
              ) : (
                sortedBookings.map((b) => {
                  const upcoming = isDateUpcoming(b.preferredDate);
                  const bikeTitle = (b as any).bikeSnapshot?.title || b.bikeTitle || 'Motorcycle Test Ride';
                  const location = (b as any).location || 'Indiranagar Studio';

                  return (
                    <tr key={b._id} className={!upcoming && b.status === 'Completed' ? styles.rowMuted : ''}>
                      <td>
                        <div className={styles.customerCell}>
                          <span className={styles.customerName}>{b.customerName}</span>
                          <span className={styles.customerPhone}>{b.phone}</span>
                          <span className={styles.customerEmail}>{b.email}</span>
                        </div>
                      </td>

                      <td>
                        <div className={styles.vehicleCell}>
                          <span className={styles.vehicleTitle}>{bikeTitle}</span>
                          {(b as any).bikeSnapshot?.price && (
                            <span style={{ fontSize: '0.78rem', color: '#C86D3B', fontWeight: 600 }}>
                              {(b as any).bikeSnapshot.price >= 100000
                                ? `₹${((b as any).bikeSnapshot.price / 100000).toFixed(2)} Lakh`
                                : `₹${(b as any).bikeSnapshot.price.toLocaleString('en-IN')}`}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className={styles.slotCell}>
                          <div className={styles.slotDateRow}>
                            <span className={styles.slotDate}>{formatDate(b.preferredDate)}</span>
                            {upcoming && (
                              <span className={styles.badgeUpcoming}>Upcoming</span>
                            )}
                          </div>
                          <span className={styles.slotTime}>{b.preferredTime}</span>
                        </div>
                      </td>

                      <td>
                        <div className={styles.locationCell}>
                          <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem' }}>
                            {location}
                          </span>
                          {b.message && (
                            <span
                              style={{
                                fontSize: '0.78rem',
                                color: '#94a3b8',
                                fontStyle: 'italic',
                                display: 'block',
                                maxWidth: '200px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={b.message}
                            >
                              &quot;{b.message}&quot;
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b._id!, e.target.value as TestRideStatus)}
                          className={`${styles.statusSelect} ${getStatusClass(b.status)}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className={styles.viewDetailsBtn}
                            type="button"
                          >
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedBooking && (
        <div className={styles.modalOverlay} onClick={() => setSelectedBooking(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Test Ride Details</h2>
                <span className={styles.modalSub}>ID: {selectedBooking._id}</span>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className={styles.modalCloseBtn}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalSection}>
                <h3 className={styles.sectionTitle}>Rider Information</h3>
                <div className={styles.detailGrid}>
                  <div>
                    <label>Full Name</label>
                    <p>{selectedBooking.customerName}</p>
                  </div>
                  <div>
                    <label>Phone Number</label>
                    <p>
                      <a href={`tel:${selectedBooking.phone}`}>{selectedBooking.phone}</a>
                    </p>
                  </div>
                  <div>
                    <label>Email Address</label>
                    <p>
                      <a href={`mailto:${selectedBooking.email}`}>{selectedBooking.email}</a>
                    </p>
                  </div>
                  <div>
                    <label>Driving License</label>
                    <p>{selectedBooking.drivingLicenseNumber || 'Verified at Studio'}</p>
                  </div>
                </div>
              </div>

              <div className={styles.modalSection}>
                <h3 className={styles.sectionTitle}>Motorcycle & Ride Slot</h3>
                <div className={styles.detailGrid}>
                  <div>
                    <label>Selected Motorcycle</label>
                    <p>
                      <strong>
                        {(selectedBooking as any).bikeSnapshot?.title || selectedBooking.bikeTitle || 'Motorcycle Test Ride'}
                      </strong>
                    </p>
                  </div>
                  <div>
                    <label>Preferred Date</label>
                    <p>{formatDate(selectedBooking.preferredDate)}</p>
                  </div>
                  <div>
                    <label>Preferred Time Slot</label>
                    <p>{selectedBooking.preferredTime}</p>
                  </div>
                  <div>
                    <label>Helmet Provision</label>
                    <p>{selectedBooking.helmetRequired ? 'Yes (Dealership must provide sanitised helmet)' : 'No (Rider bringing personal helmet)'}</p>
                  </div>
                  <div>
                    <label>Riding Experience</label>
                    <p>{selectedBooking.ridingExperience || 'Intermediate'}</p>
                  </div>
                </div>
              </div>

              {selectedBooking.message && (
                <div className={styles.modalSection}>
                  <h3 className={styles.sectionTitle}>Special Notes</h3>
                  <p className={styles.notesText}>{selectedBooking.message}</p>
                </div>
              )}

              <div className={styles.modalSection}>
                <h3 className={styles.sectionTitle}>Update Status</h3>
                <div className={styles.statusButtonGroup}>
                  {(['Pending', 'Confirmed', 'Completed', 'Cancelled'] as TestRideStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(selectedBooking._id!, st)}
                      className={`${styles.statusOptionBtn} ${
                        selectedBooking.status === st ? styles.statusOptionActive : ''
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
                onClick={() => setSelectedBooking(null)}
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
