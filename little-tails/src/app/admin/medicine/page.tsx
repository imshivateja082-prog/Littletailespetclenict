'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Plus, Pencil, Trash2, AlertTriangle, Package } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Medicine {
  id: string;
  name: string;
  category: string;
  description?: string;
  quantity: number;
  unit: string;
  price: number;
  expiryDate?: string;
  manufacturer?: string;
  batchNumber?: string;
  minStock: number;
}

export default function AdminMedicinePage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', category: '', description: '', quantity: 0,
    unit: 'tablets', price: 0, expiryDate: '', manufacturer: '',
    batchNumber: '', minStock: 10,
  });

  const fetchMedicines = async () => {
    try {
      const res = await fetch('/api/admin/medicine');
      const data = await res.json();
      setMedicines(data.medicines || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const loadMedicines = async () => {
      await fetchMedicines();
    };
    void loadMedicines();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '', category: '', description: '', quantity: 0,
      unit: 'tablets', price: 0, expiryDate: '', manufacturer: '',
      batchNumber: '', minStock: 10,
    });
  };

  const openEdit = (med: Medicine) => {
    setFormData({
      name: med.name, category: med.category, description: med.description || '',
      quantity: med.quantity, unit: med.unit, price: med.price,
      expiryDate: med.expiryDate ? med.expiryDate.split('T')[0] : '',
      manufacturer: med.manufacturer || '', batchNumber: med.batchNumber || '',
      minStock: med.minStock,
    });
    setEditingMedicine(med);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const url = editingMedicine ? `/api/admin/medicine/${editingMedicine.id}` : '/api/admin/medicine';
      const method = editingMedicine ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: Number(formData.quantity),
          price: Number(formData.price),
          minStock: Number(formData.minStock),
        }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(editingMedicine ? 'Medicine updated' : 'Medicine added');
      setShowModal(false);
      setEditingMedicine(null);
      resetForm();
      fetchMedicines();
    } catch { toast.error('Failed to save'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this medicine?')) return;
    try {
      await fetch(`/api/admin/medicine/${id}`, { method: 'DELETE' });
      toast.success('Medicine deleted');
      fetchMedicines();
    } catch { toast.error('Failed to delete'); }
  };

  const lowStockMeds = medicines.filter(m => m.quantity <= m.minStock);
  const categories = [...new Set(medicines.map(m => m.category))];

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Medicine Stock</h2>
          <p className="text-[var(--color-text-secondary)]">Manage inventory and track stock levels</p>
        </div>
        <Button onClick={() => { resetForm(); setEditingMedicine(null); setShowModal(true); }}>
          <Plus size={18} /> Add Medicine
        </Button>
      </div>

      {/* Low Stock Alert */}
      {lowStockMeds.length > 0 && (
        <Card className="border-amber-300 bg-amber-50/50">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Low Stock Alert</p>
              <p className="text-xs text-amber-700">
                {lowStockMeds.length} medicine(s) are running low: {lowStockMeds.map(m => m.name).join(', ')}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Stock Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Package size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--color-text)]">{medicines.length}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Total Items</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Package size={20} className="text-[#2E7D32]" />
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--color-text)]">{categories.length}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Categories</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <AlertTriangle size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--color-text)]">{lowStockMeds.length}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Low Stock</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Package size={20} className="text-[#1565C0]" />
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--color-text)]">
                ${medicines.reduce((sum, m) => sum + m.price * m.quantity, 0).toLocaleString()}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">Total Value</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Medicines Table */}
      {medicines.length === 0 ? (
        <Card className="text-center py-12">
          <Package size={48} className="mx-auto text-[var(--color-text-secondary)] mb-4" />
          <p className="text-[var(--color-text-secondary)]">No medicines in stock</p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-[var(--color-bg)] border border-[var(--color-border)] text-left">
                <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase rounded-tl-xl">Medicine</th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Category</th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Stock</th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Price</th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Expiry</th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((med) => (
                <tr key={med.id} className="bg-[var(--color-surface)] border-x border-b border-[var(--color-border)]">
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-[var(--color-text)]">{med.name}</p>
                    {med.manufacturer && <p className="text-xs text-[var(--color-text-secondary)]">{med.manufacturer}</p>}
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-[#1565C0]">
                      {med.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--color-text)]">{med.quantity} {med.unit}</td>
                  <td className="px-4 py-4 text-sm text-[var(--color-text)]">${med.price.toFixed(2)}</td>
                  <td className="px-4 py-4 text-sm text-[var(--color-text-secondary)]">
                    {med.expiryDate ? formatDate(med.expiryDate) : '-'}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                      med.quantity <= med.minStock
                        ? 'bg-red-100 text-red-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {med.quantity <= med.minStock ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(med)} className="p-1.5 rounded-lg hover:bg-[var(--color-border)]/50 text-[var(--color-text-secondary)]">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(med.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingMedicine(null); resetForm(); }}
        title={editingMedicine ? 'Edit Medicine' : 'Add Medicine'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Name *" placeholder="Amoxicillin" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <Input label="Category *" placeholder="Antibiotics" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Quantity *" type="number" min="0" value={formData.quantity.toString()} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} required />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--color-text)]">Unit *</label>
              <select
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)]"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                {['tablets', 'capsules', 'ml', 'mg', 'bottles', 'vials', 'tubes', 'packets'].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <Input label="Price ($) *" type="number" step="0.01" min="0" value={formData.price.toString()} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} required />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Min Stock" type="number" min="0" value={formData.minStock.toString()} onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })} />
            <Input label="Expiry Date" type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} />
            <Input label="Batch Number" placeholder="BN-001" value={formData.batchNumber} onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })} />
          </div>
          <Input label="Manufacturer" placeholder="PharmaCo" value={formData.manufacturer} onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--color-text)]">Description</label>
            <textarea rows={2} className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] resize-none"
              placeholder="Medicine description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setShowModal(false); setEditingMedicine(null); resetForm(); }} className="flex-1">Cancel</Button>
            <Button type="submit" loading={formLoading} className="flex-1">{editingMedicine ? 'Update' : 'Add Medicine'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
