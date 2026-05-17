'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PetDetailModal from '@/components/admin/PetDetailModal';
import { Search, Dog, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface Pet {
  id: string;
  registrationNo: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  weight?: number;
  complications?: string;
  owner: { firstName: string; lastName: string; email: string; phone?: string };
  _count: { vaccinations: number; medicalRecords: number; appointments: number };
}

export default function AdminPetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  const fetchPets = async (query = '') => {
    try {
      const res = await fetch(`/api/admin/pets?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      setPets(data.pets || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const loadPets = async () => {
      await fetchPets();
    };
    void loadPets();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchPets(search);
  };

  const petEmoji = (species: string) => {
    const emojis: Record<string, string> = { dog: '🐕', cat: '🐈', bird: '🐦', rabbit: '🐰', fish: '🐠', hamster: '🐹' };
    return emojis[species.toLowerCase()] || '🐾';
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text)]">All Registered Pets</h2>
        <p className="text-[var(--color-text-secondary)]">Search by registration number, name, breed, phone, or email</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by registration no., pet name, owner phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={18} />}
          />
        </div>
        <button type="submit" className="px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-dark)] transition-colors">
          Search
        </button>
      </form>

      {/* Results */}
      <p className="text-sm text-[var(--color-text-secondary)]">{pets.length} pet(s) found</p>

      {pets.length === 0 ? (
        <Card className="text-center py-12">
          <Dog size={48} className="mx-auto text-[var(--color-text-secondary)] mb-4" />
          <p className="text-[var(--color-text-secondary)]">No pets found matching your search</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map((pet) => (
            <Card 
              key={pet.id} 
              className="relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedPetId(pet.id)}
            >
              <div className="absolute top-0 left-0 right-0 h-1 gradient-secondary"></div>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-xl">
                  {petEmoji(pet.species)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-text)]">{pet.name}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">{pet.breed} • {pet.species}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-2 rounded-lg bg-[var(--color-bg)]">
                  <p className="text-xs text-[var(--color-text-secondary)]">Reg. No.</p>
                  <p className="text-xs font-mono text-[var(--color-primary)] truncate">{pet.registrationNo}</p>
                </div>
                <div className="p-2 rounded-lg bg-[var(--color-bg)]">
                  <p className="text-xs text-[var(--color-text-secondary)]">Age</p>
                  <p className="text-sm font-medium text-[var(--color-text)]">{pet.age} yrs</p>
                </div>
                <div className="p-2 rounded-lg bg-[var(--color-bg)]">
                  <p className="text-xs text-[var(--color-text-secondary)]">Gender</p>
                  <p className="text-sm font-medium text-[var(--color-text)]">{pet.gender}</p>
                </div>
                <div className="p-2 rounded-lg bg-[var(--color-bg)]">
                  <p className="text-xs text-[var(--color-text-secondary)]">Weight</p>
                  <p className="text-sm font-medium text-[var(--color-text)]">{pet.weight ? `${pet.weight} kg` : 'N/A'}</p>
                </div>
              </div>

              {/* Owner Info */}
              <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] mb-3">
                <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Owner</p>
                <p className="text-sm font-medium text-[var(--color-text)]">{pet.owner.firstName} {pet.owner.lastName}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">{pet.owner.email}</p>
                {pet.owner.phone && <p className="text-xs text-[var(--color-text-secondary)]">📱 {pet.owner.phone}</p>}
              </div>

              {/* Stats */}
              <div className="flex gap-2 text-xs text-[var(--color-text-secondary)] mb-3">
                <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-600">
                  💉 {pet._count.vaccinations} vaccines
                </span>
                <span className="px-2 py-1 rounded-md bg-blue-50 text-[#1565C0]">
                  📋 {pet._count.medicalRecords} records
                </span>
                <span className="px-2 py-1 rounded-md bg-green-50 text-[#2E7D32]">
                  📅 {pet._count.appointments} visits
                </span>
              </div>

              {/* View Details Button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPetId(pet.id);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium hover:bg-[var(--color-primary)]/20 transition-colors"
              >
                <Eye size={16} /> View Details
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* Pet Detail Modal */}
      <PetDetailModal 
        isOpen={selectedPetId !== null} 
        onClose={() => setSelectedPetId(null)} 
        petId={selectedPetId || undefined}
      />
    </div>
  );
}
