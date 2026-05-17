'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import { Dog, Calendar, Bell, MessageSquare, Plus, ArrowRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDate, getStatusColor, getServiceLabel } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  serviceType: string;
  status: string;
  pet: { name: string; species: string };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [petsRes, aptsRes] = await Promise.all([
          fetch('/api/pets'),
          fetch('/api/appointments'),
        ]);
        const petsData = await petsRes.json();
        const aptsData = await aptsRes.json();
        setPets(petsData.pets || []);
        setAppointments(aptsData.appointments || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const pendingAppointments = appointments.filter(a => a.status === 'PENDING').length;
  const upcomingAppointments = appointments.filter(a => 
    a.status === 'APPROVED' && new Date(a.date) >= new Date()
  );

  const stats = [
    {
      label: 'My Pets',
      value: pets.length,
      icon: <Dog size={24} />,
      color: 'from-[#1565C0] to-[#42A5F5]',
      bgColor: 'bg-blue-50 border border-blue-100',
      iconColor: 'text-[#1565C0]',
      href: '/dashboard/pets',
    },
    {
      label: 'Appointments',
      value: appointments.length,
      icon: <Calendar size={24} />,
      color: 'from-[#2E7D32] to-[#43A047]',
      bgColor: 'bg-green-50 border border-green-100',
      iconColor: 'text-[#2E7D32]',
      href: '/dashboard/appointments',
    },
    {
      label: 'Pending',
      value: pendingAppointments,
      icon: <Clock size={24} />,
      color: 'from-[#E53935] to-[#EF5350]',
      bgColor: 'bg-red-50 border border-red-100',
      iconColor: 'text-[#E53935]',
      href: '/dashboard/appointments',
    },
    {
      label: 'AI Assistant',
      value: '24/7',
      icon: <MessageSquare size={24} />,
      color: 'from-[#1565C0] to-[#42A5F5]',
      bgColor: 'bg-blue-50 border border-blue-100',
      iconColor: 'text-[#1565C0]',
      href: '/dashboard/ai-assistant',
    },
  ];

  const petEmoji = (species: string) => {
    const emojis: Record<string, string> = {
      dog: '🐕',
      cat: '🐈',
      bird: '🐦',
      rabbit: '🐰',
      fish: '🐠',
      hamster: '🐹',
    };
    return emojis[species.toLowerCase()] || '🐾';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm">
              <div className="shimmer h-4 w-20 rounded-lg mb-3"></div>
              <div className="shimmer h-8 w-12 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A2332]">
            Welcome back, {user?.firstName}! 👋
          </h2>
          <p className="text-[#5F6B7A] mt-1">
            Here&apos;s an overview of your pet care dashboard
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/pets">
            <Button size="sm">
              <Plus size={16} />
              Add Pet
            </Button>
          </Link>
          <Link href="/dashboard/appointments">
            <Button variant="outline" size="sm">
              <Calendar size={16} />
              Book Appointment
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card hover className="relative overflow-hidden shadow-sm">
              <div className={`absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-br ${stat.color} opacity-8 -translate-y-4 translate-x-4`}></div>
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3`}>
                <span className={stat.iconColor}>{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-[#1A2332]">{stat.value}</p>
              <p className="text-sm text-[#5F6B7A]">{stat.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Pets */}
        <Card className="shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#1A2332]">My Pets</h3>
            <Link href="/dashboard/pets" className="text-sm text-[#1565C0] hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {pets.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🐾</div>
              <p className="text-[#5F6B7A]">No pets added yet</p>
              <Link href="/dashboard/pets">
                <Button size="sm" className="mt-3">
                  <Plus size={16} />
                  Add Your First Pet
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {pets.slice(0, 4).map((pet) => (
                <div key={pet.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F7FA] border border-[#DDE3EC]">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl">
                    {petEmoji(pet.species)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#1A2332]">{pet.name}</p>
                    <p className="text-xs text-[#5F6B7A]">{pet.breed} • {pet.age} {pet.age === 1 ? 'year' : 'years'} old</p>
                  </div>
                  <Link href={`/dashboard/pets`} className="text-[#1565C0]">
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming Appointments */}
        <Card className="shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#1A2332]">Recent Appointments</h3>
            <Link href="/dashboard/appointments" className="text-sm text-[#1565C0] hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-[#5F6B7A]">No appointments yet</p>
              <Link href="/dashboard/appointments">
                <Button size="sm" className="mt-3">
                  <Calendar size={16} />
                  Book Appointment
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 4).map((apt) => (
                <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F7FA] border border-[#DDE3EC]">
                  <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center">
                    <Calendar size={18} className="text-[#2E7D32]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A2332] truncate">
                      {getServiceLabel(apt.serviceType)} - {apt.pet.name}
                    </p>
                    <p className="text-xs text-[#5F6B7A]">{formatDate(apt.date)} at {apt.time}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(apt.status)}`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-sm">
        <h3 className="text-lg font-bold text-[#1A2332] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Add Pet', icon: '🐾', href: '/dashboard/pets', color: 'bg-blue-50 border-blue-100' },
            { label: 'Book Visit', icon: '📅', href: '/dashboard/appointments', color: 'bg-green-50 border-green-100' },
            { label: 'AI Chat', icon: '🤖', href: '/dashboard/ai-assistant', color: 'bg-red-50 border-red-100' },
            { label: 'Reminders', icon: '🔔', href: '/dashboard/reminders', color: 'bg-blue-50 border-blue-100' },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`${action.color} rounded-2xl p-4 text-center card-hover border`}
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <p className="text-sm font-medium text-[#1A2332]">{action.label}</p>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
