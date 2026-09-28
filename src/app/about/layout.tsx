import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Heritage & Philosophy | Aureus Motors Dealership India',
  description:
    'Learn about Aureus Motors—redefining the pre-owned automotive journey with uncompromising inspection standards, complete provenance transparency, and client-first concierge service.',
  openGraph: {
    title: 'About Aureus Motors | Automotive Integrity & Craftsmanship',
    description:
      'Curating and restoring pre-owned automobiles to peak standards. Discover our philosophy, mechanical ethos, and heritage.',
    type: 'website',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
