import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sell Your Car | Direct Valuation & Instant Settlement | Aureus Motors',
  description:
    'Sell or exchange your pre-owned car with absolute certainty. Transparent institutional algorithmic valuation, complimentary doorstep inspection, and instant RTGS disbursement.',
  openGraph: {
    title: 'Sell Your Car | Aureus Motors Institutional Direct Acquisition',
    description:
      'Sell your pre-owned vehicle with zero haggling, free doorstep inspection, and complete legal RC transfer indemnity.',
    type: 'website',
  },
};

export default function SellYourCarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
