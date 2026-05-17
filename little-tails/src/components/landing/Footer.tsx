'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Globe, MessageCircle, Camera, Play, Mail, Phone, MapPin, HeartPulse } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { label: 'General Checkup', href: '#services' },
      { label: 'Vaccination', href: '#services' },
      { label: 'Grooming', href: '#services' },
      { label: 'Pet Food & Nutrition', href: '#services' },
      { label: 'Pet Accessories', href: '#services' },
      { label: 'Medicine', href: '#services' },
    ],
    company: [
      { label: 'About Us', href: '#about' },
      { label: 'Our Doctor', href: '#about' },
      { label: 'Services', href: '#services' },
      { label: 'Contact', href: '#contact' },
    ],
    support: [
      { label: 'FAQs', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: <Globe size={18} />, href: '#', label: 'Website' },
    { icon: <MessageCircle size={18} />, href: '#', label: 'WhatsApp' },
    { icon: <Camera size={18} />, href: '#', label: 'Instagram' },
    { icon: <Play size={18} />, href: '#', label: 'Youtube' },
  ];

  return (
    <footer className="bg-white border-t border-[#DDE3EC] relative overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1565C0] via-[#2E7D32] to-[#E53935]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-12 lg:py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Little Tails Logo"
                width={40}
                height={40}
                className="rounded-xl"
              />
              <div>
                <span className="text-xl font-bold text-[#1A2332] font-[Fredoka]">
                  Little<span className="text-[#1565C0]">Tails</span>
                </span>
                <div className="flex items-center gap-1">
                  <HeartPulse size={9} className="text-[#E53935]" />
                  <span className="text-[9px] text-[#5F6B7A] font-medium">Pet Clinic</span>
                </div>
              </div>
            </Link>
            <p className="text-sm text-[#5F6B7A] leading-relaxed max-w-xs">
              Vet Care With Heart. Pet Care, Pet Food &amp; Pet Accessories — all available at Little Tails Pet Clinic, Zaheerabad.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-9 h-9 rounded-lg bg-[#F5F7FA] border border-[#DDE3EC] flex items-center justify-center text-[#5F6B7A] hover:bg-[#1565C0] hover:text-white hover:border-[#1565C0] transition-all duration-300"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-[#1A2332] mb-4">Services</h4>
            <ul className="space-y-2.5">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-[#5F6B7A] hover:text-[#1565C0] transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-[#1A2332] mb-4">Company</h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-[#5F6B7A] hover:text-[#1565C0] transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-[#1A2332] mb-4">Support</h4>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-[#5F6B7A] hover:text-[#1565C0] transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Doctor Info */}
            <div className="mt-6 pt-4 border-t border-[#DDE3EC]">
              <h4 className="font-semibold text-[#1A2332] mb-2">Our Doctor</h4>
              <p className="text-sm font-medium text-[#1565C0]">Dr. Ganesh Kumar</p>
              <p className="text-xs text-[#5F6B7A]">B.V.Sc &amp; A.H</p>
            </div>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-semibold text-[#1A2332] mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-[#1565C0] mt-0.5 shrink-0" />
                <span className="text-sm text-[#5F6B7A]">Near Adarsh Nagar Gate, Zaheerabad, Telangana</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-[#2E7D32] shrink-0" />
                <a href="tel:7013127334" className="text-sm text-[#5F6B7A] hover:text-[#1565C0] transition-colors">7013127334</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-[#E53935] shrink-0" />
                <span className="text-sm text-[#5F6B7A]">littletailspetclinic@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-[#DDE3EC] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#5F6B7A]">
            © {currentYear} Little Tails Pet Clinic, Zaheerabad. All rights reserved.
          </p>
          <p className="text-sm text-[#5F6B7A]">
            Committed to Pet Wellness 🐾 <span className="text-[#E53935]">❤</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
