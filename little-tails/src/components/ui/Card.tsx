'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export default function Card({ children, className, style, hover = false, padding = 'md', onClick }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      style={style}
      className={cn(
        'bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]',
        paddings[padding],
        hover && 'card-hover cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
