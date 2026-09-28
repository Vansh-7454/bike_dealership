import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div className={styles.brandCol}>
            <div className={styles.brandLogo}>
              <div className={styles.brandMonogram}>
                <span className={styles.monogramLetter}>T</span>
              </div>
              <span className={styles.brandName}>TORQUE TWO-WHEELERS</span>
            </div>
            <p className={styles.brandDesc}>
              India’s premier pre-owned motorcycle sanctuary. Every two-wheeler certified through our forensic 120-point mechanical evaluation with verified single-owner pedigree.
            </p>
          </div>

          <div>
            <h4 className={styles.colTitle}>Inventory</h4>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}><Link href="/bikes">Curated Motorcycles</Link></li>
              <li className={styles.linkItem}><Link href="/sell-your-bike">Sell Your Bike Instantly</Link></li>
              <li className={styles.linkItem}><Link href="/experience">The Acquisition Journey</Link></li>
              <li className={styles.linkItem}><Link href="/about">120-Point Inspection Standards</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.colTitle}>Experience Centers</h4>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}><Link href="/contact">Mumbai Flagship (BKC)</Link></li>
              <li className={styles.linkItem}><Link href="/contact">Bengaluru (Indiranagar)</Link></li>
              <li className={styles.linkItem}><Link href="/contact">Delhi NCR (Gurugram)</Link></li>
              <li className={styles.linkItem}><Link href="/contact">Pune (Koregaon Park)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.colTitle}>Rider Concierge</h4>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}><a href="tel:+919820086778">+91 98200 TORQUE (86778)</a></li>
              <li className={styles.linkItem}><a href="mailto:concierge@torquemoto.in">concierge@torquemoto.in</a></li>
              <li className={styles.linkItem}><Link href="/about">6-Month Engine Warranty</Link></li>
              <li className={styles.linkItem}><Link href="/contact">Book Studio Test Ride</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} Torque Two-Wheelers India Private Limited. All rights reserved.</p>
          <div className={styles.bottomLinks}>
            <a href="#">Privacy Policy</a>
            <a href="#">120-Point Audit Protocols</a>
            <a href="#">Rider Warranty Terms</a>
            <Link href="/admin/login" style={{ color: 'var(--color-accent-copper)', fontWeight: 600 }}>Dealer Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
