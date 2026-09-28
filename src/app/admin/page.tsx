'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from './AdminDashboard.module.css';

interface DashboardData {
  totalBikes: number;
  availableBikes: number;
  soldBikes: number;
  newEnquiries: number;
  pendingTestRides: number;
  newSellRequests: number;
  recentEnquiries: Array<{
    _id: string;
    customerName: string;
    phone: string;
    email: string;
    bikeTitle?: string;
    createdAt: string;
    status: string;
  }>;
  upcomingTestRides: Array<{
    _id: string;
    customerName: string;
    phone: string;
    email: string;
    bikeTitle: string;
    preferredDate: string;
    preferredTime: string;
    status: string;
  }>;
  recentSellRequests: Array<{
    _id: string;
    ownerName: string;
    phone: string;
    email: string;
    bikeTitle: string;
    expectedPrice?: number | null;
    createdAt: string;
    status: string;
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) {
        throw new Error(`Failed to load dashboard metrics (Status: ${res.status})`);
      }
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        throw new Error(json.error || 'Failed to parse dashboard data');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with MongoDB backend');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  const formatPrice = (val?: number | null) => {
    if (!val || isNaN(val)) return 'Not Specified';
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakh`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return styles.statusNew;
      case 'contacted':
        return styles.statusContacted;
      case 'closed':
        return styles.statusClosed;
      case 'pending':
        return styles.statusPending;
      case 'confirmed':
        return styles.statusConfirmed;
      case 'completed':
        return styles.statusCompleted;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return styles.statusClosed;
    }
  };

  return (
    <div>
      <div className={styles.dashboardHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Motorcycle Dealership Dashboard</h1>
          <p className={styles.pageSubtitle}>
            Live operational metrics and customer ride requests connected to MongoDB (used_bikes)
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className={styles.refreshBtn}
            type="button"
          >
            <svg
              className={refreshing ? styles.refreshIconRotating : ''}
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span>{refreshing ? 'Updating...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#f87171',
            fontSize: '0.9rem',
          }}
        >
          {error}
        </div>
      )}

      {/* 6 Real Motorcycle Dealership Operational Metric Cards */}
      <section className={styles.statsGrid}>
        {/* Total Bikes */}
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Total Inventory</span>
            <div className={styles.statIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="5.5" cy="17.5" r="3.5" />
                <circle cx="18.5" cy="17.5" r="3.5" />
                <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h3" />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>
            {loading ? '—' : data?.totalBikes ?? 0}
          </div>
          <div className={styles.statSubtext}>
            <span className={styles.statIndicatorBlue}>Certified motorcycles</span>
          </div>
        </div>

        {/* Available Bikes */}
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Available Bikes</span>
            <div className={styles.statIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>
            {loading ? '—' : data?.availableBikes ?? 0}
          </div>
          <div className={styles.statSubtext}>
            <span className={styles.statIndicatorGreen}>Ready for test ride & sale</span>
          </div>
        </div>

        {/* Sold Bikes */}
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Sold Bikes</span>
            <div className={styles.statIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>
            {loading ? '—' : data?.soldBikes ?? 0}
          </div>
          <div className={styles.statSubtext}>
            <span className={styles.statIndicatorGold}>Delivered to riders</span>
          </div>
        </div>

        {/* New Enquiries */}
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>New Enquiries</span>
            <div className={styles.statIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>
            {loading ? '—' : data?.newEnquiries ?? 0}
          </div>
          <div className={styles.statSubtext}>
            <span className={styles.statIndicatorAmber}>Awaiting advisor reply</span>
          </div>
        </div>

        {/* Pending Test Rides */}
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Pending Test Rides</span>
            <div className={styles.statIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>
            {loading ? '—' : data?.pendingTestRides ?? 0}
          </div>
          <div className={styles.statSubtext}>
            <span className={styles.statIndicatorAmber}>Awaiting slot confirmation</span>
          </div>
        </div>

        {/* New Sell Requests */}
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>New Sell Requests</span>
            <div className={styles.statIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>
            {loading ? '—' : data?.newSellRequests ?? 0}
          </div>
          <div className={styles.statSubtext}>
            <span className={styles.statIndicatorGold}>Awaiting bike valuation</span>
          </div>
        </div>
      </section>

      {/* Activity Grid: 3 Activity Feeds */}
      <section className={styles.activityGrid}>
        {/* Recent Enquiries */}
        <div className={styles.activityCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Recent Enquiries</span>
            </h2>
            <Link href="/admin/enquiries" className={styles.viewAllLink}>
              <span>View All</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.activityTable}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Motorcycle</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className={styles.emptyState}>
                      Loading enquiries...
                    </td>
                  </tr>
                ) : data?.recentEnquiries && data.recentEnquiries.length > 0 ? (
                  data.recentEnquiries.map((enq) => (
                    <tr key={enq._id}>
                      <td>
                        <div className={styles.customerCell}>
                          <span className={styles.customerName}>{enq.customerName}</span>
                          <span className={styles.customerContact}>{enq.phone}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.vehicleTitle} title={enq.bikeTitle}>
                          {enq.bikeTitle || 'General Studio Inquiry'}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(enq.createdAt)}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${getStatusBadgeClass(enq.status)}`}>
                          {enq.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className={styles.emptyState}>
                      No customer enquiries logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Test Rides */}
        <div className={styles.activityCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>Upcoming Test Rides</span>
            </h2>
            <Link href="/admin/test-rides" className={styles.viewAllLink}>
              <span>View All</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.activityTable}>
              <thead>
                <tr>
                  <th>Rider</th>
                  <th>Motorcycle</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className={styles.emptyState}>
                      Loading test rides...
                    </td>
                  </tr>
                ) : data?.upcomingTestRides && data.upcomingTestRides.length > 0 ? (
                  data.upcomingTestRides.map((td) => (
                    <tr key={td._id}>
                      <td>
                        <div className={styles.customerCell}>
                          <span className={styles.customerName}>{td.customerName}</span>
                          <span className={styles.customerContact}>{td.phone}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.vehicleTitle} title={td.bikeTitle}>
                          {td.bikeTitle}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div>{formatDate(td.preferredDate)}</div>
                        <div style={{ fontSize: '0.75rem', color: '#C86D3B' }}>{td.preferredTime}</div>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${getStatusBadgeClass(td.status)}`}>
                          {td.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className={styles.emptyState}>
                      No test-ride bookings logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Sell Requests */}
        <div className={styles.activityCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span>Recent Sell Requests</span>
            </h2>
            <Link href="/admin/sell-bikes" className={styles.viewAllLink}>
              <span>View All</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.activityTable}>
              <thead>
                <tr>
                  <th>Owner</th>
                  <th>Motorcycle</th>
                  <th>Expected</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className={styles.emptyState}>
                      Loading sell requests...
                    </td>
                  </tr>
                ) : data?.recentSellRequests && data.recentSellRequests.length > 0 ? (
                  data.recentSellRequests.map((sr) => (
                    <tr key={sr._id}>
                      <td>
                        <div className={styles.customerCell}>
                          <span className={styles.customerName}>{sr.ownerName}</span>
                          <span className={styles.customerContact}>{sr.phone}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.vehicleTitle} title={sr.bikeTitle}>
                          {sr.bikeTitle}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem', color: '#C86D3B' }}>
                        {formatPrice(sr.expectedPrice)}
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${getStatusBadgeClass(sr.status)}`}>
                          {sr.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className={styles.emptyState}>
                      No sell-your-bike requests logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
