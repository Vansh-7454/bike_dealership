import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Curated Pre-Owned Motorcycle Inventory | Torque Two-Wheelers India',
  description:
    'Explore our verified inventory of thoroughly inspected pre-owned motorcycles. Filter by brand, motorcycle category, displacement, and price.',
  openGraph: {
    title: 'Curated Pre-Owned Motorcycle Inventory | Torque Two-Wheelers',
    description:
      'Explore verified pre-owned motorcycles with 120-point mechanical audits and transparent single-owner provenance.',
    type: 'website',
  },
};

export default function BikesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
