'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  PawPrint, UserCheck, UserPlus, Mail, Phone,
  CheckCircle2, ChevronRight, ChevronLeft, Sparkles,
  Cat, Dog, Bird, Rabbit, Fish, AlertCircle, RotateCcw, Lock, Eye, EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

type Step = 'owner' | 'pet' | 'confirm' | 'success';

interface OwnerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface PetInfo {
  petName: string;
  species: string;
  breed: string;
  age: string;
  weight: string;
  gender: string;
  color: string;
  microchipId: string;
  allergies: string;
  complications: string;
}

interface ExistingOwner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  _count: { pets: number };
}

interface RegisteredPet {
  id: string;
  registrationNo: string;
  name: string;
  species: string;
  breed: string;
  owner: { firstName: string; lastName: string; email: string };
}

const SPECIES_OPTIONS = [
  { label: 'Dog', value: 'Dog', icon: Dog },
  { label: 'Cat', value: 'Cat', icon: Cat },
  { label: 'Bird', value: 'Bird', icon: Bird },
  { label: 'Rabbit', value: 'Rabbit', icon: Rabbit },
  { label: 'Fish', value: 'Fish', icon: Fish },
  { label: 'Other', value: 'Other', icon: PawPrint },
];

const petEmoji: Record<string, string> = {
  dog: '🐕', cat: '🐈', bird: '🐦', rabbit: '🐰', fish: '🐠', hamster: '🐹', other: '🐾',
};

const STEPS: { key: Step; label: string; icon: React.ReactNode }[] = [
  { key: 'owner', label: 'Pet Parent', icon: <UserCheck size={16} /> },
  { key: 'pet', label: 'Pet Details', icon: <PawPrint size={16} /> },
  { key: 'confirm', label: 'Confirm', icon: <CheckCircle2 size={16} /> },
];

function StepIndicator({ current }: { current: Step }) {
  const stepKeys: Step[] = ['owner', 'pet', 'confirm'];
  const currentIdx = stepKeys.indexOf(current);
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((step, idx) => {
        const isActive = step.key === current;
        const isDone = idx < currentIdx;
        return (
          <React.Fragment key={step.key}>
            <div
              className="flex flex-col items-center gap-1.5"
              style={{
                transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            >
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                  transition-all duration-500
                  ${isDone
                    ? 'bg-[var(--color-accent)] text-white shadow-lg shadow-green-200'
                    : isActive
                    ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-blue-200 scale-110'
                    : 'bg-[var(--color-border)] text-[var(--color-text-secondary)]'
                  }
                `}
              >
                {isDone ? <CheckCircle2 size={18} /> : step.icon}
              </div>
              <span
                className={`text-xs font-semibold transition-colors duration-300 ${
                  isActive ? 'text-[var(--color-primary)]' : isDone ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className="h-0.5 w-16 mx-1 mb-5 transition-all duration-700 rounded-full"
                style={{
                  background: idx < currentIdx
                    ? 'var(--color-accent)'
                    : 'var(--color-border)',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function AnimatedSection({ children, visible }: { children: React.ReactNode; visible: boolean }) {
  return (
    <div
      style={{
        transition: 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(18px) scale(0.98)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {children}
    </div>
  );
}

export default function OfflinePetsPage() {
  const [step, setStep] = useState<Step>('owner');
  const [visible, setVisible] = useState(true);

  const [ownerEmail, setOwnerEmail] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const [existingOwner, setExistingOwner] = useState<ExistingOwner | null>(null);
  const [ownerChecked, setOwnerChecked] = useState(false);

  const [ownerInfo, setOwnerInfo] = useState<OwnerInfo>({
    firstName: '', lastName: '', email: '', phone: '',
  });
  const [ownerPassword, setOwnerPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [petInfo, setPetInfo] = useState<PetInfo>({
    petName: '', species: 'Dog', breed: '', age: '', weight: '',
    gender: 'MALE', color: '', microchipId: '', allergies: '', complications: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [registeredPet, setRegisteredPet] = useState<RegisteredPet | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-lookup owner when email is typed
  useEffect(() => {
    if (!ownerEmail || !ownerEmail.includes('@')) {
      setExistingOwner(null);
      setOwnerChecked(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLookingUp(true);
      try {
        const res = await fetch(`/api/admin/offline-pets?email=${encodeURIComponent(ownerEmail)}`);
        const data = await res.json();
        setExistingOwner(data.user || null);
        setOwnerChecked(true);
        if (data.user) {
          setOwnerInfo({
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            email: data.user.email,
            phone: data.user.phone || '',
          });
        } else {
          setOwnerInfo(prev => ({ ...prev, email: ownerEmail }));
        }
      } catch {
        setOwnerChecked(true);
      } finally {
        setLookingUp(false);
      }
    }, 600);
  }, [ownerEmail]);

  const goToStep = (next: Step) => {
    setVisible(false);
    setTimeout(() => {
      setStep(next);
      setVisible(true);
    }, 300);
  };

  const handleOwnerNext = () => {
    if (!ownerInfo.email || !ownerInfo.firstName || !ownerInfo.lastName) {
      toast.error('Please fill in all required owner fields');
      return;
    }
    goToStep('pet');
  };

  const handlePetNext = () => {
    if (!petInfo.petName || !petInfo.species || !petInfo.breed || !petInfo.age || !petInfo.gender) {
      toast.error('Please fill in all required pet fields');
      return;
    }
    goToStep('confirm');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/offline-pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerFirstName: ownerInfo.firstName,
          ownerLastName: ownerInfo.lastName,
          ownerEmail: ownerInfo.email,
          ownerPhone: ownerInfo.phone,
          ownerPassword: ownerPassword || undefined,
          petName: petInfo.petName,
          species: petInfo.species,
          breed: petInfo.breed,
          age: petInfo.age,
          weight: petInfo.weight,
          gender: petInfo.gender,
          color: petInfo.color,
          microchipId: petInfo.microchipId,
          allergies: petInfo.allergies,
          complications: petInfo.complications,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register');
      setRegisteredPet(data.pet);
      goToStep('success');
      toast.success('Pet registered successfully!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setOwnerEmail('');
    setExistingOwner(null);
    setOwnerChecked(false);
    setOwnerInfo({ firstName: '', lastName: '', email: '', phone: '' });
    setOwnerPassword('');
    setShowPassword(false);
    setPetInfo({ petName: '', species: 'Dog', breed: '', age: '', weight: '', gender: 'MALE', color: '', microchipId: '', allergies: '', complications: '' });
    setRegisteredPet(null);
    goToStep('owner');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div
        style={{
          animation: 'slideDown 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1565C0] to-[#42A5F5] flex items-center justify-center shadow-lg shadow-blue-200">
            <PawPrint size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text)]">Offline Pet Registration</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Register walk-in pets using the parent&apos;s phone number &amp; email
            </p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <Card className="relative overflow-hidden" style={{ animation: 'fadeUp 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both' }}>
        {/* Top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1565C0] via-[#42A5F5] to-[#1565C0]" />

        <div className="pt-2">
          {step !== 'success' && <StepIndicator current={step} />}

          {/* ── STEP 1: OWNER ── */}
          {step === 'owner' && (
            <AnimatedSection visible={visible}>
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-4">
                  <Mail size={18} className="text-[var(--color-primary)]" />
                  <h3 className="font-semibold text-[var(--color-text)]">Enter Pet Parent&apos;s Email</h3>
                </div>

                {/* Email with live lookup */}
                <div className="relative">
                  <Input
                    label="Email Address *"
                    type="email"
                    placeholder="parent@example.com"
                    value={ownerEmail}
                    onChange={(e) => {
                      setOwnerEmail(e.target.value);
                      setOwnerInfo(prev => ({ ...prev, email: e.target.value }));
                    }}
                    icon={<Mail size={16} />}
                  />
                  {lookingUp && (
                    <div className="absolute right-3 top-9">
                      <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Owner status badge */}
                {ownerChecked && ownerEmail && (
                  <div
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-500 ${
                      existingOwner
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-blue-50 border-blue-200 text-blue-800'
                    }`}
                    style={{ animation: 'slideDown 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}
                  >
                    {existingOwner ? (
                      <>
                        <UserCheck size={20} className="text-green-600 shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Existing account found</p>
                          <p className="text-xs text-green-700">
                            {existingOwner.firstName} {existingOwner.lastName} · {existingOwner._count.pets} pet(s) registered
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <UserPlus size={20} className="text-blue-600 shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">New pet parent</p>
                          <p className="text-xs text-blue-700">A new account will be created for this email</p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Owner form fields */}
                {ownerEmail && ownerEmail.includes('@') && !lookingUp && (
                  <div
                    className="space-y-4 pt-2"
                    style={{ animation: 'fadeUp 0.4s ease both' }}
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="First Name *"
                        placeholder="John"
                        value={ownerInfo.firstName}
                        onChange={(e) => setOwnerInfo(p => ({ ...p, firstName: e.target.value }))}
                        disabled={!!existingOwner}
                      />
                      <Input
                        label="Last Name *"
                        placeholder="Doe"
                        value={ownerInfo.lastName}
                        onChange={(e) => setOwnerInfo(p => ({ ...p, lastName: e.target.value }))}
                        disabled={!!existingOwner}
                      />
                    </div>
                    <Input
                      label="Phone Number"
                      placeholder="+91 98765 43210"
                      value={ownerInfo.phone}
                      onChange={(e) => setOwnerInfo(p => ({ ...p, phone: e.target.value }))}
                      icon={<Phone size={16} />}
                    />
                    {!existingOwner && (
                      <div className="relative">
                        <Input
                          label="Set Password for Owner"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min. 6 characters"
                          value={ownerPassword}
                          onChange={(e) => setOwnerPassword(e.target.value)}
                          icon={<Lock size={16} />}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(p => !p)}
                          className="absolute right-3 top-[38px] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                          Owner can change this from their dashboard after logging in
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleOwnerNext}
                    disabled={!ownerInfo.email || !ownerInfo.firstName || !ownerInfo.lastName}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-dark)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Next: Pet Details <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* ── STEP 2: PET ── */}
          {step === 'pet' && (
            <AnimatedSection visible={visible}>
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <PawPrint size={18} className="text-[var(--color-primary)]" />
                  <h3 className="font-semibold text-[var(--color-text)]">Pet Information</h3>
                </div>

                <Input
                  label="Pet Name *"
                  placeholder="e.g. Bruno"
                  value={petInfo.petName}
                  onChange={(e) => setPetInfo(p => ({ ...p, petName: e.target.value }))}
                />

                {/* Species selector */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Species *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {SPECIES_OPTIONS.map((s) => {
                      const Icon = s.icon;
                      const isSelected = petInfo.species === s.value;
                      return (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => setPetInfo(p => ({ ...p, species: s.value }))}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                            isSelected
                              ? 'border-[var(--color-primary)] bg-blue-50 text-[var(--color-primary)] scale-105 shadow-md shadow-blue-100'
                              : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-blue-200 hover:bg-blue-50/50'
                          }`}
                        >
                          <Icon size={20} />
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Breed *"
                    placeholder="e.g. Labrador"
                    value={petInfo.breed}
                    onChange={(e) => setPetInfo(p => ({ ...p, breed: e.target.value }))}
                  />
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Gender *</label>
                    <select
                      value={petInfo.gender}
                      onChange={(e) => setPetInfo(p => ({ ...p, gender: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </div>
                  <Input
                    label="Age (years) *"
                    type="number"
                    placeholder="e.g. 3"
                    value={petInfo.age}
                    onChange={(e) => setPetInfo(p => ({ ...p, age: e.target.value }))}
                  />
                  <Input
                    label="Weight (kg)"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 12.5"
                    value={petInfo.weight}
                    onChange={(e) => setPetInfo(p => ({ ...p, weight: e.target.value }))}
                  />
                  <Input
                    label="Color"
                    placeholder="e.g. Golden"
                    value={petInfo.color}
                    onChange={(e) => setPetInfo(p => ({ ...p, color: e.target.value }))}
                  />
                  <Input
                    label="Microchip ID"
                    placeholder="Optional"
                    value={petInfo.microchipId}
                    onChange={(e) => setPetInfo(p => ({ ...p, microchipId: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Known Allergies</label>
                  <textarea
                    placeholder="List any known allergies..."
                    value={petInfo.allergies}
                    onChange={(e) => setPetInfo(p => ({ ...p, allergies: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Complications / Notes</label>
                  <textarea
                    placeholder="Any existing conditions or notes..."
                    value={petInfo.complications}
                    onChange={(e) => setPetInfo(p => ({ ...p, complications: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all resize-none"
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => goToStep('owner')}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium hover:bg-[var(--color-bg)] transition-all duration-200 hover:-translate-x-0.5"
                  >
                    <ChevronLeft size={18} /> Back
                  </button>
                  <button
                    onClick={handlePetNext}
                    disabled={!petInfo.petName || !petInfo.breed || !petInfo.age}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-dark)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Review & Confirm <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* ── STEP 3: CONFIRM ── */}
          {step === 'confirm' && (
            <AnimatedSection visible={visible}>
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={18} className="text-[var(--color-primary)]" />
                  <h3 className="font-semibold text-[var(--color-text)]">Confirm Registration</h3>
                </div>

                {/* Summary card - Owner */}
                <div
                  className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] space-y-3"
                  style={{ animation: 'fadeUp 0.35s ease 0.05s both' }}
                >
                  <div className="flex items-center gap-2">
                    <UserCheck size={16} className="text-[var(--color-primary)]" />
                    <span className="text-sm font-semibold text-[var(--color-text)]">Pet Parent</span>
                    {existingOwner && (
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Existing</span>
                    )}
                    {!existingOwner && (
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">New Account</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-[var(--color-text-secondary)] text-xs">Name</span>
                      <p className="font-medium text-[var(--color-text)]">{ownerInfo.firstName} {ownerInfo.lastName}</p>
                    </div>
                    <div>
                      <span className="text-[var(--color-text-secondary)] text-xs">Email</span>
                      <p className="font-medium text-[var(--color-text)] truncate">{ownerInfo.email}</p>
                    </div>
                    {ownerInfo.phone && (
                      <div>
                        <span className="text-[var(--color-text-secondary)] text-xs">Phone</span>
                        <p className="font-medium text-[var(--color-text)]">{ownerInfo.phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary card - Pet */}
                <div
                  className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] space-y-3"
                  style={{ animation: 'fadeUp 0.35s ease 0.15s both' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{petEmoji[petInfo.species.toLowerCase()] || '🐾'}</span>
                    <span className="text-sm font-semibold text-[var(--color-text)]">Pet Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      { label: 'Name', value: petInfo.petName },
                      { label: 'Species', value: petInfo.species },
                      { label: 'Breed', value: petInfo.breed },
                      { label: 'Gender', value: petInfo.gender },
                      { label: 'Age', value: `${petInfo.age} year(s)` },
                      { label: 'Weight', value: petInfo.weight ? `${petInfo.weight} kg` : '—' },
                      { label: 'Color', value: petInfo.color || '—' },
                      { label: 'Microchip', value: petInfo.microchipId || '—' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <span className="text-[var(--color-text-secondary)] text-xs">{label}</span>
                        <p className="font-medium text-[var(--color-text)]">{value}</p>
                      </div>
                    ))}
                  </div>
                  {(petInfo.allergies || petInfo.complications) && (
                    <div className="pt-1 border-t border-[var(--color-border)]">
                      {petInfo.allergies && (
                        <div className="flex items-start gap-1.5">
                          <AlertCircle size={13} className="text-orange-500 mt-0.5 shrink-0" />
                          <p className="text-xs text-orange-700">{petInfo.allergies}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {!existingOwner && (
                  <div
                    className="flex gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs"
                    style={{ animation: 'fadeUp 0.35s ease 0.25s both' }}
                  >
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>A new account will be created for <strong>{ownerInfo.email}</strong>. They can set their password via the login page.</span>
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => goToStep('pet')}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium hover:bg-[var(--color-bg)] transition-all duration-200 hover:-translate-x-0.5"
                  >
                    <ChevronLeft size={18} /> Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-[#1565C0] to-[#42A5F5] text-white font-semibold transition-all duration-200 disabled:opacity-60 hover:shadow-xl hover:shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {submitting ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Registering...</>
                    ) : (
                      <><Sparkles size={18} /> Register Pet</>
                    )}
                  </button>
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* ── SUCCESS ── */}
          {step === 'success' && registeredPet && (
            <AnimatedSection visible={visible}>
              <div className="text-center py-6 space-y-6">
                {/* Animated checkmark */}
                <div
                  className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl shadow-green-200"
                  style={{ animation: 'popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both' }}
                >
                  <CheckCircle2 size={48} className="text-white" />
                </div>

                <div style={{ animation: 'fadeUp 0.5s ease 0.2s both' }}>
                  <h3 className="text-2xl font-bold text-[var(--color-text)] mb-1">
                    {registeredPet.name} is registered! 🎉
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    Successfully added to {registeredPet.owner.firstName}&apos;s account
                  </p>
                </div>

                <div
                  className="mx-auto max-w-xs p-4 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] text-left space-y-2"
                  style={{ animation: 'fadeUp 0.5s ease 0.35s both' }}
                >
                  <div className="text-4xl text-center">{petEmoji[registeredPet.species.toLowerCase()] || '🐾'}</div>
                  <div className="text-center">
                    <p className="font-bold text-[var(--color-text)]">{registeredPet.name}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{registeredPet.breed} · {registeredPet.species}</p>
                  </div>
                  <div className="pt-2 border-t border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-text-secondary)] text-center">Registration No.</p>
                    <p className="text-xs font-mono text-center text-[var(--color-primary)] break-all">{registeredPet.registrationNo}</p>
                  </div>
                </div>

                <div style={{ animation: 'fadeUp 0.5s ease 0.45s both' }}>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 mx-auto px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-dark)] transition-all duration-200 hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5"
                  >
                    <RotateCcw size={16} /> Register Another Pet
                  </button>
                </div>
              </div>
            </AnimatedSection>
          )}
        </div>
      </Card>

      <style jsx global>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
