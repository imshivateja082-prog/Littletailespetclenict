'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Calendar, Dog, Users, Pill,
  LogOut, Menu, ChevronRight, Shield, Bell, PawPrint
} from 'lucide-react';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/appointments', label: 'Appointments', icon: Calendar },
  { href: '/admin/pets', label: 'All Pets', icon: Dog },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/medicine', label: 'Medicine Stock', icon: Pill },
  { href: '/admin/reminders', label: 'WhatsApp Reminders', icon: Bell },
  { href: '/admin/offline-pets', label: 'Offline Pets', icon: PawPrint, badge: 'NEW' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout, loading } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const markMounted = () => setMounted(true);
    markMounted();
  }, []);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-[#DDE3EC]"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#1565C0] animate-spin"></div>
          </div>
          <p className="text-[#5F6B7A]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#DDE3EC] transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto shadow-lg shadow-blue-500/5 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[#DDE3EC]">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Little Tails Logo"
                width={40}
                height={40}
                className="rounded-xl"
              />
              <div>
                <span className="text-xl font-bold text-[#1A2332] font-[Fredoka]">
                  Little<span className="text-[#1565C0]">Tails</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <Shield size={10} className="text-[#E53935]" />
                  <span className="text-[10px] text-[#E53935] font-bold tracking-wide">ADMIN PANEL</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {adminLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium group ${
                    isActive
                      ? 'bg-blue-50 text-[#1565C0] border border-blue-100 shadow-sm'
                      : 'text-[#5F6B7A] hover:bg-[#F5F7FA] hover:text-[#1A2332]'
                  }`}
                  style={{ transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon
                    size={20}
                    className={isActive ? 'text-[#1565C0]' : 'transition-transform duration-200 group-hover:scale-110'}
                  />
                  <span>{link.label}</span>
                  {'badge' in link && link.badge && !isActive && (
                    <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#1565C0] to-[#42A5F5] text-white animate-pulse">
                      {link.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight size={16} className="ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* Admin Profile */}
          <div className="p-4 border-t border-[#DDE3EC]">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E53935] to-[#EF5350] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-red-500/20">
                  GK
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A2332] truncate">
                    Dr. Ganesh Kumar
                  </p>
                  <p className="text-xs text-[#E53935] font-semibold">B.V.Sc &amp; A.H</p>
                </div>
              </div>
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 mt-2 rounded-xl text-sm font-medium text-[#E53935] hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-[#DDE3EC] px-4 lg:px-8 h-16 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-blue-50 transition-colors text-[#1A2332]"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold text-[#1A2332]">
              {adminLinks.find(l => l.href === pathname)?.label || 'Admin Panel'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#E53935] text-xs font-semibold flex items-center gap-1">
              <Shield size={12} />
              Admin
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
