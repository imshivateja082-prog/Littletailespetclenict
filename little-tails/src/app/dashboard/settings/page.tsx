'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Lock, Eye, EyeOff, CheckCircle2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = newPassword.length === 0 ? 0 : newPassword.length < 6 ? 1 : newPassword.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-400', 'bg-yellow-400', 'bg-green-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully!');
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div style={{ animation: 'slideDown 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1565C0] to-[#42A5F5] flex items-center justify-center shadow-lg shadow-blue-200">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text)]">Account Settings</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">Manage your password and security</p>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <Card style={{ animation: 'fadeUp 0.45s cubic-bezier(0.34,1.56,0.64,1) 0.1s both' }}>
        <div className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1565C0] via-[#42A5F5] to-[#1565C0]" />

          <div className="pt-3 space-y-5">
            <div className="flex items-center gap-2">
              <Lock size={18} className="text-[var(--color-primary)]" />
              <h3 className="font-semibold text-[var(--color-text)]">Change Password</h3>
            </div>

            {success && (
              <div
                className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200"
                style={{ animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}
              >
                <CheckCircle2 size={20} className="text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-800">Password changed successfully!</p>
                  <p className="text-xs text-green-700">Your new password is now active.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Current password */}
              <div className="relative">
                <Input
                  label="Current Password"
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  icon={<Lock size={16} />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(p => !p)}
                  className="absolute right-3 top-[38px] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* New password */}
              <div className="relative">
                <Input
                  label="New Password"
                  type={showNew ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  icon={<Lock size={16} />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(p => !p)}
                  className="absolute right-3 top-[38px] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {newPassword && (
                  <div className="mt-2 space-y-1" style={{ animation: 'fadeUp 0.3s ease both' }}>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${strengthColor[strength]}`}
                        style={{ width: `${(strength / 3) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Strength: <span className="font-semibold">{strengthLabel[strength]}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm new password */}
              <div className="relative">
                <Input
                  label="Confirm New Password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<Lock size={16} />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(p => !p)}
                  className="absolute right-3 top-[38px] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              <div className="pt-1">
                <Button
                  type="submit"
                  className="w-full"
                  loading={loading}
                  disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Card>

      {/* Tips card */}
      <Card style={{ animation: 'fadeUp 0.45s cubic-bezier(0.34,1.56,0.64,1) 0.2s both' }}>
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
            <ShieldCheck size={15} className="text-[var(--color-primary)]" /> Password Tips
          </h4>
          <ul className="text-xs text-[var(--color-text-secondary)] space-y-1 list-disc list-inside">
            <li>Use at least 8 characters for a strong password</li>
            <li>Mix uppercase, lowercase, numbers and symbols</li>
            <li>Avoid using your name or pet&apos;s name</li>
            <li>Don&apos;t reuse passwords from other sites</li>
          </ul>
        </div>
      </Card>

      <style jsx global>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
