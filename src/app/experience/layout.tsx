import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Acquisition Experience | Torque Two-Wheelers India',
  description:
    'Discover the bespoke Torque two-wheeler acquisition journey: curated digital dossiers, forensic technical inspection, doorstep test rides, transparent financing, and the ride-away handover.',
  openGraph: {
    title: 'The Torque Experience | Tailored Motorcycle Acquisition',
    description:
      'Immerse in a redefined motorcycle purchase experience featuring doorstep test rides, certified mechanical dossiers, and total legal title indemnity.',
    type: 'website',
  },
};

export default function ExperienceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
