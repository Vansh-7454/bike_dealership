import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Concierge Buying Experience | Aureus Motors Dealership',
  description:
    'Discover the bespoke Aureus buying experience: private salon viewings, doorstep vehicle appraisals, transparent digital paperwork, and lifetime relationship management.',
  openGraph: {
    title: 'The Aureus Experience | Tailored Automotive Acquisition',
    description:
      'Immerse in a redefined automobile purchase experience featuring private viewing suites, certified doorstep test drives, and total legal indemnity.',
    type: 'website',
  },
};

export default function ExperienceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
