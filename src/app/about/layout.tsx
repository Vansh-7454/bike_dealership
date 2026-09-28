import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Heritage & Philosophy | Torque Two-Wheelers India',
  description:
    'Learn about Torque Two-Wheelers—redefining the pre-owned motorcycle journey in India with forensic 120-point inspection standards, complete provenance transparency, and rider-first concierge service.',
  openGraph: {
    title: 'About Torque Two-Wheelers | Motorcycle Integrity & Engineering Ethos',
    description:
      'Curating pre-owned motorcycles to peak engineering standards. Discover our philosophy, mechanical ethos, and rider compact.',
    type: 'website',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
