'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { Bell, Send, Syringe, Calendar, Stethoscope, Pill, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Reminder {
  id: string;
  type: string;
  title: string;
  message: string;
  dueDate: string;
  isSent: boolean;
  sentAt?: string;
  createdAt: string;
  pet: {
    id: string;
    name: string;
    registrationNo: string;
    owner?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
    };
  };
  owner?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  } | null;
}

export default function AdminRemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'sent' | 'unsent'>('all');

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/reminders');
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || 'Failed to fetch reminders');
        return;
      }

      setReminders(data.reminders || []);
    } catch (error) {
      toast.error('Error fetching reminders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadReminders = async () => {
      await fetchReminders();
    };
    void loadReminders();
  }, []);

  const sendReminder = async (reminderId: string) => {
    try {
      setSendingId(reminderId);
      const res = await fetch('/api/admin/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminderId }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.details || data.error || 'Failed to send reminder');
        return;
      }

      // Update local state
      setReminders(prev =>
        prev.map(r => r.id === reminderId ? { ...r, isSent: true, sentAt: new Date().toISOString() } : r)
      );
      toast.success('WhatsApp reminder sent! 📱');
    } catch (error) {
      toast.error('Error sending reminder');
      console.error(error);
    } finally {
      setSendingId(null);
    }
  };

  const sendAllDueReminders = async () => {
    try {
      if (!confirm('Send WhatsApp to all due unsent reminders? This cannot be undone.')) return;

      const res = await fetch('/api/admin/reminders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.details || data.error || 'Failed to send reminders');
        return;
      }

      toast.success(`✅ Sent ${data.results?.sent || 0} reminders!`);
      fetchReminders();
    } catch (error) {
      toast.error('Error sending batch reminders');
      console.error(error);
    }
  };

  const deleteReminder = async (reminderId: string) => {
    try {
      if (!confirm('Delete this reminder permanently?')) return;

      const res = await fetch(`/api/admin/reminders?id=${reminderId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to delete reminder');
        return;
      }

      setReminders(prev => prev.filter(r => r.id !== reminderId));
      toast.success('Reminder deleted');
    } catch (error) {
      toast.error('Error deleting reminder');
      console.error(error);
    }
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'VACCINATION':
        return <Syringe size={18} className="text-blue-500" />;
      case 'APPOINTMENT':
        return <Calendar size={18} className="text-indigo-500" />;
      case 'HEALTH_CHECKUP':
        return <Stethoscope size={18} className="text-emerald-500" />;
      case 'MEDICATION':
        return <Pill size={18} className="text-amber-500" />;
      default:
        return <Bell size={18} className="text-[var(--color-primary)]" />;
    }
  };

  const filteredReminders = reminders.filter(r => {
    if (filter === 'sent') return r.isSent;
    if (filter === 'unsent') return !r.isSent;
    return true;
  });

  const stats = {
    total: reminders.length,
    sent: reminders.filter(r => r.isSent).length,
    unsent: reminders.filter(r => !r.isSent).length,
    dueToday: reminders.filter(r => !r.isSent && new Date(r.dueDate) <= new Date()).length,
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">📬 WhatsApp Reminders</h2>
          <p className="text-[var(--color-text-secondary)]">Manage and send health reminders to pet owners</p>
        </div>
        <Button onClick={sendAllDueReminders} variant="primary" size="md">
          <Send size={16} /> Send All Due
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-[var(--color-primary)]">{stats.total}</div>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Total Reminders</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-emerald-500">{stats.sent}</div>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Sent</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-orange-500">{stats.unsent}</div>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Unsent</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-red-500">{stats.dueToday}</div>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Due Today</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({stats.total})
        </Button>
        <Button
          variant={filter === 'unsent' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('unsent')}
        >
          Unsent ({stats.unsent})
        </Button>
        <Button
          variant={filter === 'sent' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('sent')}
        >
          Sent ({stats.sent})
        </Button>
      </div>

      {/* Reminders List */}
      {filteredReminders.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-5xl mb-4">📬</div>
          <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">
            {filter === 'all' ? 'No Reminders' : `No ${filter} reminders`}
          </h3>
          <p className="text-[var(--color-text-secondary)]">
            {filter === 'sent' ? 'All reminders are waiting to be sent!' : 'Create reminders in pet health records.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredReminders.map(reminder => (
            <Card
              key={reminder.id}
              className={`flex items-start justify-between gap-4 ${reminder.isSent ? 'opacity-75 border-l-4 border-l-emerald-500' : 'border-l-4 border-l-orange-500'}`}
            >
              <div className="flex gap-4 flex-1 min-w-0">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                  {getReminderIcon(reminder.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-[var(--color-text)]">{reminder.title}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${reminder.isSent ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                      {reminder.isSent ? '✓ SENT' : 'PENDING'}
                    </span>
                    <span className="text-xs bg-[var(--color-bg)] text-[var(--color-text-secondary)] px-2 py-0.5 rounded">
                      {reminder.type}
                    </span>
                  </div>

                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">{reminder.message}</p>

                  <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs text-[var(--color-text-secondary)]">
                    {(() => {
                      const owner = reminder.owner ?? reminder.pet.owner;
                      return (
                        <>
                          <div>
                            <span className="font-semibold">Owner:</span>{' '}
                            {owner ? `${owner.firstName} ${owner.lastName} (${owner.email})` : 'Unknown owner'}
                          </div>
                          <div>
                            <span className="font-semibold">Pet:</span> {reminder.pet.name} ({reminder.pet.registrationNo})
                          </div>
                          <div>
                            <span className="font-semibold">📅 Due:</span> {new Date(reminder.dueDate).toLocaleDateString('en-IN')}
                          </div>
                          <div>
                            <span className="font-semibold">📱 Phone:</span> {owner?.phone || 'N/A'}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {reminder.isSent && reminder.sentAt && (
                    <p className="text-xs text-emerald-600 mt-2">
                      ✓ Sent on {new Date(reminder.sentAt).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {!reminder.isSent && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => sendReminder(reminder.id)}
                    disabled={sendingId === reminder.id}
                    title="Send WhatsApp reminder"
                  >
                    {sendingId === reminder.id ? (
                      <>
                        <span className="animate-spin">⏳</span>
                      </>
                    ) : (
                      <Send size={16} />
                    )}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteReminder(reminder.id)}
                  title="Delete reminder"
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
