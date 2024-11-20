import React from 'react';

interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

export function Skeleton({ className = '', animate = true }: SkeletonProps) {
  return (
    <div
      className={`
        bg-gray-200 dark:bg-gray-700 rounded
        ${animate ? 'animate-pulse' : ''}
        ${className}
      `}
    />
  );
}

export function BlockSkeleton() {
  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div>
            <Skeleton className="w-24 h-5 mb-2" />
            <Skeleton className="w-32 h-4" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="w-16 h-8" />
          <Skeleton className="w-16 h-8" />
          <Skeleton className="w-16 h-8" />
        </div>
      </div>
    </div>
  );
}

export function TransactionSkeleton() {
  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-5 h-5 rounded-full" />
          <div>
            <Skeleton className="w-32 h-4 mb-2" />
            <Skeleton className="w-48 h-3" />
          </div>
        </div>
        <div>
          <Skeleton className="w-24 h-5 mb-1" />
          <Skeleton className="w-16 h-4" />
        </div>
      </div>
    </div>
  );
}

export function PriceSkeleton() {
  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center space-x-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div>
              <Skeleton className="w-24 h-6 mb-2" />
              <Skeleton className="w-32 h-8" />
            </div>
          </div>
        </div>
        <div className="flex space-x-4">
          <div>
            <Skeleton className="w-20 h-4 mb-1" />
            <Skeleton className="w-24 h-6" />
          </div>
          <div>
            <Skeleton className="w-20 h-4 mb-1" />
            <Skeleton className="w-24 h-6" />
          </div>
        </div>
      </div>
      <Skeleton className="w-full h-[200px]" />
    </div>
  );
}
