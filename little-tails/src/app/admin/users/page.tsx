'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Search, Users } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  _count: { pets: number; appointments: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  const fetchUsers = async (query = '', page = 1) => {
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(query)}&page=${page}`);
      const data = await res.json();
      setUsers(data.users || []);
      setPagination(data.pagination || { total: 0, page: 1, totalPages: 1 });
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const loadUsers = async () => {
      await fetchUsers();
    };
    void loadUsers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchUsers(search);
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text)]">Manage Users</h2>
        <p className="text-[var(--color-text-secondary)]">View and manage registered users ({pagination.total} total)</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={18} />}
          />
        </div>
        <button type="submit" className="px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-dark)] transition-colors">
          Search
        </button>
      </form>

      {/* Users Table */}
      {users.length === 0 ? (
        <Card className="text-center py-12">
          <Users size={48} className="mx-auto text-[var(--color-text-secondary)] mb-4" />
          <p className="text-[var(--color-text-secondary)]">No users found</p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-[var(--color-bg)] border border-[var(--color-border)] text-left">
                <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase rounded-tl-xl">User</th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Email</th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Phone</th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Pets</th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Appointments</th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Joined</th>
                <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase rounded-tr-xl">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="bg-[var(--color-surface)] border-x border-b border-[var(--color-border)] last:rounded-b-xl">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-xs">
                        {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-[var(--color-text)]">{u.firstName} {u.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--color-text-secondary)]">{u.email}</td>
                  <td className="px-4 py-4 text-sm text-[var(--color-text-secondary)]">{u.phone || '-'}</td>
                  <td className="px-4 py-4 text-sm text-[var(--color-text)]">{u._count.pets}</td>
                  <td className="px-4 py-4 text-sm text-[var(--color-text)]">{u._count.appointments}</td>
                  <td className="px-4 py-4 text-sm text-[var(--color-text-secondary)]">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => { setLoading(true); fetchUsers(search, page); }}
              className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                page === pagination.page
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-border)]/50'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
