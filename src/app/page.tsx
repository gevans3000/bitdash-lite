'use client';

import dynamic from 'next/dynamic';

// Dynamically import the TradingDashboard component with no SSR
const TradingDashboard = dynamic(
  () => import('@/components/TradingDashboard'),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow">
        <TradingDashboard />
      </main>
      <footer className="flex gap-[24px] flex-wrap items-center justify-center p-4">
        {/* Footer content, if any, can go here. The original content seems to be Next.js boilerplate. */}
      </footer>
    </div>
  );
}
