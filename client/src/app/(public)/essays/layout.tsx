import React from 'react';

export default function EssaysLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full">
      <div className="container mx-auto max-w-7xl xl:max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8">
        {children}
      </div>
    </div>
  );
}
