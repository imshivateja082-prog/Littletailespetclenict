'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

interface Vaccination {
  id: string;
  vaccineName: string;
  dateAdministered: string;
  nextDueDate?: string;
  batchNumber?: string;
  veterinarian?: string;
  notes?: string;
}

interface MedicalRecord {
  id: string;
  patientHistory?: string;
  diagnosis: string;
  treatment: string;
  prescription?: string;
  veterinarian?: string;
  visitDate: string;
  followUpDate?: string;
  notes?: string;
}

interface PetDetails {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  weight?: number;
  color?: string;
  microchipId?: string;
  allergies?: string;
  complications?: string;
  owner: { firstName: string; lastName: string; email: string; phone?: string };
  vaccinations: Vaccination[];
  medicalRecords: MedicalRecord[];
}

interface PetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId?: string;
}

export default function PetDetailModal({ isOpen, onClose, petId }: PetDetailModalProps) {
  const [pet, setPet] = useState<PetDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingPetInfo, setEditingPetInfo] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'vaccinations' | 'treatment'>('info');

  // Pet form state
  const [petForm, setPetForm] = useState({
    weight: '',
    allergies: '',
    complications: '',
  });

  // Vaccination form state
  const [showVaccinationForm, setShowVaccinationForm] = useState(false);
  const [vaccinationForm, setVaccinationForm] = useState({
    vaccineName: '',
    dateAdministered: '',
    nextDueDate: '',
    batchNumber: '',
    veterinarian: '',
    notes: '',
  });

  // Medical record form state
  const [showMedicalForm, setShowMedicalForm] = useState(false);
  const [medicalForm, setMedicalForm] = useState({
    patientHistory: '',
    diagnosis: '',
    treatment: '',
    prescription: '',
    veterinarian: '',
    visitDate: '',
    followUpDate: '',
    notes: '',
  });

  const fetchPetDetails = async () => {
    if (!petId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pets/${petId}`);
      const data = await res.json();
      setPet(data.pet);
      setPetForm({
        weight: data.pet.weight?.toString() || '',
        allergies: data.pet.allergies || '',
        complications: data.pet.complications || '',
      });
    } catch (error) {
      toast.error('Failed to load pet details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && petId) {
      const loadPetDetails = async () => {
        await fetchPetDetails();
      };
      void loadPetDetails();
    }
  }, [isOpen, petId]);

  const handleUpdatePet = async () => {
    if (!pet) return;
    try {
      const res = await fetch(`/api/admin/pets/${pet.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: petForm.weight ? parseFloat(petForm.weight) : null,
          allergies: petForm.allergies || null,
          complications: petForm.complications || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to update');
      const data = await res.json();
      setPet(data.pet);
      setEditingPetInfo(false);
      toast.success('Pet updated successfully');
    } catch (error) {
      toast.error('Failed to update pet');
    }
  };

  const handleAddVaccination = async () => {
    if (!pet || !vaccinationForm.vaccineName || !vaccinationForm.dateAdministered) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      const res = await fetch(`/api/admin/pets/${pet.id}/vaccinations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vaccinationForm),
      });

      if (!res.ok) throw new Error('Failed to add vaccination');
      const data = await res.json();
      setPet(data.pet);
      setVaccinationForm({
        vaccineName: '',
        dateAdministered: '',
        nextDueDate: '',
        batchNumber: '',
        veterinarian: '',
        notes: '',
      });
      setShowVaccinationForm(false);
      toast.success('Vaccination added successfully');
    } catch (error) {
      toast.error('Failed to add vaccination');
    }
  };

  const handleDeleteVaccination = async (vaccinationId: string) => {
    if (!pet) return;
    if (!confirm('Are you sure you want to delete this vaccination?')) return;

    try {
      const res = await fetch(
        `/api/admin/pets/${pet.id}/vaccinations/${vaccinationId}`,
        { method: 'DELETE' }
      );

      if (!res.ok) throw new Error('Failed to delete');
      const data = await res.json();
      setPet(data.pet);
      toast.success('Vaccination deleted successfully');
    } catch (error) {
      toast.error('Failed to delete vaccination');
    }
  };

  const handleAddMedicalRecord = async () => {
    if (!pet || !medicalForm.diagnosis || !medicalForm.treatment || !medicalForm.visitDate) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      const res = await fetch(`/api/admin/pets/${pet.id}/medical-records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicalForm),
      });

      if (!res.ok) throw new Error('Failed to add medical record');
      const data = await res.json();
      setPet(data.pet);
      setMedicalForm({
        patientHistory: '',
        diagnosis: '',
        treatment: '',
        prescription: '',
        veterinarian: '',
        visitDate: '',
        followUpDate: '',
        notes: '',
      });
      setShowMedicalForm(false);
      toast.success('Treatment record added successfully');
    } catch (error) {
      toast.error('Failed to add treatment record');
    }
  };

  const handleDeleteMedicalRecord = async (recordId: string) => {
    if (!pet) return;
    if (!confirm('Are you sure you want to delete this treatment record?')) return;

    try {
      const res = await fetch(
        `/api/admin/pets/${pet.id}/medical-records/${recordId}`,
        { method: 'DELETE' }
      );

      if (!res.ok) throw new Error('Failed to delete');
      const data = await res.json();
      setPet(data.pet);
      toast.success('Treatment record deleted successfully');
    } catch (error) {
      toast.error('Failed to delete treatment record');
    }
  };

  if (!isOpen || !petId) return null;

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </Modal>
    );
  }

  if (!pet) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <div className="text-center py-12">
          <p className="text-[var(--color-text-secondary)]">Pet not found</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${pet.name}'s Profile`} size="xl">
      {/* Tab Navigation */}
      <div className="flex gap-4 px-6 py-4 border-b border-[var(--color-border)]">
        {(['info', 'vaccinations', 'treatment'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
            }`}
          >
            {tab === 'info' && 'Pet Info'}
            {tab === 'vaccinations' && `Vaccinations (${pet.vaccinations.length})`}
            {tab === 'treatment' && `Treatment History (${pet.medicalRecords.length})`}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-6">
        {/* PET INFO TAB */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">Basic Information</h3>
              <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Name</label>
                  <p className="text-[var(--color-text)] font-medium">{pet.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Species</label>
                  <p className="text-[var(--color-text)] font-medium">{pet.species}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Breed</label>
                  <p className="text-[var(--color-text)] font-medium">{pet.breed}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Age</label>
                  <p className="text-[var(--color-text)] font-medium">{pet.age} years</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Gender</label>
                  <p className="text-[var(--color-text)] font-medium">{pet.gender}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Color</label>
                  <p className="text-[var(--color-text)] font-medium">{pet.color || 'N/A'}</p>
                </div>
                {pet.microchipId && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Microchip ID</label>
                    <p className="text-[var(--color-text)] font-medium font-mono text-sm">{pet.microchipId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Editable Health Info */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[var(--color-text)]">Health Information</h3>
                <button
                  onClick={() => setEditingPetInfo(!editingPetInfo)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 transition-colors"
                >
                  {editingPetInfo ? <X size={16} /> : <Edit2 size={16} />}
                  {editingPetInfo ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {editingPetInfo ? (
                <div className="space-y-4 p-4 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                  <Input
                    label="Weight (kg)"
                    type="number"
                    step="0.1"
                    value={petForm.weight}
                    onChange={(e) => setPetForm({ ...petForm, weight: e.target.value })}
                    placeholder="e.g., 25.5"
                  />
                  <Input
                    label="Allergies"
                    value={petForm.allergies}
                    onChange={(e) => setPetForm({ ...petForm, allergies: e.target.value })}
                    placeholder="List any known allergies"
                  />
                  <Input
                    label="Complications/Medical Conditions"
                    value={petForm.complications}
                    onChange={(e) => setPetForm({ ...petForm, complications: e.target.value })}
                    placeholder="Any existing health conditions"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdatePet}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
                    >
                      <Save size={18} /> Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Weight</label>
                    <p className="text-[var(--color-text)] font-medium">{petForm.weight ? `${petForm.weight} kg` : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Allergies</label>
                    <p className="text-[var(--color-text)] font-medium">{petForm.allergies || 'None reported'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Complications</label>
                    <p className="text-[var(--color-text)] font-medium">{petForm.complications || 'None reported'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Owner Info */}
            <div>
              <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">Owner Information</h3>
              <div className="p-4 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Name</label>
                  <p className="text-[var(--color-text)] font-medium">{pet.owner.firstName} {pet.owner.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Email</label>
                  <p className="text-[var(--color-text)]">{pet.owner.email}</p>
                </div>
                {pet.owner.phone && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Phone</label>
                    <p className="text-[var(--color-text)]">{pet.owner.phone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VACCINATIONS TAB */}
        {activeTab === 'vaccinations' && (
          <div className="space-y-4">
            {!showVaccinationForm ? (
              <button
                onClick={() => setShowVaccinationForm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                <Plus size={18} /> Add Vaccination
              </button>
            ) : (
              <div className="p-4 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-[var(--color-text)]">Add New Vaccination</h4>
                  <button onClick={() => setShowVaccinationForm(false)} className="text-[var(--color-text-secondary)]">
                    <X size={18} />
                  </button>
                </div>
                <Input
                  label="Vaccine Name *"
                  value={vaccinationForm.vaccineName}
                  onChange={(e) => setVaccinationForm({ ...vaccinationForm, vaccineName: e.target.value })}
                  placeholder="e.g., Rabies, DHPP"
                />
                <Input
                  label="Date Administered *"
                  type="date"
                  value={vaccinationForm.dateAdministered}
                  onChange={(e) => {
                    const adminDate = e.target.value;
                    let autoNextDate = vaccinationForm.nextDueDate;
                    // Auto-fill next due date to 1 year later if not already set
                    if (adminDate && !vaccinationForm.nextDueDate) {
                      const d = new Date(adminDate);
                      d.setFullYear(d.getFullYear() + 1);
                      autoNextDate = d.toISOString().split('T')[0];
                    }
                    setVaccinationForm({ ...vaccinationForm, dateAdministered: adminDate, nextDueDate: autoNextDate });
                  }}
                />
                <Input
                  label="Next Due Date"
                  type="date"
                  value={vaccinationForm.nextDueDate}
                  onChange={(e) => setVaccinationForm({ ...vaccinationForm, nextDueDate: e.target.value })}
                />
                <Input
                  label="Batch Number"
                  value={vaccinationForm.batchNumber}
                  onChange={(e) => setVaccinationForm({ ...vaccinationForm, batchNumber: e.target.value })}
                />
                <Input
                  label="Veterinarian"
                  value={vaccinationForm.veterinarian}
                  onChange={(e) => setVaccinationForm({ ...vaccinationForm, veterinarian: e.target.value })}
                />
                <Input
                  label="Notes"
                  value={vaccinationForm.notes}
                  onChange={(e) => setVaccinationForm({ ...vaccinationForm, notes: e.target.value })}
                  placeholder="Any additional notes"
                />
                <button
                  onClick={handleAddVaccination}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
                >
                  Save Vaccination
                </button>
              </div>
            )}

            {pet.vaccinations.length === 0 ? (
              <div className="text-center py-8 text-[var(--color-text-secondary)]">
                No vaccinations recorded yet
              </div>
            ) : (
              <div className="space-y-3">
                {pet.vaccinations.map((vax) => (
                  <div key={vax.id} className="p-4 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-[var(--color-text)]">{vax.vaccineName}</h4>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          Administered: {formatDate(new Date(vax.dateAdministered))}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteVaccination(vax.id)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      {vax.nextDueDate && (
                        <div>
                          <span className="text-[var(--color-text-secondary)]">Next Due:</span>
                          <p className="text-[var(--color-text)] font-medium">{formatDate(new Date(vax.nextDueDate))}</p>
                        </div>
                      )}
                      {vax.batchNumber && (
                        <div>
                          <span className="text-[var(--color-text-secondary)]">Batch:</span>
                          <p className="text-[var(--color-text)] font-mono">{vax.batchNumber}</p>
                        </div>
                      )}
                      {vax.veterinarian && (
                        <div>
                          <span className="text-[var(--color-text-secondary)]">Veterinarian:</span>
                          <p className="text-[var(--color-text)]">{vax.veterinarian}</p>
                        </div>
                      )}
                      {vax.notes && (
                        <div className="col-span-2">
                          <span className="text-[var(--color-text-secondary)]">Notes:</span>
                          <p className="text-[var(--color-text)]">{vax.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TREATMENT HISTORY TAB */}
        {activeTab === 'treatment' && (
          <div className="space-y-4">
            {!showMedicalForm ? (
              <button
                onClick={() => setShowMedicalForm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                <Plus size={18} /> Add Treatment Record
              </button>
            ) : (
              <div className="p-4 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-[var(--color-text)]">Add Treatment Record</h4>
                  <button onClick={() => setShowMedicalForm(false)} className="text-[var(--color-text-secondary)]">
                    <X size={18} />
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Patient History</label>
                  <textarea
                    value={medicalForm.patientHistory}
                    onChange={(e) => setMedicalForm({ ...medicalForm, patientHistory: e.target.value })}
                    placeholder="Relevant patient history, previous conditions, ongoing treatments, allergies, etc."
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all resize-vertical"
                  />
                </div>
                <Input
                  label="Diagnosis *"
                  value={medicalForm.diagnosis}
                  onChange={(e) => setMedicalForm({ ...medicalForm, diagnosis: e.target.value })}
                  placeholder="Diagnosed condition"
                />
                <Input
                  label="Treatment *"
                  value={medicalForm.treatment}
                  onChange={(e) => setMedicalForm({ ...medicalForm, treatment: e.target.value })}
                  placeholder="Treatment provided"
                />
                <Input
                  label="Prescription"
                  value={medicalForm.prescription}
                  onChange={(e) => setMedicalForm({ ...medicalForm, prescription: e.target.value })}
                  placeholder="Prescribed medications"
                />
                <Input
                  label="Veterinarian"
                  value={medicalForm.veterinarian}
                  onChange={(e) => setMedicalForm({ ...medicalForm, veterinarian: e.target.value })}
                />
                <Input
                  label="Visit Date *"
                  type="date"
                  value={medicalForm.visitDate}
                  onChange={(e) => setMedicalForm({ ...medicalForm, visitDate: e.target.value })}
                />
                <Input
                  label="Follow-up Date"
                  type="date"
                  value={medicalForm.followUpDate}
                  onChange={(e) => setMedicalForm({ ...medicalForm, followUpDate: e.target.value })}
                />
                <Input
                  label="Notes"
                  value={medicalForm.notes}
                  onChange={(e) => setMedicalForm({ ...medicalForm, notes: e.target.value })}
                  placeholder="Additional notes"
                />
                <button
                  onClick={handleAddMedicalRecord}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
                >
                  Save Treatment Record
                </button>
              </div>
            )}

            {pet.medicalRecords.length === 0 ? (
              <div className="text-center py-8 text-[var(--color-text-secondary)]">
                No treatment records found
              </div>
            ) : (
              <div className="space-y-3">
                {pet.medicalRecords.map((record) => (
                  <div key={record.id} className="p-4 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-[var(--color-text)]">{record.diagnosis}</h4>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          Visit: {formatDate(new Date(record.visitDate))}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteMedicalRecord(record.id)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      {record.patientHistory && (
                        <div>
                          <span className="text-[var(--color-text-secondary)]">Patient History:</span>
                          <p className="text-[var(--color-text)]">{record.patientHistory}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-[var(--color-text-secondary)]">Treatment:</span>
                        <p className="text-[var(--color-text)]">{record.treatment}</p>
                      </div>
                      {record.prescription && (
                        <div>
                          <span className="text-[var(--color-text-secondary)]">Prescription:</span>
                          <p className="text-[var(--color-text)]">{record.prescription}</p>
                        </div>
                      )}
                      {record.veterinarian && (
                        <div>
                          <span className="text-[var(--color-text-secondary)]">Veterinarian:</span>
                          <p className="text-[var(--color-text)]">{record.veterinarian}</p>
                        </div>
                      )}
                      {record.followUpDate && (
                        <div>
                          <span className="text-[var(--color-text-secondary)]">Follow-up Date:</span>
                          <p className="text-[var(--color-text)]">{formatDate(new Date(record.followUpDate))}</p>
                        </div>
                      )}
                      {record.notes && (
                        <div>
                          <span className="text-[var(--color-text-secondary)]">Notes:</span>
                          <p className="text-[var(--color-text)]">{record.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
