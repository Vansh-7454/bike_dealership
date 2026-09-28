import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Curated Pre-Owned Cars Inventory | Aureus Motors India',
  description:
    'Explore our curated inventory of thoroughly inspected pre-owned luxury and executive vehicles. Filter by make, fuel type, transmission, and body style.',
  openGraph: {
    title: 'Curated Pre-Owned Inventory | Aureus Motors',
    description:
      'Explore verified pre-owned automobiles with 160-point mechanical audits and transparent provenance history.',
    type: 'website',
  },
};

export default function CarsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
