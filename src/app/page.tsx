'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { EditorialBikeHero } from '@/components/hero/EditorialBikeHero';
import { ValuePillars } from '@/components/showcase/ValuePillars';
import { FeaturedBikeSpotlight } from '@/components/showcase/FeaturedBikeSpotlight';
import { BikeCollectionPreview } from '@/components/showcase/BikeCollectionPreview';
import { BikeDetailModal } from '@/components/showcase/BikeDetailModal';
import { TestRideModal } from '@/components/common/TestRideModal';
import { BrandStoryTestimonials } from '@/components/showcase/BrandStoryTestimonials';
import { Footer } from '@/components/layout/Footer';
import { IBike } from '@/types';
import { HERO_SHOWCASE_BIKE } from '@/data/showcaseBike';

export default function HomePage() {
  const [heroBike, setHeroBike] = useState<IBike>(HERO_SHOWCASE_BIKE);
  const [heroBikes, setHeroBikes] = useState<IBike[]>([]);
  const [isTestRideOpen, setIsTestRideOpen] = useState(false);
  const [selectedTestRideBike, setSelectedTestRideBike] = useState<IBike>(HERO_SHOWCASE_BIKE);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailBike, setSelectedDetailBike] = useState<IBike | null>(null);

  // Fetch real motorcycle inventory from active MongoDB database on load
  useEffect(() => {
    let isMounted = true;
    fetch('/api/bikes')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data?.bikes || data.bikes.length === 0) return;

        // Filter for available bikes and remove any pulsar references
        const availableBikes = data.bikes.filter((b: IBike) => {
          const key = (b.slug || b.model || b.title || '').toLowerCase();
          return b.status === 'Available' && !key.includes('pulsar');
        });
        const bikeList: IBike[] = availableBikes.length > 0
          ? availableBikes
          : data.bikes.filter((b: IBike) => !(b.slug || b.model || '').toLowerCase().includes('pulsar'));

        // Prioritize Royal Enfield Classic 350 as the initial featured bike
        const sortedBikes = [...bikeList].sort((a: IBike, b: IBike) => {
          const aIsClassic = a.model?.toLowerCase().includes('classic 350');
          const bIsClassic = b.model?.toLowerCase().includes('classic 350');
          if (aIsClassic && !bIsClassic) return -1;
          if (!aIsClassic && bIsClassic) return 1;
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });

        // Deduplicate bikes strictly by slug/model
        const seen = new Set<string>();
        const mappedBikes: IBike[] = [];
        for (const b of sortedBikes) {
          const key = (b.slug || b.model || b.title || '').toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            mappedBikes.push({
              ...b,
              id: b._id || b.id,
            });
          }
        }

        setHeroBikes(mappedBikes);

        const initial = mappedBikes[0];
        if (initial) {
          setHeroBike(initial);
          setSelectedTestRideBike(initial);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenTestRide = (bike?: IBike | null) => {
    if (bike) {
      setSelectedTestRideBike(bike);
    } else {
      setSelectedTestRideBike(heroBike || HERO_SHOWCASE_BIKE);
    }
    setIsTestRideOpen(true);
  };

  const handleCloseTestRide = () => {
    setIsTestRideOpen(false);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedDetailBike(null);
  };

  const handleBookFromDetail = (bike: IBike) => {
    setIsDetailModalOpen(false);
    handleOpenTestRide(bike);
  };

  const handleActiveBikeChange = useCallback((bike: IBike) => {
    setHeroBike((prev) => (prev?.id === bike.id || prev?._id === bike.id ? prev : bike));
    setSelectedTestRideBike((prev) => (prev?.id === bike.id || prev?._id === bike.id ? prev : bike));
  }, []);

  return (
    <main className="min-h-screen">
      {/* Global Navbar */}
      <Navbar onOpenTestRide={() => handleOpenTestRide(heroBike)} />

      {/* Editorial Motorcycle Hero with Auto-Rotation */}
      <EditorialBikeHero
        bike={heroBike}
        bikes={heroBikes}
        onActiveBikeChange={handleActiveBikeChange}
        onBookTestRide={(bike) => handleOpenTestRide(bike || heroBike)}
      />

      {/* 120-Point Motorcycle Certification & Trust Standards */}
      <ValuePillars />

      {/* Immersive Featured Motorcycle Spotlight */}
      <FeaturedBikeSpotlight
        bike={heroBike}
        onBookTestRide={(bike) => handleOpenTestRide(bike || heroBike)}
      />

      {/* Curated Collection with Indian Market Bikes */}
      <BikeCollectionPreview />

      {/* Rider Patron Endorsements & Sell Invitation */}
      <BrandStoryTestimonials />

      {/* Global Footer */}
      <Footer />

      {/* Interactive Motorcycle Detail Presentation Modal */}
      <BikeDetailModal
        bike={selectedDetailBike}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetail}
        onBookTestRide={handleBookFromDetail}
      />

      {/* Interactive Test-Ride Modal */}
      <TestRideModal
        isOpen={isTestRideOpen}
        onClose={handleCloseTestRide}
        bike={selectedTestRideBike}
      />
    </main>
  );
}
