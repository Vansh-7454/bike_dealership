import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';
import '@/styles/globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#FAF9F6',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://aureusmotors.in'),
  title: 'Aureus Motors | Curated Pre-Owned Automotive Sanctuary India',
  description:
    'Experience curated pre-owned automotive refinement in India. Meticulously inspected 160-point certified executive & luxury vehicles with verified provenance.',
  keywords: [
    'Pre-owned luxury cars India',
    'Certified used cars Mumbai',
    'Used luxury SUV India',
    'Aureus Motors',
    'Verified pre-owned cars Bengaluru',
    'Electric SUV pre-owned',
  ],
  authors: [{ name: 'Aureus Motors India' }],
  openGraph: {
    title: 'Aureus Motors | Curated Pre-Owned Automotive Sanctuary',
    description:
      'Meticulously inspected, single-owner luxury and executive automobiles presented with total transparency across India.',
    type: 'website',
    locale: 'en_IN',
    images: [
      {
        url: '/images/car_xuv700_showroom.jpg',
        width: 1376,
        height: 768,
        alt: 'Aureus Motors Curated Showroom',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${playfairDisplay.variable}`}>
      <body>{children}</body>
    </html>
  );
}
