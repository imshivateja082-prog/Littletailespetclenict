'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Heart, Shield, ArrowRight, PawPrint, Stethoscope, HeartPulse, Activity } from 'lucide-react';

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-20 bg-gradient-to-br from-white via-blue-50/30 to-white">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 gradient-mesh"></div>
      
      {/* Floating decorations */}
      <div className="absolute top-32 left-10 opacity-10 animate-float">
        <HeartPulse size={40} className="text-[#E53935]" />
      </div>
      <div className="absolute top-48 right-20 opacity-10 animate-float-delayed">
        <PawPrint size={30} className="text-[#1565C0]" />
      </div>
      <div className="absolute bottom-32 left-1/4 opacity-8 animate-float">
        <Heart size={35} className="text-[#2E7D32]" />
      </div>
      <div className="absolute top-1/3 right-1/3 opacity-8 animate-float-delayed">
        <Activity size={25} className="text-[#1565C0]" />
      </div>
      
      {/* Decorative circles */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-red-500/3 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200">
              <div className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse"></div>
              <span className="text-sm font-medium text-[#1565C0]">Vet Care With Heart 💙</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-[#1A2332]">Little Tails{' '}</span>
              <span className="bg-gradient-to-r from-[#1565C0] to-[#42A5F5] bg-clip-text text-transparent">Pet Clinic</span>
              <span className="inline-block ml-3 animate-bounce">🐾</span>
            </h1>

            <p className="text-lg text-[#5F6B7A] max-w-lg leading-relaxed">
              Committed to Pet Wellness. We provide compassionate, expert veterinary care by <strong className="text-[#1A2332]">Dr. Ganesh Kumar (B.V.Sc &amp; A.H)</strong>. Pet Care, Pet Food &amp; Pet Accessories — all available here!
            </p>

            {/* Taglines */}
            <div className="flex flex-wrap gap-3">
              {['Vet Care With Heart', 'Treats With Value', 'Committed to Pet Wellness'].map((tag, i) => {
                const colors = [
                  'bg-blue-50 text-[#1565C0] border-blue-200',
                  'bg-red-50 text-[#E53935] border-red-200',
                  'bg-green-50 text-[#2E7D32] border-green-200',
                ];
                return (
                  <span key={tag} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${colors[i]}`}>
                    {tag}
                  </span>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Book Appointment
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <a href="#services">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Our Services
                </Button>
              </a>
            </div>

            {/* Doctor Info */}
            <div className="flex items-center gap-4 pt-2 p-4 rounded-2xl bg-white border border-[#DDE3EC] shadow-sm">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1565C0] to-[#42A5F5] flex items-center justify-center text-white font-bold text-lg shadow-md">
                👨‍⚕️
              </div>
              <div>
                <p className="text-sm font-bold text-[#1A2332]">Dr. Ganesh Kumar</p>
                <p className="text-xs text-[#5F6B7A]">B.V.Sc &amp; A.H • Veterinary Surgeon</p>
              </div>
              <div className="ml-auto text-right">
                <a href="tel:7013127334" className="text-sm font-semibold text-[#1565C0] hover:underline">📞 7013127334</a>
              </div>
            </div>
          </div>

          {/* Right Content - Illustration */}
          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Main circle */}
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-[#1565C0] to-[#42A5F5] opacity-10 animate-pulse-glow"></div>
              <div className="absolute inset-12 rounded-full bg-white shadow-2xl shadow-blue-500/10 flex items-center justify-center border border-blue-100">
                <div className="text-center space-y-4 p-8">
                  <div className="text-8xl">🐕</div>
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-[#1A2332]">Little Tails</p>
                    <p className="text-sm text-[#5F6B7A]">Pet Clinic, Zaheerabad</p>
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <div className="absolute top-4 right-0 bg-white rounded-2xl shadow-xl shadow-blue-500/8 p-4 border border-blue-100 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center border border-green-200">
                    <Shield size={20} className="text-[#2E7D32]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A2332]">Pet Care</p>
                    <p className="text-xs text-[#5F6B7A]">Complete wellness</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-8 left-0 bg-white rounded-2xl shadow-xl shadow-red-500/8 p-4 border border-red-100 animate-float-delayed">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center border border-red-200">
                    <HeartPulse size={20} className="text-[#E53935]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A2332]">Pet Food</p>
                    <p className="text-xs text-[#5F6B7A]">Premium nutrition</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-xl shadow-blue-500/8 p-4 border border-blue-100 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-200">
                    <Stethoscope size={20} className="text-[#1565C0]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A2332]">Accessories</p>
                    <p className="text-xs text-[#5F6B7A]">All you need</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
