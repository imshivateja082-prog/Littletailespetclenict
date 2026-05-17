'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Mail, Lock, User, Phone, Eye, EyeOff, HeartPulse } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      toast.success('Welcome to Little Tails! 🐾');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50/40 to-white relative overflow-hidden py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 gradient-mesh"></div>
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>

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
            <h1 className="text-2xl font-bold text-[#1A2332]">Create Account</h1>
            <p className="text-sm text-[#5F6B7A] mt-2">Join Little Tails and start managing your pet&apos;s health</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                icon={<User size={18} />}
                required
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                required
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              icon={<Mail size={18} />}
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="Your phone number"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              icon={<Phone size={18} />}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 characters"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
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

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              icon={<Lock size={18} />}
              required
            />

            <div className="flex items-start gap-2">
              <input type="checkbox" className="w-4 h-4 mt-0.5 rounded border-[#DDE3EC] text-[#1565C0] focus:ring-[#1565C0]" required />
              <span className="text-sm text-[#5F6B7A]">
                I agree to the{' '}
                <a href="#" className="text-[#1565C0] hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-[#1565C0] hover:underline">Privacy Policy</a>
              </span>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create Account
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-[#5F6B7A] mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#1565C0] font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
