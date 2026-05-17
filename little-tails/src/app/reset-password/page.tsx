'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Lock, Eye, EyeOff, HeartPulse, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenError, setTokenError] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setTokenError('No reset token found. Please request a new reset link.');
      return;
    }
    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(data => {
        setTokenValid(data.valid);
        if (!data.valid) setTokenError(data.error || 'Invalid or expired link');
      })
      .catch(() => {
        setTokenValid(false);
        setTokenError('Could not validate token');
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => router.push('/login'), 2500);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-400', 'bg-yellow-400', 'bg-green-500'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50/40 to-white relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />

      <div
        className="relative w-full max-w-md mx-4"
        style={{ animation: 'fadeUp 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-500/8 border border-blue-100 p-8 sm:p-10">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image src="/logo.png" alt="Little Tails" width={44} height={44} className="rounded-xl" />
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
          </div>

          {/* Loading state */}
          {tokenValid === null && (
            <div className="text-center py-8 space-y-3">
              <div className="w-10 h-10 mx-auto border-4 border-blue-100 border-t-[#1565C0] rounded-full animate-spin" />
              <p className="text-sm text-[#5F6B7A]">Validating your link...</p>
            </div>
          )}

          {/* Invalid token */}
          {tokenValid === false && (
            <div
              className="text-center space-y-4 py-4"
              style={{ animation: 'popIn 0.4s ease both' }}
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center">
                <XCircle size={32} className="text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1A2332]">Link Invalid</h2>
                <p className="text-sm text-[#5F6B7A] mt-1">{tokenError}</p>
              </div>
              <Link
                href="/forgot-password"
                className="inline-block px-5 py-2.5 rounded-xl bg-[#1565C0] text-white text-sm font-semibold hover:bg-[#1251A3] transition-all duration-200 hover:shadow-lg"
              >
                Request New Link
              </Link>
            </div>
          )}

          {/* Valid token — show form */}
          {tokenValid === true && !success && (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Lock size={24} className="text-[#1565C0]" />
                </div>
                <h1 className="text-xl font-bold text-[#1A2332]">Set New Password</h1>
                <p className="text-sm text-[#5F6B7A] mt-1">Choose a strong password for your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                  <Input
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<Lock size={16} />}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-[38px] text-[#5F6B7A] hover:text-[#1565C0] transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  {/* Strength bar */}
                  {password && (
                    <div className="mt-2 space-y-1" style={{ animation: 'fadeUp 0.3s ease both' }}>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${strengthColor[strength]}`}
                          style={{ width: `${(strength / 3) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-[#5F6B7A]">
                        Strength: <span className="font-semibold">{strengthLabel[strength]}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <Input
                    label="Confirm Password"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    icon={<Lock size={16} />}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(p => !p)}
                    className="absolute right-3 top-[38px] text-[#5F6B7A] hover:text-[#1565C0] transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  {confirm && password !== confirm && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                <Button type="submit" className="w-full" size="lg" loading={loading}>
                  Reset Password
                </Button>
              </form>
            </>
          )}

          {/* Success */}
          {success && (
            <div
              className="text-center space-y-4 py-4"
              style={{ animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1A2332]">Password Reset!</h2>
                <p className="text-sm text-[#5F6B7A] mt-1">Redirecting you to login...</p>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-[#5F6B7A] hover:text-[#1565C0] transition-colors">
              Back to Login
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-100 border-t-[#1565C0] rounded-full animate-spin" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
