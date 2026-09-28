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
                <span className={styles.monogramLetter}>A</span>
              </div>
              <span className={styles.brandName}>AUREUS MOTORS</span>
            </div>
            <p className={styles.brandDesc}>
              India’s curated pre-owned automotive sanctuary. Every vehicle certified through our proprietary 160-point engineering evaluation.
            </p>
          </div>

          <div>
            <h4 className={styles.colTitle}>Showroom</h4>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}><Link href="/cars">Curated Inventory</Link></li>
              <li className={styles.linkItem}><Link href="/sell-your-car">Sell / Trade-in Vehicle</Link></li>
              <li className={styles.linkItem}><Link href="/experience">The Acquisition Protocol</Link></li>
              <li className={styles.linkItem}><Link href="/about">160-Point Audit Philosophy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.colTitle}>Studios & Concierge</h4>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}><Link href="/contact">Mumbai Flagship (BKC)</Link></li>
              <li className={styles.linkItem}><Link href="/contact">Bengaluru (Indiranagar)</Link></li>
              <li className={styles.linkItem}><Link href="/contact">Delhi NCR (Aerocity)</Link></li>
              <li className={styles.linkItem}><Link href="/contact">Hyderabad (Jubilee Hills)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.colTitle}>Sanctuary Advisory</h4>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}><a href="tel:+919820028738">+91 98200 AUREUS (28738)</a></li>
              <li className={styles.linkItem}><a href="mailto:concierge@aureusmotors.in">concierge@aureusmotors.in</a></li>
              <li className={styles.linkItem}><Link href="/about">Our Provenance Standards</Link></li>
              <li className={styles.linkItem}><Link href="/contact">Book Private Viewing</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} Aureus Motors India Private Limited. All rights reserved.</p>
          <div className={styles.bottomLinks}>
            <a href="#">Privacy Policy</a>
            <a href="#">Audit Protocols</a>
            <a href="#">Terms of Concierge</a>
            <Link href="/admin/login" style={{ color: 'var(--color-primary-400)', fontWeight: 500 }}>Dealer Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
