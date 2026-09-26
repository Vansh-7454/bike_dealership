'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import styles from './HeroShowroom.module.css';
import { Button } from '@/components/common/Button';
import { ICar } from '@/types';
import { HERO_SHOWCASE_CAR } from '@/data/showcaseCar';

interface HeroShowroomProps {
  car?: ICar;
  onBookTestDrive?: (car: ICar) => void;
  onExploreCollection?: () => void;
}

// 25 High-Definition 1080p Reveal Frames from the attached video
const REVEAL_COUNT = 25;
const REVEAL_FRAMES = Array.from({ length: REVEAL_COUNT }, (_, i) => 
  `/images/hero_360/reveal/reveal_${String(i).padStart(2, '0')}.jpg`
);

// High-resolution front showroom frame (matches reveal_24)
const DIRECT_FRONT_FRAME = '/images/hero_360/turntable/angle_16.jpg';

// 8 Discrete 360° Studio Angles for full drag orbit
const CAR_360_ANGLES = [
  { frame: DIRECT_FRONT_FRAME, label: '0° Front Head-on' },
  { frame: '/images/360/frame_1.jpg', label: '45° Front-Right 3/4' },
  { frame: '/images/360/frame_2.jpg', label: '90° Side Profile (Right)' },
  { frame: '/images/360/frame_3.jpg', label: '135° Rear-Right 3/4' },
  { frame: '/images/360/frame_4.jpg', label: '180° Direct Rear' },
  { frame: '/images/360/frame_5.jpg', label: '225° Rear-Left 3/4' },
  { frame: '/images/360/frame_6.jpg', label: '270° Side Profile (Left)' },
  { frame: '/images/360/frame_7.jpg', label: '315° Front-Left 3/4' },
];

export const HeroShowroom: React.FC<HeroShowroomProps> = ({
  car = HERO_SHOWCASE_CAR,
  onBookTestDrive,
  onExploreCollection,
}) => {
  // Closed curtain initially visible on mount
  const [revealFrameIndex, setRevealFrameIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [curtainStatus, setCurtainStatus] = useState<'closed' | 'opening' | 'opened'>('closed');
  const [hasInteracted, setHasInteracted] = useState(false);

  // 360 Drag Angle state
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Drag tracking refs
  const dragStartX = useRef<number>(0);
  const currentDragAngleRef = useRef<number>(0);
  const dragThreshold = 38; // Damped, smooth drag rotation threshold

  // DOM References
  const showroomStageRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const lightGlintRef = useRef<HTMLDivElement>(null);
  const floorShadowRef = useRef<HTMLDivElement>(null);
  const headlightGlowRef = useRef<HTMLDivElement>(null);

  // Preload all frames on mount for buttery-smooth zero-latency playback
  useEffect(() => {
    REVEAL_FRAMES.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });

    CAR_360_ANGLES.forEach((item) => {
      const img = new window.Image();
      img.src = item.frame;
    });
  }, []);

  // Sync drag ref
  useEffect(() => {
    currentDragAngleRef.current = currentAngleIndex;
  }, [currentAngleIndex]);

  // ===================================================================
  // 1. AUTOMATIC CURTAIN REVEAL WITH DRAMATIC HOLD
  // As requested: "starting m curtain aaye v apne aap khule then y sab ho"
  // ===================================================================
  useEffect(() => {
    // 1. Hold the closed curtain visible for 700ms so user clearly perceives the closed drapery
    const holdTimer = setTimeout(() => {
      setCurtainStatus('opening');

      let frame = 0;
      const intervalMs = 55; // Paced smoothly (~1.35 seconds reveal duration)

      const revealTimer = setInterval(() => {
        frame++;
        if (frame >= REVEAL_COUNT) {
          clearInterval(revealTimer);
          setRevealFrameIndex(REVEAL_COUNT - 1);
          setIsRevealed(true);
          setCurtainStatus('opened');

          // Luxurious subtle camera settle on reveal completion
          if (cameraRef.current) {
            gsap.fromTo(
              cameraRef.current,
              { scale: 1.04 },
              { scale: 1, duration: 1.2, ease: 'power2.out' }
            );
          }
        } else {
          setRevealFrameIndex(frame);
        }
      }, intervalMs);
    }, 700);

    return () => clearTimeout(holdTimer);
  }, []);

  // ===================================================================
  // 360° DRAG & ROTATE HANDLERS
  // ===================================================================

  const handlePointerDown = (clientX: number) => {
    if (!isRevealed) return;
    setIsDragging(true);
    setHasInteracted(true);
    dragStartX.current = clientX;
  };

  const handlePointerMove = useCallback((clientX: number) => {
    if (!isDragging || !isRevealed) return;
    const deltaX = clientX - dragStartX.current;

    if (Math.abs(deltaX) >= dragThreshold) {
      const steps = Math.floor(deltaX / dragThreshold);
      const total = CAR_360_ANGLES.length;
      const newAngle = ((currentDragAngleRef.current - steps) % total + total) % total;

      setCurrentAngleIndex(newAngle);
      currentDragAngleRef.current = newAngle;
      dragStartX.current = clientX;
    }
  }, [isDragging, isRevealed, dragThreshold]);

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // ===================================================================
  // 2. SLOW, SILKY, DAMPED MULTI-AXIS CURSOR 3D TRACKING
  // As requested: "jb cursor se move krte h speed bahut fast h slow kro thda"
  // ===================================================================

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isRevealed || !showroomStageRef.current) return;
    setHasInteracted(true);

    const rect = showroomStageRef.current.getBoundingClientRect();
    const ratioX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));  // 0 to 1
    const ratioY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)); // 0 to 1

    if (isDragging) {
      handlePointerMove(e.clientX);
    }

    // Smooth, calibrated 3D angles with luxurious damping
    // Horizontal Yaw: ±8° smooth turning
    const yawY = (ratioX - 0.5) * 16;
    const transX = (ratioX - 0.5) * 20;
    const rollZ = (ratioX - 0.5) * -0.8;

    // Vertical Pitch: ±6° smooth tilt (Top = Top-down hood view; Bottom = Ground-up stance)
    const pitchX = -(ratioY - 0.5) * 12;
    const transY = (ratioY - 0.5) * 16;
    const scaleVal = 1 + Math.abs(ratioY - 0.5) * 0.02;

    // Slower, heavily damped GSAP animation (duration: 0.75s, power2.out)
    if (cameraRef.current) {
      gsap.to(cameraRef.current, {
        rotateX: pitchX,
        rotateY: yawY,
        rotateZ: rollZ,
        x: transX,
        y: transY,
        scale: scaleVal,
        duration: 0.75, // Slowed down from 0.22s for smooth cinematic gliding
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    // Softly glided Specular Light Glint
    if (lightGlintRef.current) {
      gsap.to(lightGlintRef.current, {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        opacity: 0.6,
        duration: 0.45,
        ease: 'power1.out',
        overwrite: 'auto',
      });
    }

    // Softly glided Ground Shadow
    if (floorShadowRef.current) {
      gsap.to(floorShadowRef.current, {
        x: (ratioX - 0.5) * 20,
        y: (ratioY - 0.5) * 8,
        scaleX: 1 - Math.abs(ratioX - 0.5) * 0.06,
        duration: 0.75,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    // Softly glided Headlight Glow
    if (headlightGlowRef.current) {
      gsap.to(headlightGlowRef.current, {
        x: (ratioX - 0.5) * -15,
        opacity: 0.85 - Math.abs(ratioX - 0.5) * 0.25,
        duration: 0.75,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }
  };

  const handleMouseLeave = () => {
    handlePointerUp();

    // Smoothly and gracefully glide back to center eye contact
    if (cameraRef.current) {
      gsap.to(cameraRef.current, {
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.85,
        ease: 'power2.out',
      });
    }

    if (lightGlintRef.current) {
      gsap.to(lightGlintRef.current, {
        opacity: 0,
        duration: 0.4,
      });
    }

    if (floorShadowRef.current) {
      gsap.to(floorShadowRef.current, {
        x: 0,
        y: 0,
        scaleX: 1,
        duration: 0.85,
      });
    }

    if (headlightGlowRef.current) {
      gsap.to(headlightGlowRef.current, {
        x: 0,
        opacity: 0.7,
        duration: 0.85,
      });
    }
  };

  // Touch handlers for mobile
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handlePointerDown(e.touches[0].clientX);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0 && showroomStageRef.current && isRevealed) {
      const touch = e.touches[0];
      const rect = showroomStageRef.current.getBoundingClientRect();
      const ratioX = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
      const ratioY = Math.max(0, Math.min(1, (touch.clientY - rect.top) / rect.height));

      handlePointerMove(touch.clientX);

      const pitchX = -(ratioY - 0.5) * 12;
      const yawY = (ratioX - 0.5) * 16;

      if (cameraRef.current) {
        gsap.to(cameraRef.current, {
          rotateX: pitchX,
          rotateY: yawY,
          duration: 0.5,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
    }
  };

  // Current active frame source
  const currentImageSrc = !isRevealed
    ? REVEAL_FRAMES[revealFrameIndex]
    : CAR_360_ANGLES[currentAngleIndex].frame;

  const formatPrice = (price: number) => {
    const lakhs = (price / 100000).toFixed(2);
    return `₹${lakhs} Lakh`;
  };

  return (
    <section id="showroom" className={styles.heroSection}>
      <div className={styles.heroAmbientGlow} aria-hidden="true" />

      <div className={styles.heroContent}>
        {/* Top Editorial Header */}
        <div className={styles.heroHeader}>
          <div className={styles.eyebrowContainer}>
            <span className="eyebrow-badge">AUREUS PRE-OWNED AUTOMOTIVE • DIGITAL SHOWROOM</span>
          </div>

          <h1 className={styles.heroHeadline}>
            Meet Your <em>Next Car</em>.
          </h1>

          <p className={styles.heroSubline}>
            Step into our virtual showroom. Move your cursor across the stage to explore in full 3D perspective, or drag horizontally to orbit 360°.
          </p>
        </div>

        {/* SINGLE UNIFIED 3D SHOWROOM THEATER STAGE */}
        <div className={styles.showroomStageContainer}>
          <div
            ref={showroomStageRef}
            className={`${styles.showroomStage} ${isDragging ? styles.showroomStageGrabbing : ''}`}
            onMouseDown={(e) => handlePointerDown(e.clientX)}
            onMouseMove={handleMouseMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={handlePointerUp}
          >
            {/* Dramatic Initial Curtain Hold Badge */}
            {!isRevealed && (
              <div className={styles.curtainHoldOverlay}>
                <div className={styles.curtainHoldBadge}>
                  <span className={styles.curtainHoldDot} />
                  <span>
                    {curtainStatus === 'closed'
                      ? 'AUREUS SHOWROOM • PRESENTING VEHICLE'
                      : 'OPENING SHOWROOM...'}
                  </span>
                </div>
              </div>
            )}

            {/* Camera Viewport with Multi-Layer 3D Depth */}
            <div ref={cameraRef} className={styles.showroomCamera}>
              <div className={styles.frameViewer}>
                <img
                  src={currentImageSrc}
                  alt="Aureus Automotive Showroom"
                  className={styles.frameImage}
                  draggable={false}
                />
              </div>

              {/* Dynamic Ground Shadow beneath vehicle */}
              <div ref={floorShadowRef} className={styles.floorShadow3D} />

              {/* Specular Light Glint: Follows Cursor */}
              <div ref={lightGlintRef} className={styles.lightGlint} />

              {/* Headlight Beam Atmospheric Bloom */}
              <div ref={headlightGlowRef} className={styles.headlightGlow} />
            </div>

            {/* Subtle Interactive Instruction Pill (Auto-fades on user interaction) */}
            {isRevealed && (
              <div className={`${styles.stageGuideBadge} ${hasInteracted ? styles.stageGuideBadgeHidden : ''}`}>
                <span className={styles.guideDot} />
                <span>Move cursor left / right / top / down for real 3D perspective • Drag to rotate 360°</span>
              </div>
            )}
          </div>
        </div>

        {/* Revealed Actions & Specifications Section (Cleanly Visible Below Stage) */}
        <div className={styles.revealedActions}>
          <div className={styles.actionRow}>
            <div className={styles.vehicleMeta}>
              <h2 className={styles.vehicleTitle}>{car.title}</h2>
              <div className={styles.vehicleSubtitle}>
                <span>{car.year} Model</span>
                <span>•</span>
                <span>{car.transmission}</span>
                <span>•</span>
                <span>{car.locationCity}</span>
                <span>•</span>
                <span className="eyebrow-badge" style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem' }}>
                  {car.inspectionSummary.certificationBadge}
                </span>
              </div>
            </div>

            <div className={styles.vehiclePriceTag}>
              <span className={styles.priceLabel}>Aureus Value</span>
              <span className={styles.priceAmount}>{formatPrice(car.price)}</span>
              <span className={styles.priceEmi}>• Est. EMI ₹34,200/mo</span>
            </div>

            <div className={styles.ctaButtons}>
              <Button
                variant="primary"
                size="md"
                onClick={onExploreCollection}
                href="#collection"
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                }
              >
                Explore Inventory
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={() => onBookTestDrive?.(car)}
              >
                Book a Test Drive
              </Button>
            </div>
          </div>

          {/* Quick Specifications Strip */}
          <div className={styles.specsGrid}>
            <div className={styles.specCard}>
              <span className={styles.specLabel}>Odometer / Usage</span>
              <span className={styles.specValue}>{car.mileageKm.toLocaleString()} KM</span>
              <span className={styles.specDetail}>Verified Service Logs</span>
            </div>

            <div className={styles.specCard}>
              <span className={styles.specLabel}>Pedigree & History</span>
              <span className={styles.specValue}>Single Owner</span>
              <span className={styles.specDetail}>{car.registrationState}</span>
            </div>

            <div className={styles.specCard}>
              <span className={styles.specLabel}>Mechanical Audit</span>
              <span className={styles.specValue}>{car.inspectionSummary.passedPoints} / {car.inspectionSummary.totalPointsInspected} Points</span>
              <span className={styles.specDetail}>Passed 100% Comprehensive</span>
            </div>

            <div className={styles.specCard}>
              <span className={styles.specLabel}>Engine & Powertrain</span>
              <span className={styles.specValue}>{car.specs.powerHp} HP • {car.specs.torqueNm} Nm</span>
              <span className={styles.specDetail}>{car.fuelType} • 2.2L mHawk Turbo</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
