import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Showroom Concierge & Advisory | Contact Aureus Motors',
  description:
    'Connect with Aureus Motors. Schedule private studio visits, book doorstep test drives, or speak directly with our senior automotive relationship managers across India.',
  openGraph: {
    title: 'Contact Aureus Motors | Flagship Showroom & Concierge',
    description:
      'Reach our client concierge at BKC Mumbai, Aerocity Delhi NCR, and Indiranagar Bengaluru. Inquire about vehicle provenance or schedule private viewings.',
    type: 'website',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
