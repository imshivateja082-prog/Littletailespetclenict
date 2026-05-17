'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Mail, HeartPulse, ArrowLeft, CheckCircle2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devUrl, setDevUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSent(true);
      if (data.devResetUrl) setDevUrl(data.devResetUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

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
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
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

          {!sent ? (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Mail size={26} className="text-[#1565C0]" />
                </div>
                <h1 className="text-xl font-bold text-[#1A2332]">Forgot Password?</h1>
                <p className="text-sm text-[#5F6B7A] mt-1">
                  Enter your email and we&apos;ll send you a reset link
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail size={16} />}
                  required
                />
                <Button type="submit" className="w-full" size="lg" loading={loading}>
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : (
            <div
              className="text-center space-y-4"
              style={{ animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1A2332]">Check your email</h2>
                <p className="text-sm text-[#5F6B7A] mt-1">
                  If <strong>{email}</strong> has an account, a reset link has been sent.
                </p>
              </div>

              {/* Dev-only: show reset URL directly */}
              {devUrl && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-left space-y-2">
                  <p className="text-xs font-semibold text-amber-800">🛠 Dev mode — Reset link:</p>
                  <a
                    href={devUrl}
                    className="flex items-center gap-1 text-xs text-[#1565C0] hover:underline break-all"
                  >
                    <ExternalLink size={12} className="shrink-0" />
                    {devUrl}
                  </a>
                  <p className="text-[10px] text-amber-700">
                    This box is hidden in production. Connect an email service to send real emails.
                  </p>
                </div>
              )}

              <button
                onClick={() => { setSent(false); setDevUrl(''); setEmail(''); }}
                className="text-sm text-[#1565C0] hover:underline"
              >
                Try a different email
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-sm text-[#5F6B7A] hover:text-[#1565C0] transition-colors"
            >
              <ArrowLeft size={14} /> Back to Login
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
