import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact & Studio Visit | Torque Two-Wheelers',
  description:
    'Connect with Torque Two-Wheelers. Schedule motorcycle inspections, book certified test rides, or speak directly with our pre-owned motorcycle specialists across India.',
  openGraph: {
    title: 'Contact Torque Two-Wheelers | Moto Studio & Rider Advisory',
    description:
      'Reach our rider advisors in Bengaluru, Delhi NCR, and Pune. Inquire about motorcycle provenance, reserve a test ride, or value your existing bike.',
    type: 'website',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
