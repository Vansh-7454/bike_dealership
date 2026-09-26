'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';
import { Button } from '@/components/common/Button';

interface NavbarProps {
  onOpenTestDrive?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTestDrive }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Cars', href: '/cars' },
    { label: 'Sell Your Car', href: '/sell-your-car' },
    { label: 'About', href: '/about' },
    { label: 'Experience', href: '/experience' },
    { label: 'Contact', href: '/contact' },
  ];

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        {/* Brand Wordmark & Monogram */}
        <Link href="/" className={styles.brand} onClick={handleLinkClick}>
          <div className={styles.brandMonogram}>
            <span className={styles.monogramLetter}>A</span>
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandName}>AUREUS</span>
            <span className={styles.brandTag}>MOTORS · PRE-OWNED</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main Navigation">
          <ul className={styles.navLinks}>
            {navItems.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className={styles.navLink}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right Section */}
        <div className={styles.navRight}>
          <div className={styles.locationBadge} title="Mumbai Flagship Studio Active">
            <span className={styles.statusDot}></span>
            <span>Studio Open · Mumbai</span>
          </div>

          <div className={styles.desktopCta}>
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenTestDrive}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              }
            >
              Book Test Drive
            </Button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            className={`${styles.mobileToggle} ${mobileMenuOpen ? styles.mobileToggleOpen : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <div className={styles.hamburgerIcon}>
              <span className={styles.hamburgerBar}></span>
              <span className={styles.hamburgerBar}></span>
              <span className={styles.hamburgerBar}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`${styles.mobileDrawer} ${mobileMenuOpen ? styles.mobileDrawerOpen : ''}`}>
        <ul className={styles.mobileNavLinks}>
          {navItems.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className={styles.mobileNavLink} onClick={handleLinkClick}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.mobileDrawerFooter}>
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenTestDrive?.();
            }}
          >
            Book a Test Drive
          </Button>
          <div>
            <p className={styles.mobileContactText}>Client Advisory Concierge</p>
            <a href="tel:+919820028738" className={styles.mobileContactNumber}>
              +91 98200 AUREUS (28738)
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
