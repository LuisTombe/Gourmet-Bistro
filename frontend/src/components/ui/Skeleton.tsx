import React from 'react';

export const SkeletonBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    aria-hidden="true"
    className={`animate-pulse rounded-2xl bg-[#fdedea]/85 border border-[#e7dcdb]/60 ${className}`}
  />
);

export const ViewSkeleton: React.FC<{ cards?: number }> = ({ cards = 6 }) => (
  <div
    role="status"
    aria-label="Cargando vista..."
    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
  >
    <div className="flex items-center justify-between border-b border-[#e7dcdb] pb-5">
      <div className="space-y-2.5">
        <SkeletonBlock className="h-4 w-36 rounded-full" />
        <SkeletonBlock className="h-10 w-72" />
      </div>
      <SkeletonBlock className="h-11 w-40 rounded-full" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonBlock key={i} className="h-28 w-full" />
      ))}
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: cards }).map((_, i) => (
        <SkeletonBlock key={i} className="h-56 w-full" />
      ))}
    </div>
  </div>
);

