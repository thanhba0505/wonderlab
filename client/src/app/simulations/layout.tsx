import React from 'react';

export default function SimulationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full py-8">
      <div className="container mx-auto max-w-7xl xl:max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12">
        {children}
      </div>
    </div>
  );
}
