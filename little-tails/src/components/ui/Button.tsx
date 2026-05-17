'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]';
  
  const variants = {
    primary: 'bg-[#1565C0] hover:bg-[#0D47A1] text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/25 focus:ring-[#1565C0]',
    secondary: 'bg-[#E53935] hover:bg-[#C62828] text-white shadow-lg shadow-red-500/20 focus:ring-[#E53935]',
    outline: 'border-2 border-[#1565C0] text-[#1565C0] hover:bg-[#1565C0] hover:text-white focus:ring-[#1565C0]',
    ghost: 'text-[#5F6B7A] hover:bg-blue-50 hover:text-[#1565C0] focus:ring-[#1565C0]',
    danger: 'bg-[#E53935] hover:bg-[#C62828] text-white shadow-lg shadow-red-500/20 focus:ring-[#E53935]',
    success: 'bg-[#2E7D32] hover:bg-[#1B5E20] text-white shadow-lg shadow-green-500/20 focus:ring-[#2E7D32]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-2.5 text-sm gap-2',
    lg: 'px-8 py-3.5 text-base gap-2',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}
