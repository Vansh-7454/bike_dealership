import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getBikeByIdOrSlug } from '@/lib/bikesService';
import BikeDetailClient from './BikeDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const bike = await getBikeByIdOrSlug(id);

  if (!bike) {
    return {
      title: 'Motorcycle Not Found | Torque Two-Wheelers India',
      description: 'The requested certified pre-owned motorcycle could not be located in our inventory collection.',
    };
  }

  const primaryImage = bike.images?.[0] || '/images/bikes/hunter_350_hero.jpg';
  const priceLakhs = (bike.price / 100000).toFixed(2);

  return {
    title: `${bike.year} ${bike.title} | ₹${priceLakhs} Lakh | Torque Two-Wheelers`,
    description: `${bike.year} ${bike.brand} ${bike.model} ${bike.variant} in ${bike.location}. ${bike.kilometers.toLocaleString()} km, ${bike.engineCC}cc, ${bike.mileage} kmpl. 120-point certified with warranty.`,
    openGraph: {
      title: `${bike.year} ${bike.title} - Certified Pre-Owned | Torque Two-Wheelers`,
      description: `${bike.title} available now at ₹${priceLakhs} Lakh. 120-Point Inspection passed.`,
      images: [{ url: primaryImage }],
    },
  };
}

export default async function BikeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const bike = await getBikeByIdOrSlug(id);

  if (!bike) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#F9F8F5',
          color: '#141518',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(200, 109, 59, 0.15)',
            color: '#C86D3B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 style={{ fontFamily: 'var(--font-family-display)', fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
          Motorcycle Not Found
        </h1>
        <p style={{ color: '#666', maxWidth: '440px', lineHeight: '1.6', marginBottom: '2rem' }}>
          The motorcycle you are searching for might have been acquired by another rider or the listing code is invalid.
        </p>
        <Link
          href="/bikes"
          style={{
            padding: '12px 28px',
            background: '#141518',
            color: '#FFFFFF',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          Explore Available Inventory
        </Link>
      </div>
    );
  }

  if (bike.status === 'Archived') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#0F1115',
          color: '#F9F8F5',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(255, 193, 7, 0.15)',
            color: '#FFC107',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 8v13H3V8" />
            <path d="M1 3h22v5H1z" />
            <path d="M10 12h4" />
          </svg>
        </div>
        <span style={{ fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', color: '#FFC107', fontWeight: 700, marginBottom: '0.5rem' }}>
          Archived Listing
        </span>
        <h1 style={{ fontFamily: 'var(--font-family-display)', fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
          {bike.title} ({bike.year})
        </h1>
        <p style={{ color: '#94a3b8', maxWidth: '480px', lineHeight: '1.6', marginBottom: '2rem' }}>
          This motorcycle record has been archived and is no longer available in our active showroom inventory. Browse our verified active collection or reach out to our concierge for custom sourcing.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            href="/bikes"
            style={{
              padding: '12px 28px',
              background: '#C86D3B',
              color: '#FFFFFF',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            Explore Active Showroom
          </Link>
          <Link
            href="/contact"
            style={{
              padding: '12px 28px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            Contact Sourcing Concierge
          </Link>
        </div>
      </div>
    );
  }

  return <BikeDetailClient bike={bike} />;
}
