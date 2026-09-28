import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sell Your Bike | Instant Valuation & Doorstep Payout | Torque Two-Wheelers',
  description:
    'Sell or exchange your pre-owned motorcycle with absolute certainty. Algorithmic valuation, free doorstep 120-point inspection, and instant RTGS bank disbursement.',
  openGraph: {
    title: 'Sell Your Bike | Torque Two-Wheelers Direct Acquisition',
    description:
      'Sell your pre-owned motorcycle with zero haggling, free doorstep inspection, and complete legal RC transfer indemnity.',
    type: 'website',
  },
};

export default function SellYourBikeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
