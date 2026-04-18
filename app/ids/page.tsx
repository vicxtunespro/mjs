'use client';

// pages/id-cards.tsx (for Pages Router)
import React from 'react';
import dynamic from 'next/dynamic';
import type { NextPage } from 'next';

const IDCardGenerator = dynamic(
  () => import('@/components/ids/IDCardGenerator'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-cta-low border-t-cta rounded-full animate-spin"></div>
          <p className="text-foreground font-medium">Loading ID Card Generator...</p>
        </div>
      </div>
    ),
  }
);

const IDCardsPage: NextPage = () => {
  return <IDCardGenerator />;
};

export default IDCardsPage;