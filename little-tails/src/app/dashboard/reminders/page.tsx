'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { Bell, Check, Syringe, Calendar, Stethoscope, Pill, Clock, PawPrint, Scissors } from 'lucide-react';
import { formatDate, formatTime, getServiceLabel } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  serviceType: string;
  status: string;
  reason?: string;
  notes?: string;
  pet: {
    name: string;
    species: string;
    breed: string;
  };
}

export default function RemindersPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [approvedAppointments, setApprovedAppointments] = useState<Appointment[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [notifRes, apptRes] = await Promise.all([
        fetch('/api/notifications'),
        fetch('/api/appointments'),
      ]);

      const notifData = await notifRes.json();
      setNotifications(notifData.notifications || []);
      setUnreadCount(notifData.unreadCount || 0);

      const apptData = await apptRes.json();
      const approved = (apptData.appointments || []).filter(
        (a: Appointment) => a.status === 'APPROVED'
      );
      setApprovedAppointments(approved);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchData();
    };
    void loadData();
  }, []);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch { toast.error('Failed to update'); }
  };

  const getNotifIcon = (title: string) => {
    if (title.toLowerCase().includes('vaccin')) return <Syringe size={18} className="text-blue-500" />;
    if (title.toLowerCase().includes('appointment')) return <Calendar size={18} className="text-[#1565C0]" />;
    if (title.toLowerCase().includes('checkup')) return <Stethoscope size={18} className="text-emerald-500" />;
    if (title.toLowerCase().includes('medic')) return <Pill size={18} className="text-amber-500" />;
    return <Bell size={18} className="text-[var(--color-primary)]" />;
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'VACCINATION': return <Syringe size={20} className="text-blue-500" />;
      case 'GROOMING': return <Scissors size={20} className="text-pink-500" />;
      case 'GENERAL_CHECKUP': return <Stethoscope size={20} className="text-emerald-500" />;
      case 'MEDICINE': return <Pill size={20} className="text-amber-500" />;
      case 'PET_FOOD_NUTRITION': return <PawPrint size={20} className="text-orange-500" />;
      default: return <Calendar size={20} className="text-[var(--color-primary)]" />;
    }
  };

  const getServiceEmoji = (species: string) => {
    const emojis: Record<string, string> = { dog: '🐕', cat: '🐈', bird: '🐦', rabbit: '🐰', fish: '🐠', hamster: '🐹' };
    return emojis[species.toLowerCase()] || '🐾';
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">
            Reminders & Notifications
          </h2>
          <p className="text-[var(--color-text-secondary)]">
            Stay on top of your pet&apos;s health schedule
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <Check size={16} /> Mark All Read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Approved Appointments */}
      <div>
        <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">✅ Approved Appointments</h3>
        {approvedAppointments.length === 0 ? (
          <Card className="text-center py-10">
            <div className="text-4xl mb-3">📅</div>
            <h4 className="text-base font-semibold text-[var(--color-text)] mb-1">No Approved Appointments</h4>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Your approved appointments will appear here as reminders.
            </p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedAppointments.map((appt) => (
              <Card key={appt.id} className="relative overflow-hidden">
                {/* Green top accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>

                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    {getServiceIcon(appt.serviceType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-[var(--color-text)] truncate">
                      {getServiceLabel(appt.serviceType)}
                    </h4>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {getServiceEmoji(appt.pet.species)} {appt.pet.name} • {appt.pet.breed}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 shrink-0">
                    APPROVED
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={14} className="text-[var(--color-primary)]" />
                    <span className="text-[var(--color-text)] font-medium">{formatDate(appt.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={14} className="text-[var(--color-primary)]" />
                    <span className="text-[var(--color-text)] font-medium">{formatTime(appt.time)}</span>
                  </div>
                </div>

                {appt.reason && (
                  <p className="text-xs text-[var(--color-text-secondary)] p-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                    📝 {appt.reason}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div>
        <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">🔔 Notifications</h3>
        {notifications.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-5xl mb-4">🔔</div>
            <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">No Notifications</h3>
            <p className="text-[var(--color-text-secondary)]">You&apos;re all caught up!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`flex items-start gap-4 ${!notification.isRead ? 'border-l-4 border-l-[var(--color-primary)]' : ''}`}
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                  {getNotifIcon(notification.title)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-[var(--color-text)]">{notification.title}</h4>
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></div>
                    )}
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">{notification.message}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-2">{formatDate(notification.createdAt)}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
