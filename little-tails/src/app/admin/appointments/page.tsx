'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { CheckCircle, XCircle, CalendarClock, MessageSquare } from 'lucide-react';
import { formatDate, formatTime, getStatusColor, getServiceLabel } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Appointment {
  id: string;
  date: string;
  time: string;
  serviceType: string;
  status: string;
  reason?: string;
  notes?: string;
  adminNotes?: string;
  pet: { name: string; species: string; breed: string; registrationNo: string };
  user: { firstName: string; lastName: string; email: string; phone?: string };
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments');
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const loadAppointments = async () => {
      await fetchAppointments();
    };
    void loadAppointments();
  }, []);

  const updateStatus = async (id: string, status: string, extras?: Record<string, string>) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes, ...extras }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success(`Appointment ${status.toLowerCase()}`);
      setSelectedApt(null);
      setAdminNotes('');
      fetchAppointments();
    } catch { toast.error('Failed to update'); }
  };

  const filteredAppointments = filter === 'ALL'
    ? appointments
    : appointments.filter(a => a.status === filter);

  const statusFilters = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'];

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text)]">Manage Appointments</h2>
        <p className="text-[var(--color-text-secondary)]">Review, approve, reject, or reschedule appointments</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {statusFilters.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === status
                ? 'bg-[var(--color-primary)] text-white shadow-lg'
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-border)]/50'
            }`}
          >
            {status === 'ALL' ? `All (${appointments.length})` : `${status.charAt(0)}${status.slice(1).toLowerCase()} (${appointments.filter(a => a.status === status).length})`}
          </button>
        ))}
      </div>

      {/* Appointments Table */}
      {filteredAppointments.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-[var(--color-text-secondary)]">No appointments found</p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Table Header */}
            <div className="grid grid-cols-7 gap-4 px-4 py-3 bg-[var(--color-bg)] rounded-t-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] uppercase">
              <div>Patient / Pet</div>
              <div>Service</div>
              <div>Date & Time</div>
              <div>Status</div>
              <div>Reason</div>
              <div>Contact</div>
              <div>Actions</div>
            </div>

            {/* Table Body */}
            {filteredAppointments.map((apt) => (
              <div key={apt.id} className="grid grid-cols-7 gap-4 px-4 py-4 bg-[var(--color-surface)] border-x border-b border-[var(--color-border)] items-center text-sm last:rounded-b-xl">
                <div>
                  <p className="font-semibold text-[var(--color-text)]">{apt.user.firstName} {apt.user.lastName}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">🐾 {apt.pet.name} ({apt.pet.species})</p>
                </div>
                <div className="text-[var(--color-text)]">{getServiceLabel(apt.serviceType)}</div>
                <div>
                  <p className="text-[var(--color-text)]">{formatDate(apt.date)}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{formatTime(apt.time)}</p>
                </div>
                <div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(apt.status)}`}>
                    {apt.status}
                  </span>
                </div>
                <div className="text-xs text-[var(--color-text-secondary)] truncate">{apt.reason || '-'}</div>
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">{apt.user.email}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{apt.user.phone || '-'}</p>
                </div>
                <div className="flex gap-1">
                  {apt.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => updateStatus(apt.id, 'APPROVED')}
                        className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                        title="Approve"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => updateStatus(apt.id, 'REJECTED')}
                        className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        title="Reject"
                      >
                        <XCircle size={16} />
                      </button>
                      <button
                        onClick={() => { setSelectedApt(apt); setAdminNotes(''); }}
                        className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                        title="More Options"
                      >
                        <MessageSquare size={16} />
                      </button>
                    </>
                  )}
                  {apt.status === 'APPROVED' && (
                    <button
                      onClick={() => updateStatus(apt.id, 'COMPLETED')}
                      className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                      title="Mark Complete"
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={!!selectedApt}
        onClose={() => setSelectedApt(null)}
        title="Appointment Actions"
        size="md"
      >
        {selectedApt && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
              <p className="text-sm"><strong>Patient:</strong> {selectedApt.user.firstName} {selectedApt.user.lastName}</p>
              <p className="text-sm"><strong>Pet:</strong> {selectedApt.pet.name} ({selectedApt.pet.species})</p>
              <p className="text-sm"><strong>Service:</strong> {getServiceLabel(selectedApt.serviceType)}</p>
              <p className="text-sm"><strong>Scheduled:</strong> {formatDate(selectedApt.date)} at {formatTime(selectedApt.time)}</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--color-text)]">Admin Notes</label>
              <textarea
                rows={3}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] resize-none"
                placeholder="Add notes for the patient..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>

            {/* Reschedule */}
            <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-3">
              <p className="text-sm font-semibold text-[var(--color-text)]">Reschedule</p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                />
                <input
                  type="time"
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateStatus(selectedApt.id, 'RESCHEDULED', { date: rescheduleDate, time: rescheduleTime })}
                disabled={!rescheduleDate || !rescheduleTime}
              >
                <CalendarClock size={16} /> Reschedule
              </Button>
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => updateStatus(selectedApt.id, 'APPROVED')}
              >
                <CheckCircle size={16} /> Approve
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => updateStatus(selectedApt.id, 'REJECTED')}
              >
                <XCircle size={16} /> Reject
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
