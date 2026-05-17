'use client';

import React from 'react';
import { Heart, Users, Clock, Stethoscope, ShieldCheck, Award } from 'lucide-react';

export default function About() {
  const features = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Vet Care With Heart',
      description: 'We treat every pet with the love and attention they deserve, ensuring a stress-free experience at our clinic.',
      color: 'bg-red-50 text-[#E53935] border border-red-100',
    },
    {
      icon: <Stethoscope className="w-6 h-6" />,
      title: 'Expert Veterinarian',
      description: 'Led by Dr. Ganesh Kumar (B.V.Sc & A.H), our clinic offers certified veterinary care and expert medical treatment.',
      color: 'bg-blue-50 text-[#1565C0] border border-blue-100',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Committed to Wellness',
      description: 'Your pet\'s health and wellness is our top priority. We provide timely and compassionate care.',
      color: 'bg-green-50 text-[#2E7D32] border border-green-100',
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: 'Treats With Value',
      description: 'Quality veterinary services, premium pet food and accessories — all at value-driven prices.',
      color: 'bg-blue-50 text-[#1565C0] border border-blue-100',
    },
  ];

  return (
    <section id="about" className="py-20 lg:py-32 relative overflow-hidden bg-white">
      <div className="absolute inset-0 gradient-mesh opacity-50"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-6">
            <Stethoscope size={14} className="text-[#1565C0]" />
            <span className="text-sm font-medium text-[#1565C0]">About Us</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A2332] mb-4">
            Why Choose <span className="text-[#1565C0]">Little Tails</span>?
          </h2>
          <p className="text-[#5F6B7A] text-lg">
            Little Tails Pet Clinic is your trusted partner for complete pet care in Zaheerabad. Led by Dr. Ganesh Kumar, we&apos;re committed to your pet&apos;s wellness.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl p-6 border border-[#DDE3EC] card-hover group shadow-sm"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-[#1A2332] mb-2">{feature.title}</h3>
              <p className="text-sm text-[#5F6B7A] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* About Content */}
        <div className="mt-20 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-2xl sm:text-3xl font-bold text-[#1A2332]">
              Your Pet&apos;s Health, <span className="text-[#E53935]">Our Priority</span>
            </h3>
            <p className="text-[#5F6B7A] leading-relaxed">
              Little Tails Pet Clinic, located near Adarsh Nagar Gate in Zaheerabad, is a trusted name
              in veterinary care. Under the expert guidance of Dr. Ganesh Kumar (B.V.Sc &amp; A.H),
              we offer comprehensive pet health services with a warm and caring approach.
            </p>
            <p className="text-[#5F6B7A] leading-relaxed">
              We believe that every pet deserves the best care. That&apos;s why we offer not just medical
              treatment, but also premium pet food, pet accessories, nutritional guidance, vaccination
              programs, grooming services, and regular wellness checkups — all under one roof.
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              {['Vaccinations', 'Pet Food', 'Pet Accessories', 'Grooming'].map((tag, i) => {
                const colors = [
                  'bg-blue-50 text-[#1565C0] border-blue-200',
                  'bg-green-50 text-[#2E7D32] border-green-200',
                  'bg-red-50 text-[#E53935] border-red-200',
                  'bg-blue-50 text-[#1565C0] border-blue-200',
                ];
                return (
                  <span
                    key={tag}
                    className={`px-4 py-2 rounded-full text-sm font-medium border ${colors[i]}`}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-3xl p-8 border border-[#DDE3EC] shadow-xl shadow-blue-500/5">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { emoji: '🐕', count: 'Zaheerabad', label: 'Our Location', color: 'text-[#1565C0]', bg: 'bg-blue-50 border-blue-100' },
                  { emoji: '👨‍⚕️', count: 'Dr. Ganesh', label: 'B.V.Sc & A.H', color: 'text-[#2E7D32]', bg: 'bg-green-50 border-green-100' },
                  { emoji: '📞', count: '7013127334', label: 'Call Us', color: 'text-[#E53935]', bg: 'bg-red-50 border-red-100' },
                  { emoji: '🏥', count: 'All-in-One', label: 'Care + Food + Accessories', color: 'text-[#1565C0]', bg: 'bg-blue-50 border-blue-100' },
                ].map((stat) => (
                  <div key={stat.label} className={`text-center p-4 rounded-2xl border ${stat.bg}`}>
                    <div className="text-3xl mb-2">{stat.emoji}</div>
                    <p className={`text-lg font-bold ${stat.color}`}>{stat.count}</p>
                    <p className="text-xs text-[#5F6B7A] mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
