'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { HeroShowroom } from '@/components/hero/HeroShowroom';
import { ValuePillars } from '@/components/showcase/ValuePillars';
import { FeaturedCarSpotlight } from '@/components/showcase/FeaturedCarSpotlight';
import { CollectionPreview } from '@/components/showcase/CollectionPreview';
import { CarDetailModal } from '@/components/showcase/CarDetailModal';
import { TestDriveModal } from '@/components/common/TestDriveModal';
import { BrandStoryTestimonials } from '@/components/showcase/BrandStoryTestimonials';
import { Footer } from '@/components/layout/Footer';
import { ICar } from '@/types';
import { HERO_SHOWCASE_CAR } from '@/data/showcaseCar';

export default function HomePage() {
  const [isTestDriveOpen, setIsTestDriveOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedTestDriveCar, setSelectedTestDriveCar] = useState<any>(HERO_SHOWCASE_CAR);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailCar, setSelectedDetailCar] = useState<ICar | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOpenTestDrive = (car?: any) => {
    if (car) {
      setSelectedTestDriveCar(car);
    } else {
      setSelectedTestDriveCar(HERO_SHOWCASE_CAR);
    }
    setIsTestDriveOpen(true);
  };

  const handleCloseTestDrive = () => {
    setIsTestDriveOpen(false);
  };

  const handleOpenDetail = (car: ICar) => {
    setSelectedDetailCar(car);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
  };

  const handleBookFromDetail = (car: ICar) => {
    setIsDetailModalOpen(false);
    handleOpenTestDrive(car);
  };

  return (
    <main className="min-h-screen">
      {/* Global Navbar */}
      <Navbar onOpenTestDrive={() => handleOpenTestDrive(HERO_SHOWCASE_CAR)} />

      {/* Hero Showroom Theater: Closed velvet curtains + "Meet Your Next Car" reveal + 360 Turntable */}
      <HeroShowroom
        car={HERO_SHOWCASE_CAR}
        onBookTestDrive={(car) => handleOpenTestDrive(car)}
      />

      {/* 160-Point Audit Standards & Trust Foundation */}
      <ValuePillars />

      {/* Immersive Featured Car Editorial Spotlight */}
      <FeaturedCarSpotlight
        car={HERO_SHOWCASE_CAR}
        onInspect={handleOpenDetail}
        onBookTestDrive={(car) => handleOpenTestDrive(car)}
      />

      {/* Curated Collection with Varied Asymmetrical Rhythm & Distinct Car Photography */}
      <CollectionPreview
        onViewDetails={handleOpenDetail}
        onBookTestDrive={(car) => handleOpenTestDrive(car)}
      />

      {/* Editorial Patron Endorsements & Final Invitation */}
      <BrandStoryTestimonials />

      {/* Global Footer */}
      <Footer />

      {/* Interactive 160-Point Audit & Vehicle Detail Presentation Modal */}
      <CarDetailModal
        car={selectedDetailCar}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetail}
        onBookTestDrive={handleBookFromDetail}
      />

      {/* Interactive Test-Drive Modal */}
      <TestDriveModal
        isOpen={isTestDriveOpen}
        onClose={handleCloseTestDrive}
        car={selectedTestDriveCar}
      />
    </main>
  );
}
