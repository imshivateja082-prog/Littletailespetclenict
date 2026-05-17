'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Dog, Calendar, Bell, MessageSquare,
  LogOut, Menu, ChevronRight, HeartPulse, Settings,
} from 'lucide-react';
import { getInitials } from '@/lib/utils';

const sidebarLinks = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/pets', label: 'My Pets', icon: Dog },
  { href: '/dashboard/appointments', label: 'Appointments', icon: Calendar },
  { href: '/dashboard/reminders', label: 'Reminders', icon: Bell },
  { href: '/dashboard/ai-assistant', label: 'AI Assistant', icon: MessageSquare },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const markMounted = () => setMounted(true);
    markMounted();
  }, []);

  // During SSR or before mount, render a loading skeleton
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
                <div className="flex items-center gap-1">
                  <HeartPulse size={9} className="text-[#E53935]" />
                  <span className="text-[9px] text-[#5F6B7A] font-medium">Pet Clinic</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-50 text-[#1565C0] border border-blue-100'
                      : 'text-[#5F6B7A] hover:bg-[#F5F7FA] hover:text-[#1A2332]'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={20} />
                  <span>{link.label}</span>
                  {isActive && <ChevronRight size={16} className="ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-[#DDE3EC]">
            {user && (
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1565C0] to-[#42A5F5] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
                  {getInitials(user.firstName, user.lastName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A2332] truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-[#5F6B7A] truncate">{user.email}</p>
                </div>
              </div>
            )}
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
            <div>
              <h1 className="text-lg font-bold text-[#1A2332]">
                {sidebarLinks.find(l => l.href === pathname)?.label || 'Dashboard'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/reminders"
              className="p-2.5 rounded-xl hover:bg-blue-50 transition-colors text-[#5F6B7A] relative"
            >
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#E53935] rounded-full"></span>
            </Link>
            {user && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1565C0] to-[#42A5F5] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {getInitials(user.firstName, user.lastName)}
              </div>
            )}
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
