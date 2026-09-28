import React from 'react';
import styles from './ValuePillars.module.css';

export const ValuePillars: React.FC = () => {
  const pillars = [
    {
      step: '01',
      title: '120-Point Motorcycle Audit',
      description: 'Chassis & fork laser alignment, engine cylinder compression, chain-sprocket life, and electricals certified by senior technicians.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
    {
      step: '02',
      title: 'Verified 1st Owner Provenance',
      description: 'Guaranteed non-accidental history with complete authorized OEM dealer service records and legal indemnity bond.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="8" r="5" />
          <path d="M20 21a8 8 0 0 0-16 0" />
        </svg>
      ),
    },
    {
      step: '03',
      title: '7-Day Exchange Privilege',
      description: 'Ride with total confidence. If your acquired motorcycle fails to delight you within 7 days, exchange it for another in our collection.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          <path d="M3 21v-5h5" />
        </svg>
      ),
    },
    {
      step: '04',
      title: '6-Month Powertrain Warranty',
      description: 'Comprehensive mechanical coverage safeguarding your engine block, gearbox, fuel pump, and alternator stator assembly.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="certification" className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <span className="eyebrow-badge">THE TORQUE BENCHMARK</span>
          <h2 className={styles.headline}>
            A relentless commitment to <em>motorcycle integrity</em>.
          </h2>
          <p className={styles.subheadline}>
            Every motorcycle in our inventory represents the top tier of pre-owned two-wheelers inspected across our diagnostic bays.
          </p>
        </div>

        <div className={styles.grid}>
          {pillars.map((pillar) => (
            <div key={pillar.step} className={styles.pillarCard}>
              <div className={styles.cardHeader}>
                <div className={styles.iconBox}>{pillar.icon}</div>
                <span className={styles.stepNumber}>{pillar.step}</span>
              </div>
              <h3 className={styles.cardTitle}>{pillar.title}</h3>
              <p className={styles.cardDesc}>{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuePillars;
