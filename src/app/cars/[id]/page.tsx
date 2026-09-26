import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCarByIdOrSlug } from '@/lib/carsService';
import CarDetailClient from './CarDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const car = await getCarByIdOrSlug(id);

  if (!car) {
    return {
      title: 'Vehicle Not Found | Aureus Motors India',
      description: 'The requested certified pre-owned vehicle could not be located in our showroom collection.',
    };
  }

  const primaryImage = car.images?.[0] || '/images/inventory/xuv700_hero.jpg';
  const priceLakhs = (car.price / 100000).toFixed(2);

  return {
    title: `${car.year} ${car.title} | ₹${priceLakhs} Lakh | Aureus Motors`,
    description: `${car.year} ${car.brand} ${car.model} ${car.variant} in ${car.location}. ${car.kilometers.toLocaleString()} km, ${car.fuelType}, ${car.transmission}. 160-point certified with warranty.`,
    openGraph: {
      title: `${car.year} ${car.title} - Certified Pre-Owned | Aureus Motors`,
      description: `${car.title} available now at ₹${priceLakhs} Lakh. 160-Point Inspection passed.`,
      images: [{ url: primaryImage }],
    },
  };
}

export default async function CarDetailPage({ params }: PageProps) {
  const { id } = await params;
  const car = await getCarByIdOrSlug(id);

  if (!car) {
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
          backgroundColor: '#FAF9F6',
          color: '#1A1A1A',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(200, 169, 126, 0.15)',
            color: '#C8A97E',
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
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '0.75rem' }}>
          Vehicle Not Found
        </h1>
        <p style={{ color: '#666', maxWidth: '440px', lineHeight: '1.6', marginBottom: '2rem' }}>
          The vehicle you are searching for might have been acquired by another patron or the reference code is invalid.
        </p>
        <Link
          href="/cars"
          style={{
            padding: '12px 28px',
            background: '#1A1A1A',
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

  return <CarDetailClient car={car} />;
}
