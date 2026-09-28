'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import styles from './EditorialBikeHero.module.css';
import { IBike } from '@/types';

interface EditorialBikeHeroProps {
  bike?: IBike | null;
  onBookTestRide?: (bike?: IBike | null) => void;
}

interface SpotlightBike {
  id: string;
  tabLabel: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  kilometers: number;
  engineCC: number;
  ownership: string;
  price: number;
  image: string;
}

const DEFAULT_SPOTLIGHTS: SpotlightBike[] = [
  {
    id: 'spotlight-classic-350',
    tabLabel: '01 Classic 350',
    brand: 'Royal Enfield',
    model: 'Classic 350',
    variant: 'Stealth Black Dark Edition',
    year: 2022,
    kilometers: 11400,
    engineCC: 349,
    ownership: '1st Owner',
    price: 178000,
    image: '/images/bikes/classic_350_isolated.png',
  },
  {
    id: 'spotlight-hunter-350',
    tabLabel: '02 Hunter 350',
    brand: 'Royal Enfield',
    model: 'Hunter 350',
    variant: 'Dapper Ash Dual Channel ABS',
    year: 2023,
    kilometers: 7200,
    engineCC: 349,
    ownership: '1st Owner',
    price: 148000,
    image: '/images/bikes/hunter_350_isolated.png',
  },
];

export const EditorialBikeHero: React.FC<EditorialBikeHeroProps> = ({
  bike,
  onBookTestRide,
}) => {
  const [activeSpotlightIndex, setActiveSpotlightIndex] = useState(0);

  // References for GSAP animations
  const sectionRef = useRef<HTMLElement>(null);
  const brandIdentifierRef = useRef<HTMLDivElement>(null);
  const editorialLeadRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const backdropWordRef = useRef<HTMLDivElement>(null);
  const motorcycleWrapperRef = useRef<HTMLDivElement>(null);
  const motorcycleImageRef = useRef<HTMLImageElement>(null);
  const contactShadowRef = useRef<HTMLDivElement>(null);
  const specsBlockRef = useRef<HTMLDivElement>(null);
  const priceBlockRef = useRef<HTMLDivElement>(null);
  const buttonGroupRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);

  // Merge database bike with spotlights
  const currentSpotlight = DEFAULT_SPOTLIGHTS[activeSpotlightIndex] || DEFAULT_SPOTLIGHTS[0];

  const displayBrand = bike?.brand && activeSpotlightIndex === 0 ? bike.brand : currentSpotlight.brand;
  const displayModel = bike?.model && activeSpotlightIndex === 0 ? bike.model : currentSpotlight.model;
  const displayYear = bike?.year && activeSpotlightIndex === 0 ? bike.year : currentSpotlight.year;
  const displayKm = (bike?.kilometers && activeSpotlightIndex === 0 ? bike.kilometers : currentSpotlight.kilometers).toLocaleString('en-IN');
  const displayCc = bike?.engineCC && activeSpotlightIndex === 0 ? bike.engineCC : currentSpotlight.engineCC;
  const displayOwnership = (bike?.ownership && activeSpotlightIndex === 0 ? bike.ownership : currentSpotlight.ownership) || '1st Owner';
  const displayPrice = (bike?.price && activeSpotlightIndex === 0 ? bike.price : currentSpotlight.price).toLocaleString('en-IN');
  const displayImage = currentSpotlight.image;

  // Active bike object for test-ride modal callback
  const currentBikePayload = {
    _id: bike?._id || currentSpotlight.id,
    id: bike?.id || bike?._id || currentSpotlight.id,
    title: `${displayBrand} ${displayModel}`,
    brand: displayBrand,
    model: displayModel,
    year: displayYear,
    price: bike?.price && activeSpotlightIndex === 0 ? bike.price : currentSpotlight.price,
    images: [displayImage],
  };

  // 1. Initial Choreographed Entrance Animation
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set([
          brandIdentifierRef.current,
          editorialLeadRef.current,
          headlineRef.current,
          backdropWordRef.current,
          motorcycleWrapperRef.current,
          specsBlockRef.current,
          priceBlockRef.current,
          buttonGroupRef.current,
          bottomBarRef.current,
        ], { opacity: 1, y: 0, x: 0, scale: 1 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Initial States
      gsap.set(backdropWordRef.current, { opacity: 0, y: 50, scale: 0.98 });
      gsap.set([brandIdentifierRef.current, editorialLeadRef.current], { opacity: 0, y: -18 });
      gsap.set(headlineRef.current, { opacity: 0, y: 40, clipPath: 'inset(100% 0% 0% 0%)' });
      gsap.set(motorcycleWrapperRef.current, { opacity: 0, x: 50, scale: 0.93 });
      gsap.set(specsBlockRef.current, { opacity: 0, y: 18 });
      gsap.set(priceBlockRef.current, { opacity: 0, scale: 0.9, y: 15 });
      gsap.set(buttonGroupRef.current, { opacity: 0, y: 15 });
      gsap.set(bottomBarRef.current, { opacity: 0 });

      // Sequenced Timeline
      tl
        // 1. Background word appears
        .to(backdropWordRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.85,
        })
        // 2. Top bar elements
        .to(
          [brandIdentifierRef.current, editorialLeadRef.current],
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
          },
          '-=0.6'
        )
        // 3. Main headline reveals
        .to(
          headlineRef.current,
          {
            opacity: 1,
            y: 0,
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 0.8,
            ease: 'power3.out',
          },
          '-=0.45'
        )
        // 4. Motorcycle glides into center stage
        .to(
          motorcycleWrapperRef.current,
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.95,
            ease: 'power3.out',
          },
          '-=0.6'
        )
        // 5. Specs & Price
        .to(
          [specsBlockRef.current, priceBlockRef.current],
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.55,
            stagger: 0.1,
          },
          '-=0.45'
        )
        // 6. Buttons & Bottom Transition Bar
        .to(
          [buttonGroupRef.current, bottomBarRef.current],
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
          },
          '-=0.3'
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // 2. Continuous Idle Floating / Breathing Animation on Motorcycle
  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Subtle continuous floating motion
      gsap.to(motorcycleImageRef.current, {
        y: -10,
        duration: 3.2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      // Synchronized shadow breathing
      gsap.to(contactShadowRef.current, {
        scaleX: 0.94,
        opacity: 0.65,
        duration: 3.2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // 3. Multi-Layer Mouse Parallax (Desktop Only)
  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const normX = (e.clientX / innerWidth - 0.5) * 2; // -1 to +1
      const normY = (e.clientY / innerHeight - 0.5) * 2; // -1 to +1

      // Layer 1: Background oversized typography (moves subtly opposite)
      if (backdropWordRef.current) {
        gsap.to(backdropWordRef.current, {
          x: normX * -12,
          y: normY * -8,
          duration: 0.8,
          ease: 'power1.out',
        });
      }

      // Layer 3: Foreground motorcycle (moves forward to create physical separation)
      if (motorcycleWrapperRef.current) {
        gsap.to(motorcycleWrapperRef.current, {
          x: normX * 15,
          y: normY * 10,
          duration: 0.65,
          ease: 'power1.out',
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 4. Smooth Transition When Switching Spotlight Bikes
  const handleSpotlightSelect = (index: number) => {
    if (index === activeSpotlightIndex) return;

    // Animate current visual out smoothly
    gsap.to([motorcycleImageRef.current, specsBlockRef.current, priceBlockRef.current], {
      opacity: 0,
      y: 10,
      scale: 0.96,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        setActiveSpotlightIndex(index);
        // Animate new motorcycle in
        gsap.fromTo(
          [motorcycleImageRef.current, specsBlockRef.current, priceBlockRef.current],
          { opacity: 0, y: -10, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power2.out' }
        );
      },
    });
  };

  return (
    <section
      ref={sectionRef}
      className={styles.heroSection}
      aria-label="Torque Motors Curated Motorcycle Showcase"
    >
      <div className={styles.ambientStudioGlow} />
      <div className={styles.architecturalGrid} />

      <div className={styles.heroInner}>
        {/* =================================================================
            TOP ROW: BRAND IDENTIFIER & EDITORIAL STATEMENT
            ================================================================= */}
        <div className={styles.topRow}>
          <div ref={brandIdentifierRef} className={styles.brandIdentifier}>
            <div className={styles.brandWordmark}>
              <span>TORQUE MOTORS</span>
              <span className={styles.brandAccentDot} />
            </div>
            <span className={styles.brandSubtitle}>
              CURATED TWO-WHEELERS · EDITION 2026
            </span>
          </div>

          <p ref={editorialLeadRef} className={styles.editorialLeadText}>
            Experience certified two-wheeler provenance engineered for power,
            mechanical honesty, and freedom. Inspected across 120 forensic
            checkpoints for city riding and highway touring.
          </p>
        </div>

        {/* =================================================================
            MAIN EDITORIAL HEADLINE
            ================================================================= */}
        <div className={styles.headlineContainer}>
          <h1 ref={headlineRef} className={styles.headline}>
            FIND YOUR NEXT RIDE.
          </h1>
        </div>

        {/* =================================================================
            CENTRAL STAGE: OVERSIZED BACKGROUND WORD & FLOATING MOTORCYCLE
            ================================================================= */}
        <div className={styles.stageContainer}>
          {/* Layer 1: Massive Background Architectural Typography */}
          <div
            ref={backdropWordRef}
            className={styles.backdropWord}
            aria-hidden="true"
          >
            PRE-OWNED
          </div>

          {/* Layer 3: Dominant Unclipped Motorcycle Visual */}
          <div
            ref={motorcycleWrapperRef}
            className={styles.motorcycleWrapper}
            onClick={() => onBookTestRide?.(currentBikePayload as unknown as IBike)}
            title={`Click to book a test ride on ${displayBrand} ${displayModel}`}
          >
            <img
              ref={motorcycleImageRef}
              src={displayImage}
              alt={`Certified Pre-Owned ${displayBrand} ${displayModel} ${currentSpotlight.variant}`}
              className={styles.motorcycleImage}
              loading="eager"
            />
            <div ref={contactShadowRef} className={styles.contactShadow} />
          </div>

          {/* Right Asymmetric Action & Live Database Data */}
          <div className={styles.actionCluster}>
            <div ref={specsBlockRef} className={styles.specsBlock}>
              <div className={styles.bikeTitle}>
                {displayBrand} {displayModel}
              </div>
              <div className={styles.bikeMeta}>
                {displayYear} · {displayKm} KM · {displayCc} CC · {displayOwnership}
              </div>
            </div>

            <div ref={priceBlockRef} className={styles.priceBlock}>
              <span className={styles.priceLabel}>PRICE</span>
              <span className={styles.priceValue}>₹{displayPrice}</span>
            </div>

            <div ref={buttonGroupRef} className={styles.buttonGroup}>
              <Link
                href="/bikes"
                className={styles.primaryCta}
                id="hero-explore-bikes-btn"
                aria-label="Explore verified pre-owned motorcycle collection"
              >
                <span>Explore Bikes</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>

              <button
                type="button"
                onClick={() => onBookTestRide?.(currentBikePayload as unknown as IBike)}
                className={styles.secondaryCta}
                id="hero-book-test-ride-btn"
                aria-label={`Book a test ride for ${displayBrand} ${displayModel}`}
              >
                <span>Book a Test Ride</span>
              </button>
            </div>
          </div>
        </div>

        {/* =================================================================
            BOTTOM BAR: SPOTLIGHT SWITCHER & SCROLL TRANSITION
            ================================================================= */}
        <div ref={bottomBarRef} className={styles.bottomBar}>
          <div className={styles.spotlightSelector}>
            {DEFAULT_SPOTLIGHTS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSpotlightSelect(index)}
                className={`${styles.spotlightTab} ${
                  activeSpotlightIndex === index ? styles.spotlightTabActive : ''
                }`}
                aria-label={`View spotlight motorcycle ${item.brand} ${item.model}`}
              >
                <span className={styles.spotlightTabDot} />
                <span>{item.tabLabel}</span>
              </button>
            ))}
          </div>

          <a
            href="#certification"
            className={styles.scrollIndicator}
            aria-label="Scroll down to explore 120-Point Forensic Audit"
          >
            <span>Scroll to Discover 120-Point Audit</span>
            <span className={styles.scrollIndicatorLine} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default EditorialBikeHero;
