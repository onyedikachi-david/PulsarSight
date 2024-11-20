import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200,
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 -translate-y-2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 translate-y-2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 -translate-x-2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 translate-x-2 ml-2',
  };

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <div
        ref={tooltipRef}
        className={`
          absolute z-50 pointer-events-none
          ${positionStyles[position]}
          transition-all duration-200
          ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'}
          ${className}
        `}
      >
        <div className="
          px-2 py-1 text-xs font-medium
          bg-gray-900 dark:bg-gray-700 text-white
          rounded shadow-lg backdrop-blur-sm
          border border-gray-800/10 dark:border-white/10
        ">
          {content}
        </div>
      </div>
    </div>
  );
}
