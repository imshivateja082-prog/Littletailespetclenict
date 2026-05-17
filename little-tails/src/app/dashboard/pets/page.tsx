'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Plus, Pencil, Trash2, Syringe, FileText, AlertTriangle, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Pet {
  id: string;
  registrationNo: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight?: number;
  gender: string;
  color?: string;
  microchipId?: string;
  allergies?: string;
  complications?: string;
  vaccinations: Array<{
    id: string;
    vaccineName: string;
    dateAdministered: string;
    nextDueDate?: string;
  }>;
  medicalRecords: Array<{
    id: string;
    diagnosis: string;
    treatment: string;
    visitDate: string;
  }>;
}

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', species: 'Dog', breed: '', age: 0, weight: 0,
    gender: 'MALE', color: '', microchipId: '', allergies: '', complications: '',
  });

  const fetchPets = async () => {
    try {
      const res = await fetch('/api/pets');
      const data = await res.json();
      setPets(data.pets || []);
    } catch { toast.error('Failed to load pets'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const loadPets = async () => {
      await fetchPets();
    };
    void loadPets();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '', species: 'Dog', breed: '', age: 0, weight: 0,
      gender: 'MALE', color: '', microchipId: '', allergies: '', complications: '',
    });
  };

  const openEdit = (pet: Pet) => {
    setFormData({
      name: pet.name, species: pet.species, breed: pet.breed,
      age: pet.age, weight: pet.weight || 0, gender: pet.gender,
      color: pet.color || '', microchipId: pet.microchipId || '',
      allergies: pet.allergies || '', complications: pet.complications || '',
    });
    setEditingPet(pet);
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const url = editingPet ? `/api/pets/${editingPet.id}` : '/api/pets';
      const method = editingPet ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: Number(formData.age),
          weight: formData.weight ? Number(formData.weight) : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      toast.success(editingPet ? 'Pet updated!' : 'Pet added! 🐾');
      setShowAddModal(false);
      setEditingPet(null);
      resetForm();
      fetchPets();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save pet');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this pet?')) return;
    try {
      await fetch(`/api/pets/${id}`, { method: 'DELETE' });
      toast.success('Pet removed');
      fetchPets();
    } catch { toast.error('Failed to delete pet'); }
  };

  const petEmoji = (species: string) => {
    const emojis: Record<string, string> = {
      dog: '🐕', cat: '🐈', bird: '🐦', rabbit: '🐰',
      fish: '🐠', hamster: '🐹', turtle: '🐢', snake: '🐍',
    };
    return emojis[species.toLowerCase()] || '🐾';
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">My Pets</h2>
          <p className="text-[var(--color-text-secondary)]">Manage your pet profiles and health records</p>
        </div>
        <Button onClick={() => { resetForm(); setEditingPet(null); setShowAddModal(true); }}>
          <Plus size={18} /> Add Pet
        </Button>
      </div>

      {/* Pets Grid */}
      {pets.length === 0 ? (
        <Card className="text-center py-16">
          <div className="text-6xl mb-4">🐾</div>
          <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">No Pets Yet</h3>
          <p className="text-[var(--color-text-secondary)] mb-6">Add your first pet to get started with tracking their health</p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Add Your First Pet
          </Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <Card key={pet.id} hover className="relative overflow-hidden">
              {/* Accent */}
              <div className="absolute top-0 left-0 right-0 h-1 gradient-primary"></div>
              
              {/* Pet Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center text-2xl">
                    {petEmoji(pet.species)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--color-text)]">{pet.name}</h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">{pet.breed}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(pet)} className="p-2 rounded-lg hover:bg-[var(--color-border)]/50 text-[var(--color-text-secondary)]">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(pet.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Species', value: pet.species },
                  { label: 'Age', value: `${pet.age} ${pet.age === 1 ? 'year' : 'years'}` },
                  { label: 'Gender', value: pet.gender },
                  { label: 'Weight', value: pet.weight ? `${pet.weight} kg` : 'N/A' },
                ].map((info) => (
                  <div key={info.label} className="p-2 rounded-lg bg-[var(--color-bg)]">
                    <p className="text-xs text-[var(--color-text-secondary)]">{info.label}</p>
                    <p className="text-sm font-medium text-[var(--color-text)]">{info.value}</p>
                  </div>
                ))}
              </div>

              {/* Registration Number */}
              <div className="p-2 rounded-lg bg-[var(--color-bg)] mb-4">
                <p className="text-xs text-[var(--color-text-secondary)]">Registration No.</p>
                <p className="text-xs font-mono font-medium text-[var(--color-primary)]">{pet.registrationNo}</p>
              </div>

              {/* Next Vaccination Due Date */}
              {(() => {
                const upcomingVax = pet.vaccinations
                  .filter(v => v.nextDueDate)
                  .sort((a, b) => new Date(a.nextDueDate!).getTime() - new Date(b.nextDueDate!).getTime())
                  .find(v => new Date(v.nextDueDate!) >= new Date(new Date().toDateString()));
                const overdueVax = pet.vaccinations
                  .filter(v => v.nextDueDate && new Date(v.nextDueDate) < new Date(new Date().toDateString()))
                  .sort((a, b) => new Date(a.nextDueDate!).getTime() - new Date(b.nextDueDate!).getTime())[0];
                const nextVax = overdueVax || upcomingVax;

                if (nextVax && nextVax.nextDueDate) {
                  const dueDate = new Date(nextVax.nextDueDate);
                  const now = new Date();
                  now.setHours(0,0,0,0);
                  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  const isOverdue = diffDays < 0;
                  const isDueSoon = diffDays >= 0 && diffDays <= 30;

                  return (
                    <div className={`flex items-center gap-2 p-3 rounded-lg border mb-4 ${
                      isOverdue
                        ? 'bg-red-50 border-red-200'
                        : isDueSoon
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <Syringe size={16} className={`shrink-0 ${
                        isOverdue ? 'text-red-600' : isDueSoon ? 'text-amber-600' : 'text-blue-600'
                      }`} />
                      <div className="flex-1">
                        <p className={`text-xs font-semibold ${
                          isOverdue ? 'text-red-800' : isDueSoon ? 'text-amber-800' : 'text-blue-800'
                        }`}>
                          {isOverdue ? '⚠️ Vaccination Overdue' : isDueSoon ? '🔔 Vaccination Due Soon' : 'Next Vaccination Due'}
                        </p>
                        <p className={`text-xs ${
                          isOverdue ? 'text-red-700' : isDueSoon ? 'text-amber-700' : 'text-blue-700'
                        }`}>
                          {nextVax.vaccineName} — {formatDate(nextVax.nextDueDate)}
                          {isOverdue
                            ? ` (${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue)`
                            : diffDays === 0
                            ? ' (Today!)'
                            : ` (in ${diffDays} day${diffDays !== 1 ? 's' : ''})`}
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Complications */}
              {pet.complications && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 mb-4">
                  <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">Complications</p>
                    <p className="text-xs text-amber-700">{pet.complications}</p>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="flex gap-2 pt-3 border-t border-[var(--color-border)]">
                <button
                  onClick={() => setSelectedPet(pet)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[var(--color-bg)] hover:bg-[var(--color-primary)]/10 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  <Syringe size={14} /> {pet.vaccinations.length} Vaccines
                </button>
                <button
                  onClick={() => setSelectedPet(pet)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[var(--color-bg)] hover:bg-[var(--color-primary)]/10 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  <FileText size={14} /> {pet.medicalRecords.length} Records
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Pet Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingPet(null); resetForm(); }}
        title={editingPet ? 'Edit Pet' : 'Add New Pet'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Pet Name *"
              placeholder="Buddy"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--color-text)]">Species *</label>
              <select
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)]"
                value={formData.species}
                onChange={(e) => setFormData({ ...formData, species: e.target.value })}
              >
                {['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Hamster', 'Turtle', 'Other'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Breed *"
              placeholder="Golden Retriever"
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              required
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--color-text)]">Gender *</label>
              <select
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)]"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Age (years) *"
              type="number"
              min="0"
              value={formData.age.toString()}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
              required
            />
            <Input
              label="Weight (kg)"
              type="number"
              step="0.1"
              min="0"
              value={formData.weight.toString()}
              onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Color"
              placeholder="Golden"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
          </div>

          <Input
            label="Microchip ID"
            placeholder="Enter microchip ID"
            value={formData.microchipId}
            onChange={(e) => setFormData({ ...formData, microchipId: e.target.value })}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--color-text)]">Allergies</label>
            <textarea
              rows={2}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] resize-none"
              placeholder="List any known allergies..."
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--color-text)]">Complications / Special Needs</label>
            <textarea
              rows={2}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] resize-none"
              placeholder="Any medical complications or special care needs..."
              value={formData.complications}
              onChange={(e) => setFormData({ ...formData, complications: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => { setShowAddModal(false); setEditingPet(null); resetForm(); }} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={formLoading} className="flex-1">
              {editingPet ? 'Update Pet' : 'Add Pet'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Pet Details Modal */}
      <Modal
        isOpen={!!selectedPet}
        onClose={() => setSelectedPet(null)}
        title={selectedPet ? `${selectedPet.name}'s Health Records` : ''}
        size="xl"
      >
        {selectedPet && (
          <div className="space-y-6">
            {/* Vaccination History */}
            <div>
              <h4 className="text-base font-bold text-[var(--color-text)] mb-3 flex items-center gap-2">
                <Syringe size={18} className="text-[var(--color-primary)]" />
                Vaccination History
              </h4>
              {selectedPet.vaccinations.length === 0 ? (
                <p className="text-sm text-[var(--color-text-secondary)] italic">No vaccination records yet</p>
              ) : (
                <div className="space-y-2">
                  {selectedPet.vaccinations.map((vax) => (
                    <div key={vax.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                      <div>
                        <p className="text-sm font-medium text-[var(--color-text)]">{vax.vaccineName}</p>
                        <p className="text-xs text-[var(--color-text-secondary)]">Given: {formatDate(vax.dateAdministered)}</p>
                      </div>
                      {vax.nextDueDate && (
                        <span className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                          Next: {formatDate(vax.nextDueDate)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Medical Records */}
            <div>
              <h4 className="text-base font-bold text-[var(--color-text)] mb-3 flex items-center gap-2">
                <FileText size={18} className="text-[var(--color-secondary)]" />
                Medical History
              </h4>
              {selectedPet.medicalRecords.length === 0 ? (
                <p className="text-sm text-[var(--color-text-secondary)] italic">No medical records yet</p>
              ) : (
                <div className="space-y-2">
                  {selectedPet.medicalRecords.map((record) => (
                    <div key={record.id} className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-[var(--color-text)]">{record.diagnosis}</p>
                        <span className="text-xs text-[var(--color-text-secondary)]">{formatDate(record.visitDate)}</span>
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)]">Treatment: {record.treatment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
