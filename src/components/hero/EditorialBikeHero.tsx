'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import styles from './EditorialBikeHero.module.css';
import { IBike } from '@/types';

export interface EditorialBikeHeroProps {
  bike?: IBike | null;
  bikes?: IBike[];
  onBookTestRide?: (bike?: IBike | null) => void;
  onActiveBikeChange?: (bike: IBike) => void;
}

export interface SpotlightBike {
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
  slug?: string;
  rawBike?: IBike;
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
    slug: 'royal-enfield-classic-350-stealth-black-2022',
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
    slug: 'royal-enfield-hunter-350-dapper-ash-2023',
  },
  {
    id: 'spotlight-ktm-duke-390',
    tabLabel: '03 390 Duke',
    brand: 'KTM',
    model: '390 Duke',
    variant: 'Cornering ABS Quickshifter+',
    year: 2023,
    kilometers: 6400,
    engineCC: 373.2,
    ownership: '1st Owner',
    price: 245000,
    image: '/images/bikes/ktm_duke_390_isolated.png',
    slug: 'ktm-390-duke-electronic-orange-2023',
  },
  {
    id: 'spotlight-yamaha-fzs',
    tabLabel: '04 FZ-S FI V4',
    brand: 'Yamaha',
    model: 'FZ-S FI',
    variant: 'Version 4.0 Deluxe',
    year: 2023,
    kilometers: 6100,
    engineCC: 149,
    ownership: '1st Owner',
    price: 98000,
    image: '/images/bikes/yamaha_fzs_isolated.png',
    slug: 'yamaha-fzs-fi-v4-matte-navy-2023',
  },
  {
    id: 'spotlight-tvs-raider',
    tabLabel: '05 Raider 125',
    brand: 'TVS',
    model: 'Raider 125',
    variant: 'Split Seat Disc',
    year: 2023,
    kilometers: 5300,
    engineCC: 124.8,
    ownership: '1st Owner',
    price: 76000,
    image: '/images/bikes/tvs_raider_isolated.png',
    slug: 'tvs-raider-125-fiery-yellow-2023',
  },
];

// Helper to resolve clean transparent image for any bike
function resolveBikeImage(bike: IBike): string {
  const isolatedImg = bike.images?.find(
    (img) => (img.includes('_isolated') || img.includes('_cutout')) && !img.includes('pulsar')
  );
  if (isolatedImg) return isolatedImg;

  const mLower = (bike.model || bike.title || '').toLowerCase();
  if (mLower.includes('classic 350')) return '/images/bikes/classic_350_isolated.png';
  if (mLower.includes('hunter 350')) return '/images/bikes/hunter_350_isolated.png';
  if (mLower.includes('ktm') || mLower.includes('duke') || mLower.includes('390')) return '/images/bikes/ktm_duke_390_isolated.png';
  if (mLower.includes('fz') || mLower.includes('yamaha')) return '/images/bikes/yamaha_fzs_isolated.png';
  if (mLower.includes('raider') || mLower.includes('tvs')) return '/images/bikes/tvs_raider_isolated.png';

  const cleanFallback = bike.images?.find((img) => !img.includes('pulsar'));
  return cleanFallback || '/images/bikes/classic_350_isolated.png';
}

export const EditorialBikeHero: React.FC<EditorialBikeHeroProps> = ({
  bike,
  bikes,
  onBookTestRide,
  onActiveBikeChange,
}) => {
  const [activeSpotlightIndex, setActiveSpotlightIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timerKey, setTimerKey] = useState(0);

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

  const isTransitioningRef = useRef(false);

  // Dynamic spotlight list derived from API/DB bikes or default spotlights
  const spotlights: SpotlightBike[] = useMemo(() => {
    let sourceBikes: IBike[] = [];
    if (bikes && bikes.length > 0) {
      const seen = new Set<string>();
      sourceBikes = bikes.filter((b) => {
        const key = (b.slug || b.model || b.title || '').toLowerCase();
        if (key.includes('pulsar')) return false;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    if (sourceBikes.length > 0) {
      return sourceBikes.map((b, idx) => {
        const indexStr = String(idx + 1).padStart(2, '0');
        const image = resolveBikeImage(b);
        const cc =
          b.engineCC ||
          b.specs?.engineCc ||
          b.specifications?.engineCc ||
          (b.specs as unknown as { engineCC?: number })?.engineCC ||
          350;

        return {
          id: b._id || b.id || `spotlight-${idx}`,
          tabLabel: `${indexStr} ${b.model || b.title}`,
          brand: b.brand,
          model: b.model,
          variant: b.variant || '',
          year: b.year,
          kilometers: b.kilometers,
          engineCC: cc,
          ownership: b.ownership || '1st Owner',
          price: b.price,
          image,
          slug: b.slug,
          rawBike: b,
        };
      });
    }

    if (bike && !(bike.slug || bike.model || '').toLowerCase().includes('pulsar')) {
      const image = resolveBikeImage(bike);
      const cc =
        bike.engineCC ||
        bike.specs?.engineCc ||
        bike.specifications?.engineCc ||
        (bike.specs as unknown as { engineCC?: number })?.engineCC ||
        350;

      const single: SpotlightBike = {
        id: bike._id || bike.id || 'spotlight-0',
        tabLabel: `01 ${bike.model || bike.title}`,
        brand: bike.brand,
        model: bike.model,
        variant: bike.variant || '',
        year: bike.year,
        kilometers: bike.kilometers,
        engineCC: cc,
        ownership: bike.ownership || '1st Owner',
        price: bike.price,
        image,
        slug: bike.slug,
        rawBike: bike,
      };

      const others = DEFAULT_SPOTLIGHTS.filter(
        (s) => !s.model.toLowerCase().includes((bike.model || '').toLowerCase())
      );
      return [single, ...others];
    }

    return DEFAULT_SPOTLIGHTS;
  }, [bikes]);

  // Current active spotlight
  const currentSpotlight = spotlights[activeSpotlightIndex] || spotlights[0] || DEFAULT_SPOTLIGHTS[0];

  const displayBrand = currentSpotlight.brand;
  const displayModel = currentSpotlight.model;
  const displayYear = currentSpotlight.year;
  const displayKm = currentSpotlight.kilometers.toLocaleString('en-IN');
  const displayCc = currentSpotlight.engineCC;
  const displayOwnership = (currentSpotlight.ownership || '1st Owner').toUpperCase();
  const displayPrice = currentSpotlight.price.toLocaleString('en-IN');
  const displayImage = currentSpotlight.image;

  // Active bike payload for test-ride modal and parent callbacks
  const currentBikePayload = useMemo(() => {
    return {
      _id: currentSpotlight.rawBike?._id || currentSpotlight.id,
      id: currentSpotlight.rawBike?.id || currentSpotlight.rawBike?._id || currentSpotlight.id,
      title: `${displayBrand} ${displayModel}`,
      brand: displayBrand,
      model: displayModel,
      variant: currentSpotlight.variant,
      year: displayYear,
      price: currentSpotlight.price,
      kilometers: currentSpotlight.kilometers,
      engineCC: currentSpotlight.engineCC,
      ownership: currentSpotlight.ownership,
      images: [displayImage, ...(currentSpotlight.rawBike?.images || [])],
      slug: currentSpotlight.slug,
    };
  }, [currentSpotlight, displayBrand, displayModel, displayYear, displayImage]);

  const onActiveBikeChangeRef = useRef(onActiveBikeChange);
  useEffect(() => {
    onActiveBikeChangeRef.current = onActiveBikeChange;
  });

  const lastNotifiedSlugRef = useRef<string | null>(null);

  // Notify parent of active bike changes only when active bike slug actually changes
  useEffect(() => {
    const slug = currentSpotlight?.slug || currentSpotlight?.id;
    if (slug && slug !== lastNotifiedSlugRef.current && onActiveBikeChangeRef.current) {
      lastNotifiedSlugRef.current = slug;
      onActiveBikeChangeRef.current(currentBikePayload as unknown as IBike);
    }
  }, [activeSpotlightIndex, currentBikePayload, currentSpotlight?.id, currentSpotlight?.slug]);

  // Preload all spotlight images in advance for zero-flash transitions
  useEffect(() => {
    spotlights.forEach((item) => {
      if (typeof window !== 'undefined' && item.image) {
        const preloadImg = new window.Image();
        preloadImg.src = item.image;
      }
    });
  }, [spotlights]);

  // 1. Initial Choreographed Entrance Animation
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(
          [
            brandIdentifierRef.current,
            editorialLeadRef.current,
            headlineRef.current,
            backdropWordRef.current,
            motorcycleWrapperRef.current,
            specsBlockRef.current,
            priceBlockRef.current,
            buttonGroupRef.current,
            bottomBarRef.current,
          ],
          { opacity: 1, y: 0, x: 0, scale: 1 }
        );
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
      tl.to(backdropWordRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.85,
      })
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
      gsap.to(motorcycleImageRef.current, {
        y: -10,
        duration: 3.2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

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
      // Do not fight active transitions
      if (isTransitioningRef.current) return;

      const { innerWidth, innerHeight } = window;
      const normX = (e.clientX / innerWidth - 0.5) * 2;
      const normY = (e.clientY / innerHeight - 0.5) * 2;

      if (backdropWordRef.current) {
        gsap.to(backdropWordRef.current, {
          x: normX * -12,
          y: normY * -8,
          duration: 0.8,
          ease: 'power1.out',
        });
      }

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
  const transitionToBike = useCallback(
    (nextIndex: number) => {
      if (nextIndex === activeSpotlightIndex || isTransitioningRef.current) return;
      isTransitioningRef.current = true;

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (
        prefersReducedMotion ||
        !motorcycleWrapperRef.current ||
        !specsBlockRef.current ||
        !priceBlockRef.current
      ) {
        setActiveSpotlightIndex(nextIndex);
        isTransitioningRef.current = false;
        return;
      }

      // Out transition: dynamic slide out with cinematic motion blur and shadow contraction
      const tlOut = gsap.timeline({
        defaults: { ease: 'power2.in' },
        onComplete: () => {
          setActiveSpotlightIndex(nextIndex);
          setTimerKey((k) => k + 1);

          if (
            !motorcycleWrapperRef.current ||
            !specsBlockRef.current ||
            !priceBlockRef.current
          ) {
            isTransitioningRef.current = false;
            return;
          }

          // In transition: luxury entrance from right with blur resolving into sharpness
          const tlIn = gsap.timeline({
            defaults: { ease: 'power3.out' },
            onComplete: () => {
              if (motorcycleWrapperRef.current) {
                gsap.set(motorcycleWrapperRef.current, { clearProps: 'filter' });
              }
              if (specsBlockRef.current) {
                gsap.set(specsBlockRef.current, { clearProps: 'filter' });
              }
              if (priceBlockRef.current) {
                gsap.set(priceBlockRef.current, { clearProps: 'filter' });
              }
              isTransitioningRef.current = false;
            },
          });

          tlIn
            .fromTo(
              motorcycleWrapperRef.current,
              { opacity: 0, x: 75, scale: 1.03, filter: 'blur(16px)' },
              { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)', duration: 0.38 }
            )
            .fromTo(
              contactShadowRef.current,
              { opacity: 0, scaleX: 0.5 },
              { opacity: 0.65, scaleX: 1, duration: 0.38 },
              '<'
            )
            .fromTo(
              specsBlockRef.current,
              { opacity: 0, y: -10, filter: 'blur(6px)' },
              { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.3, ease: 'power2.out' },
              '-=0.28'
            )
            .fromTo(
              priceBlockRef.current,
              { opacity: 0, y: 12, scale: 0.93, filter: 'blur(6px)' },
              { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.32, ease: 'back.out(1.2)' },
              '-=0.24'
            );
        },
      });

      tlOut
        .to(motorcycleWrapperRef.current, {
          opacity: 0,
          x: -75,
          scale: 0.94,
          filter: 'blur(14px)',
          duration: 0.2,
        })
        .to(
          contactShadowRef.current,
          {
            opacity: 0,
            scaleX: 0.5,
            duration: 0.2,
          },
          '<'
        )
        .to(
          [specsBlockRef.current, priceBlockRef.current],
          {
            opacity: 0,
            y: 6,
            filter: 'blur(4px)',
            duration: 0.15,
            stagger: 0.02,
          },
          '-=0.14'
        );
    },
    [activeSpotlightIndex]
  );

  // 5. Automatic Continuous Rotation: switches available bikes every 2.2 seconds
  useEffect(() => {
    if (spotlights.length <= 1) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      if (!isTransitioningRef.current) {
        const nextIndex = (activeSpotlightIndex + 1) % spotlights.length;
        transitionToBike(nextIndex);
      }
    }, 2200);

    return () => clearInterval(interval);
  }, [activeSpotlightIndex, spotlights.length, timerKey, transitionToBike]);

  // Optional Keyboard Arrow Navigation (Left/Right arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (!isTransitioningRef.current && spotlights.length > 1) {
          const prev = (activeSpotlightIndex - 1 + spotlights.length) % spotlights.length;
          transitionToBike(prev);
          setTimerKey((k) => k + 1);
        }
      } else if (e.key === 'ArrowRight') {
        if (!isTransitioningRef.current && spotlights.length > 1) {
          const next = (activeSpotlightIndex + 1) % spotlights.length;
          transitionToBike(next);
          setTimerKey((k) => k + 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSpotlightIndex, spotlights.length, transitionToBike]);

  // Explore button href corresponding to the currently displayed bike
  const exploreHref = currentSpotlight.slug
    ? `/bikes/${currentSpotlight.slug}`
    : currentSpotlight.id && currentSpotlight.id.length > 10
    ? `/bikes/${currentSpotlight.id}`
    : `/bikes`;

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

          {/* Layer 3: Dominant Unclipped Motorcycle Visual (No Card, No Border, Seamless) */}
          <div
            ref={motorcycleWrapperRef}
            className={styles.motorcycleWrapper}
            onClick={() => onBookTestRide?.(currentBikePayload as unknown as IBike)}
            title={`Click to book a test ride on ${displayBrand} ${displayModel}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onBookTestRide?.(currentBikePayload as unknown as IBike);
              }
            }}
            aria-label={`Book test ride on ${displayBrand} ${displayModel}`}
          >
            <Image
              ref={motorcycleImageRef}
              src={displayImage}
              alt={`Certified Pre-Owned ${displayBrand} ${displayModel} ${currentSpotlight.variant || ''}`.trim()}
              width={1376}
              height={768}
              priority={activeSpotlightIndex === 0}
              className={styles.motorcycleImage}
            />
            <div ref={contactShadowRef} className={styles.contactShadow} />
          </div>

          {/* Right Asymmetric Action & Dynamic Bike Metadata */}
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
                href={exploreHref}
                className={styles.primaryCta}
                id="hero-explore-bikes-btn"
                aria-label={`Explore details for ${displayBrand} ${displayModel}`}
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
