'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Mail, Lock, Eye, EyeOff, HeartPulse, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back! 🐾');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50/40 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 gradient-mesh"></div>
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      <div className="absolute top-1/4 left-10 opacity-5">
        <Stethoscope size={120} className="text-[#1565C0]" />
      </div>

      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-500/8 border border-blue-100 p-8 sm:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <Image
                src="/logo.png"
                alt="Little Tails Logo"
                width={48}
                height={48}
                className="rounded-xl"
              />
              <div>
                <span className="text-2xl font-bold text-[#1A2332] font-[Fredoka]">
                  Little<span className="text-[#1565C0]">Tails</span>
                </span>
                <div className="flex items-center gap-1">
                  <HeartPulse size={10} className="text-[#E53935]" />
                  <span className="text-[9px] text-[#5F6B7A] font-medium">Pet Clinic</span>
                </div>
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-[#1A2332]">Welcome Back!</h1>
            <p className="text-sm text-[#5F6B7A] mt-2">Sign in to manage your pet&apos;s health</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={18} />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-[#5F6B7A] hover:text-[#1565C0] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-[#DDE3EC] text-[#1565C0] focus:ring-[#1565C0]" />
                <span className="text-sm text-[#5F6B7A]">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-[#1565C0] hover:underline">Forgot password?</Link>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          {/* Register Link */}
          <p className="text-center text-sm text-[#5F6B7A] mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#1565C0] font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
