'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';
import { Button } from '@/components/common/Button';

interface NavbarProps {
  onOpenTestRide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTestRide }) => {
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
    { label: 'Bikes', href: '/bikes' },
    { label: 'Sell Bike', href: '/sell-your-bike' },
    { label: 'Experience', href: '/experience' },
    { label: 'About', href: '/about' },
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
            <span className={styles.monogramLetter}>T</span>
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandName}>TORQUE</span>
            <span className={styles.brandTag}>TWO-WHEELERS · PRE-OWNED</span>
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
          <div className={styles.locationBadge} title="Torque Indiranagar Flagship Studio Open">
            <span className={styles.statusDot}></span>
            <span>Indiranagar Studio Open</span>
          </div>

          <Link
            href="/admin/login"
            className={styles.adminLoginBtn}
            id="nav-admin-login-btn"
            title="Dealership Admin Portal"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Admin</span>
          </Link>

          <div className={styles.desktopCta}>
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenTestRide}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              }
            >
              Book Test Ride
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
              onOpenTestRide?.();
            }}
          >
            Book a Test Ride
          </Button>
          <Link href="/admin/login" className={styles.mobileAdminLink} onClick={handleLinkClick}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Dealership Admin Login</span>
          </Link>
          <div>
            <p className={styles.mobileContactText}>Rider Concierge Line</p>
            <a href="tel:+919820086778" className={styles.mobileContactNumber}>
              +91 98200 TORQUE (86778)
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
