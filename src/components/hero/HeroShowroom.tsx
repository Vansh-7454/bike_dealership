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

const TURNTABLE_START = 5.0; // Seconds in car_animation.mp4 where 360 turntable starts
const TURNTABLE_DURATION = 4.95; // Duration of full 360 rotation

export const HeroShowroom: React.FC<HeroShowroomProps> = ({
  car = HERO_SHOWCASE_CAR,
  onBookTestDrive,
  onExploreCollection,
}) => {
  // Video and Playback State
  const [isPlayingInitial, setIsPlayingInitial] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Drag 360 Orbit State
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number>(0);
  const currentRotationFraction = useRef<number>(0); // 0 to 1
  const rafRef = useRef<number | null>(null);

  // DOM References
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const lightGlintRef = useRef<HTMLDivElement>(null);
  const floorShadowRef = useRef<HTMLDivElement>(null);
  const headlightGlowRef = useRef<HTMLDivElement>(null);

  // Auto-play video on mount
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn('[Aureus Motors] Video autoplay:', err);
      });
    }
  }, []);

  // Update progress bar during playback
  const handleTimeUpdate = () => {
    if (videoRef.current && isPlayingInitial && videoRef.current.duration) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(progress);
    }
  };

  // Video reaches end -> Car is parked head-on in showroom, enable 360 drag
  const handleVideoEnded = () => {
    setIsPlayingInitial(false);
    currentRotationFraction.current = 0; // Settled head-on
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 10.0;
    }

    if (cameraRef.current) {
      gsap.fromTo(
        cameraRef.current,
        { scale: 1.025 },
        { scale: 1, duration: 1.2, ease: 'power2.out' }
      );
    }
  };

  // Skip video straight to 360 interactive mode
  const handleSkipVideo = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsPlayingInitial(false);
    currentRotationFraction.current = 0;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 10.0;
    }
  };

  // Replay initial cinematic unveil
  const handleReplayVideo = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsPlayingInitial(true);
    setVideoProgress(0);
    currentRotationFraction.current = 0;
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch((err) => console.warn(err));
    }
  };

  // ===================================================================
  // 360° DRAG ORBIT ON FULL 1080P VIDEO
  // ===================================================================

  const handlePointerDown = (clientX: number) => {
    setIsDragging(true);
    setHasInteracted(true);
    dragStartX.current = clientX;

    // If still playing initial video, pause to allow user control
    if (isPlayingInitial && videoRef.current) {
      setIsPlayingInitial(false);
      videoRef.current.pause();
    }
  };

  const handlePointerMove = useCallback((clientX: number) => {
    if (!isDragging) return;
    const deltaX = clientX - dragStartX.current;
    dragStartX.current = clientX;

    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1440;
    const sensitivity = 1.1;
    const fractionDelta = (deltaX / screenWidth) * sensitivity;

    let newFraction = (currentRotationFraction.current - fractionDelta) % 1;
    if (newFraction < 0) newFraction += 1;
    currentRotationFraction.current = newFraction;

    if (videoRef.current) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (videoRef.current) {
          // Map 0..1 to 5.0s..9.95s (exact 360 turntable sequence in 1080p video)
          videoRef.current.currentTime = TURNTABLE_START + (newFraction * TURNTABLE_DURATION);
        }
      });
    }
  }, [isDragging]);

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // ===================================================================
  // FULL-SCREEN 3D PERSPECTIVE MOUSE TRACKING
  // ===================================================================

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setHasInteracted(true);

    if (isDragging) {
      handlePointerMove(e.clientX);
    }

    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const ratioX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const ratioY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    // Smooth, calibrated 3D perspective angles
    const yawY = (ratioX - 0.5) * 10;
    const transX = (ratioX - 0.5) * 14;
    const rollZ = (ratioX - 0.5) * -0.4;
    const pitchX = -(ratioY - 0.5) * 6;
    const transY = (ratioY - 0.5) * 10;

    if (cameraRef.current) {
      gsap.to(cameraRef.current, {
        rotateX: pitchX,
        rotateY: yawY,
        rotateZ: rollZ,
        x: transX,
        y: transY,
        duration: 0.65,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    if (lightGlintRef.current) {
      gsap.to(lightGlintRef.current, {
        x: e.clientX,
        y: e.clientY,
        opacity: 0.45,
        duration: 0.45,
        ease: 'power1.out',
        overwrite: 'auto',
      });
    }

    if (floorShadowRef.current) {
      gsap.to(floorShadowRef.current, {
        x: (ratioX - 0.5) * 14,
        y: (ratioY - 0.5) * 4,
        scaleX: 1 - Math.abs(ratioX - 0.5) * 0.04,
        duration: 0.65,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    if (headlightGlowRef.current) {
      gsap.to(headlightGlowRef.current, {
        x: (ratioX - 0.5) * -8,
        opacity: 0.85 - Math.abs(ratioX - 0.5) * 0.25,
        duration: 0.65,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }
  };

  const handleMouseLeave = () => {
    handlePointerUp();

    if (cameraRef.current) {
      gsap.to(cameraRef.current, {
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        x: 0,
        y: 0,
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

  // Touch Handlers for Mobile Orbit
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handlePointerDown(e.touches[0].clientX);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0 && stageRef.current) {
      handlePointerMove(e.touches[0].clientX);
    }
  };

  const formatPrice = (price: number) => {
    const lakhs = (price / 100000).toFixed(2);
    return `₹${lakhs} Lakh`;
  };

  return (
    <section id="showroom" className={styles.heroSection}>
      {/* 1. FULL-SCREEN 3D SHOWROOM THEATER STAGE (EDGE-TO-EDGE BACKGROUND) */}
      <div
        ref={stageRef}
        className={`${styles.fullScreenStage} ${isDragging ? styles.fullScreenStageGrabbing : ''}`}
        onMouseDown={(e) => handlePointerDown(e.clientX)}
        onMouseMove={handleMouseMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={handlePointerUp}
      >
        {/* 3D Camera Rig */}
        <div ref={cameraRef} className={styles.cameraRig}>
          {/* Full-Bleed 1080p Native Showroom Video */}
          <video
            ref={videoRef}
            src="/videos/car_animation.mp4"
            poster="/images/hero_curtain_start.jpg"
            className={styles.heroVideo}
            playsInline
            muted
            autoPlay
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
          />

          {/* Dynamic Lighting Layers */}
          <div ref={floorShadowRef} className={styles.floorShadow3D} />
          <div ref={lightGlintRef} className={styles.lightGlint} />
          <div ref={headlightGlowRef} className={styles.headlightGlow} />
        </div>

        {/* Contrast Gradients for edge framing */}
        <div className={styles.gradientTop} />
        <div className={styles.gradientBottom} />

        {/* Interactive 360 Orbit Hint (Visible when user hasn't dragged yet) */}
        {!isPlayingInitial && (
          <div className={`${styles.orbitHintPill} ${hasInteracted ? styles.orbitHintPillHidden : ''}`}>
            <span>⟲ Drag to orbit 360°</span>
          </div>
        )}
      </div>

      {/* 2. TOP RIGHT CONTROLS (Skip video or Replay reveal) */}
      <div className={styles.topControls}>
        {isPlayingInitial ? (
          <button
            type="button"
            className={styles.controlBtn}
            onClick={handleSkipVideo}
            title="Skip to 360° interactive view"
          >
            <span>Skip to 360° Orbit</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            className={styles.controlBtn}
            onClick={handleReplayVideo}
            title="Replay cinematic curtain unveil"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M1 4v6h6" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            <span>Replay Unveil</span>
          </button>
        )}
      </div>

      {/* 3. CLEAN, RESPONSIVE LUXURY DOCK OVERLAY */}
      <div className={styles.heroOverlay}>
        {/* Semantic H1 for SEO compliance without visual clutter over car */}
        <h1 className={styles.srOnly}>
          Aureus Motors — Luxury Pre-Owned Digital Showroom: {car.title}
        </h1>

        {/* Bottom Floating Sanctuary Dock */}
        <div className={styles.bottomDock}>
          <div className={styles.vehicleMeta}>
            <h2 className={styles.vehicleTitle}>{car.title}</h2>
            <div className={styles.vehicleSubtitle}>
              <span>{car.year} Model</span>
              <span>•</span>
              <span>{car.transmission}</span>
              <span>•</span>
              <span>{car.locationCity}</span>
              <span>•</span>
              <span>{(car.mileageKm || 0).toLocaleString('en-IN')} km</span>
            </div>
          </div>

          <div className={styles.priceMeta}>
            <span className={styles.priceLabel}>SANCTUARY VALUATION</span>
            <span className={styles.priceValue}>{formatPrice(car.price)}</span>
          </div>

          <div className={styles.actionButtons}>
            <Button
              variant="primary"
              size="md"
              onClick={() => onBookTestDrive?.(car)}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              }
            >
              Experience Test Drive
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={onExploreCollection}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              }
            >
              Explore Collection
            </Button>
          </div>
        </div>
      </div>

      {/* Video Progress Bar (Visible during initial reveal) */}
      {isPlayingInitial && (
        <div
          className={styles.videoProgressBar}
          style={{ width: `${videoProgress}%` }}
        />
      )}
    </section>
  );
};
