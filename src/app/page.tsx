'use client';

import React, { useState, useEffect } from 'react';
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
  const [heroBike, setHeroBike] = useState<any>(HERO_SHOWCASE_BIKE);
  const [isTestRideOpen, setIsTestRideOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedTestRideBike, setSelectedTestRideBike] = useState<any>(HERO_SHOWCASE_BIKE);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailBike, setSelectedDetailBike] = useState<IBike | null>(null);

  // Fetch real motorcycle record from active MongoDB database on load
  useEffect(() => {
    let isMounted = true;
    fetch('/api/bikes')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data?.bikes || data.bikes.length === 0) return;
        // Prioritize Royal Enfield Classic 350 or featured available bike
        const classic = data.bikes.find(
          (b: any) =>
            b.model?.toLowerCase().includes('classic 350') &&
            b.status === 'Available'
        );
        const featured =
          classic ||
          data.bikes.find((b: any) => b.featured && b.status === 'Available') ||
          data.bikes[0];

        if (featured) {
          const resolvedBike = {
            ...featured,
            id: featured._id || featured.id,
            images: [
              '/images/bikes/classic_350_isolated.png',
              ...(featured.images || []),
            ],
          };
          setHeroBike(resolvedBike);
          setSelectedTestRideBike(resolvedBike);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOpenTestRide = (bike?: any) => {
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

  const handleOpenDetail = (bike: IBike) => {
    setSelectedDetailBike(bike);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
  };

  const handleBookFromDetail = (bike: IBike) => {
    setIsDetailModalOpen(false);
    handleOpenTestRide(bike);
  };

  return (
    <main className="min-h-screen">
      {/* Global Navbar */}
      <Navbar onOpenTestRide={() => handleOpenTestRide(heroBike)} />

      {/* Editorial Motorcycle Hero */}
      <EditorialBikeHero
        bike={heroBike}
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
