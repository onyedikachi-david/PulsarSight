import React from 'react'

interface SkeletonProps {
  className?: string
  animate?: boolean
}

export function Skeleton({ className = '', animate = true }: SkeletonProps) {
  return (
    <div
      className={`
        rounded bg-gray-200 dark:bg-gray-700
        ${animate ? 'animate-pulse' : ''}
        ${className}
      `}
    />
  )
}

export function BlockSkeleton() {
  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="size-10 rounded-lg" />
          <div>
            <Skeleton className="mb-2 h-5 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  )
}

export function TransactionSkeleton() {
  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="size-5 rounded-full" />
          <div>
            <Skeleton className="mb-2 h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div>
          <Skeleton className="mb-1 h-5 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  )
}

export function PriceSkeleton() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <Skeleton className="size-10 rounded-lg" />
            <div>
              <Skeleton className="mb-2 h-6 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        </div>
        <div className="flex space-x-4">
          <div>
            <Skeleton className="mb-1 h-4 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div>
            <Skeleton className="mb-1 h-4 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </div>
      <Skeleton className="h-[200px] w-full" />
    </div>
  )
}
