'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Plus, Calendar, XCircle } from 'lucide-react';
import { formatDate, formatTime, getStatusColor, getServiceLabel } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Pet {
  id: string;
  name: string;
  species: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  serviceType: string;
  status: string;
  reason?: string;
  notes?: string;
  adminNotes?: string;
  pet: { name: string; species: string; breed: string };
  createdAt: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [formData, setFormData] = useState({
    petId: '', date: '', time: '', serviceType: 'GENERAL_CHECKUP', reason: '', notes: '',
  });

  const fetchData = async () => {
    try {
      const [aptsRes, petsRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/pets'),
      ]);
      const aptsData = await aptsRes.json();
      const petsData = await petsRes.json();
      setAppointments(aptsData.appointments || []);
      setPets(petsData.pets || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchData();
    };
    void loadData();
  }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      toast.success('Appointment booked! 📅');
      setShowBookModal(false);
      setFormData({ petId: '', date: '', time: '', serviceType: 'GENERAL_CHECKUP', reason: '', notes: '' });
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to book');
    } finally { setFormLoading(false); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      toast.success('Appointment cancelled');
      fetchData();
    } catch { toast.error('Failed to cancel'); }
  };

  const filteredAppointments = filter === 'ALL'
    ? appointments
    : appointments.filter(a => a.status === filter);

  const statusFilters = ['ALL', 'PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED'];

  // Get min date (today)
  const today = new Date().toISOString().split('T')[0];

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Appointments</h2>
          <p className="text-[var(--color-text-secondary)]">Book and manage your veterinary appointments</p>
        </div>
        <Button onClick={() => setShowBookModal(true)} disabled={pets.length === 0}>
          <Plus size={18} /> Book Appointment
        </Button>
      </div>

      {pets.length === 0 && (
        <Card className="text-center py-8">
          <p className="text-[var(--color-text-secondary)]">Please add a pet first before booking appointments.</p>
        </Card>
      )}

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
            {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">No Appointments</h3>
          <p className="text-[var(--color-text-secondary)]">
            {filter === 'ALL' ? 'Book your first appointment to get started' : `No ${filter.toLowerCase()} appointments`}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => (
            <Card key={apt.id} className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                  <Calendar size={20} className="text-[var(--color-primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-[var(--color-text)]">
                      {getServiceLabel(apt.serviceType)}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {apt.pet.name} ({apt.pet.species}) • {formatDate(apt.date)} at {formatTime(apt.time)}
                  </p>
                  {apt.reason && (
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">Reason: {apt.reason}</p>
                  )}
                  {apt.adminNotes && (
                    <p className="text-xs text-[var(--color-primary)] mt-1">📝 Clinic Note: {apt.adminNotes}</p>
                  )}
                </div>
              </div>
              {(apt.status === 'PENDING' || apt.status === 'APPROVED') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCancel(apt.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <XCircle size={16} /> Cancel
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Book Appointment Modal */}
      <Modal
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
        title="Book Appointment"
        size="md"
      >
        <form onSubmit={handleBook} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--color-text)]">Select Pet *</label>
            <select
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)]"
              value={formData.petId}
              onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
              required
            >
              <option value="">Choose a pet</option>
              {pets.map(pet => (
                <option key={pet.id} value={pet.id}>{pet.name} ({pet.species})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--color-text)]">Service Type *</label>
            <select
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)]"
              value={formData.serviceType}
              onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
            >
              <option value="GENERAL_CHECKUP">General Checkup</option>
              <option value="VACCINATION">Vaccination</option>
              <option value="GROOMING">Grooming</option>
              <option value="PET_FOOD_NUTRITION">Pet Food & Nutrition</option>
              <option value="MEDICINE">Medicine</option>
              <option value="PET_ACCESSORIES">Pet Accessories</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date *"
              type="date"
              min={today}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <Input
              label="Time *"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            />
          </div>

          <Input
            label="Reason for Visit"
            placeholder="Brief description of the issue"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--color-text)]">Additional Notes</label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] resize-none"
              placeholder="Any additional information..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowBookModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={formLoading} className="flex-1">
              Book Appointment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
