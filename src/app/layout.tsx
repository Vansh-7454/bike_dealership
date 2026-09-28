import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, DM_Sans } from 'next/font/google';
import '@/styles/globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#F9F8F5',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://torquemoto.in'),
  title: 'Torque Two-Wheelers | Curated Pre-Owned Motorcycles India',
  description:
    'Experience curated pre-owned two-wheelers in India. Meticulously inspected 120-point certified motorcycles with verified single-owner provenance, warranty, and doorstep test rides.',
  keywords: [
    'Pre-owned motorcycles India',
    'Certified used bikes Mumbai',
    'Used Royal Enfield Hunter 350',
    'Used Classic 350 Bangalore',
    'Second hand bikes Pune',
    'Torque Two-Wheelers',
    'Verified pre-owned bikes India',
  ],
  authors: [{ name: 'Torque Two-Wheelers India' }],
  openGraph: {
    title: 'Torque Two-Wheelers | Curated Pre-Owned Motorcycle Sanctuary',
    description:
      'Meticulously inspected, single-owner pre-owned motorcycles presented with engineering transparency across India.',
    type: 'website',
    locale: 'en_IN',
    images: [
      {
        url: '/images/bikes/hunter_350_hero.jpg',
        width: 1376,
        height: 768,
        alt: 'Torque Two-Wheelers Curated Motorcycle Showroom',
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
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
