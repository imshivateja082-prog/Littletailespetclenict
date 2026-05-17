'use client';

import React from 'react';
import Link from 'next/link';
import { Syringe, Scissors, UtensilsCrossed, Pill, Stethoscope, ArrowRight, ShoppingBag } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function Services() {
  const services = [
    {
      icon: <Stethoscope className="w-7 h-7" />,
      title: 'General Checkup',
      description: 'Complete physical examinations, health screenings, and wellness programs for all pet life stages by Dr. Ganesh Kumar.',
      color: 'from-[#1565C0] to-[#42A5F5]',
      bgColor: 'bg-blue-50 border border-blue-100',
      iconColor: 'text-[#1565C0]',
      price: 'Consult',
    },
    {
      icon: <Syringe className="w-7 h-7" />,
      title: 'Vaccination',
      description: 'Comprehensive vaccination programs to protect your pet from preventable diseases. Core and non-core vaccines available.',
      color: 'from-[#2E7D32] to-[#43A047]',
      bgColor: 'bg-green-50 border border-green-100',
      iconColor: 'text-[#2E7D32]',
      price: 'Available',
    },
    {
      icon: <Scissors className="w-7 h-7" />,
      title: 'Grooming',
      description: 'Professional grooming services including bathing, haircuts, nail trimming, ear cleaning, and dental care for your pet.',
      color: 'from-[#E53935] to-[#EF5350]',
      bgColor: 'bg-red-50 border border-red-100',
      iconColor: 'text-[#E53935]',
      price: 'Available',
    },
    {
      icon: <UtensilsCrossed className="w-7 h-7" />,
      title: 'Pet Food & Nutrition',
      description: 'Premium pet food brands and expert nutritional counseling tailored to your pet\'s specific dietary needs and health goals.',
      color: 'from-[#1565C0] to-[#42A5F5]',
      bgColor: 'bg-blue-50 border border-blue-100',
      iconColor: 'text-[#1565C0]',
      price: 'In Stock',
    },
    {
      icon: <Pill className="w-7 h-7" />,
      title: 'Medicine',
      description: 'Full-service pet pharmacy with prescription medications, supplements, and parasite prevention products available.',
      color: 'from-[#2E7D32] to-[#43A047]',
      bgColor: 'bg-green-50 border border-green-100',
      iconColor: 'text-[#2E7D32]',
      price: 'Available',
    },
    {
      icon: <ShoppingBag className="w-7 h-7" />,
      title: 'Pet Accessories',
      description: 'Wide range of pet accessories — leashes, collars, toys, beds, bowls, carriers and more. Everything your pet needs!',
      color: 'from-[#E53935] to-[#EF5350]',
      bgColor: 'bg-red-50 border border-red-100',
      iconColor: 'text-[#E53935]',
      price: 'In Stock',
    },
  ];

  return (
    <section id="services" className="py-20 lg:py-32 bg-[#F5F7FA] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 mb-6">
            <span className="text-sm font-medium text-[#2E7D32]">Our Services</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A2332] mb-4">
            Pet Care, Pet Food &amp; <span className="text-[#2E7D32]">Pet Accessories</span>
          </h2>
          <p className="text-[#5F6B7A] text-lg">
            Everything your pet needs — all available at Little Tails Pet Clinic, Zaheerabad. From medical care to daily essentials.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group relative bg-white rounded-2xl p-6 border border-[#DDE3EC] card-hover overflow-hidden shadow-sm"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient accent */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${service.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              <div className={`w-14 h-14 rounded-2xl ${service.bgColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <span className={service.iconColor}>{service.icon}</span>
              </div>

              <h3 className="text-xl font-bold text-[#1A2332] mb-3">{service.title}</h3>
              <p className="text-sm text-[#5F6B7A] leading-relaxed mb-4">{service.description}</p>

              <div className="flex items-center justify-between pt-4 border-t border-[#DDE3EC]">
                <span className="text-sm font-semibold text-[#1565C0]">{service.price}</span>
                <Link href="/register" className="flex items-center gap-1 text-sm font-medium text-[#5F6B7A] hover:text-[#1565C0] transition-colors group/link">
                  Book Now
                  <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-white rounded-2xl p-8 border border-[#DDE3EC] shadow-lg shadow-blue-500/5 max-w-2xl">
            <h3 className="text-2xl font-bold text-[#1A2332] mb-3">Visit Us Today!</h3>
            <p className="text-[#5F6B7A] mb-4">
              📍 Near Adarsh Nagar Gate, Zaheerabad &nbsp;|&nbsp; 📞 <a href="tel:7013127334" className="text-[#1565C0] font-semibold hover:underline">7013127334</a>
            </p>
            <p className="text-[#5F6B7A] mb-6">
              Schedule a consultation with Dr. Ganesh Kumar for personalized pet care.
            </p>
            <Link href="/register">
              <Button size="lg">
                Schedule Consultation
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
