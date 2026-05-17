'use client';

import React from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FFFFFF',
              color: '#1A2332',
              border: '1px solid #DDE3EC',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '14px',
              boxShadow: '0 10px 25px rgba(21, 101, 192, 0.08)',
            },
            success: {
              iconTheme: {
                primary: '#2E7D32',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#E53935',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
