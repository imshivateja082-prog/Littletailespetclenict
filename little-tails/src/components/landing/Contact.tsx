'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, HeartPulse } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success('Message sent successfully! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', phone: '', message: '' });
    setLoading(false);
  };

  const contactInfo = [
    {
      icon: <MapPin className="w-5 h-5" />,
      title: 'Visit Us',
      details: ['Near Adarsh Nagar Gate', 'Zaheerabad, Telangana'],
      color: 'bg-blue-50 text-[#1565C0] border border-blue-100',
    },
    {
      icon: <Phone className="w-5 h-5" />,
      title: 'Call Us',
      details: ['7013127334', 'Dr. Ganesh Kumar'],
      color: 'bg-green-50 text-[#2E7D32] border border-green-100',
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: 'Email Us',
      details: ['info@littletailsclinic.com', 'littletailspetclinic@gmail.com'],
      color: 'bg-blue-50 text-[#1565C0] border border-blue-100',
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: 'Working Hours',
      details: ['Mon-Sat: 9:00 AM - 8:00 PM', 'Sunday: By Appointment'],
      color: 'bg-red-50 text-[#E53935] border border-red-100',
    },
  ];

  return (
    <section id="contact" className="py-20 lg:py-32 relative overflow-hidden bg-white">
      <div className="absolute inset-0 gradient-mesh opacity-30"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 mb-6">
            <HeartPulse size={14} className="text-[#E53935]" />
            <span className="text-sm font-medium text-[#E53935]">Contact Us</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A2332] mb-4">
            Get In <span className="text-[#E53935]">Touch</span>
          </h2>
          <p className="text-[#5F6B7A] text-lg">
            Have a question or need to book an appointment with Dr. Ganesh Kumar? We&apos;d love to hear from you!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 border border-[#DDE3EC] shadow-lg shadow-blue-500/5">
            <h3 className="text-xl font-bold text-[#1A2332] mb-6">Send us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <Input
                  label="Your Name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <Input
                label="Phone"
                type="tel"
                placeholder="Your phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#1A2332]">Message</label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your pet or question..."
                  className="w-full rounded-xl border border-[#DDE3EC] bg-white px-4 py-3 text-sm text-[#1A2332] placeholder:text-[#5F6B7A]/60 transition-all duration-200 focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/15 focus:outline-none resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" size="lg" className="w-full" loading={loading}>
                <Send size={18} />
                Send Message
              </Button>
            </form>
          </div>

          {/* Contact Info & Map */}
          <div className="space-y-6">
            {/* Contact Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              {contactInfo.map((info) => (
                <div
                  key={info.title}
                  className="bg-white rounded-2xl p-5 border border-[#DDE3EC] card-hover shadow-sm"
                >
                  <div className={`w-10 h-10 rounded-xl ${info.color} flex items-center justify-center mb-3`}>
                    {info.icon}
                  </div>
                  <h4 className="font-semibold text-[#1A2332] mb-1">{info.title}</h4>
                  {info.details.map((detail, i) => (
                    <p key={i} className="text-sm text-[#5F6B7A]">{detail}</p>
                  ))}
                </div>
              ))}
            </div>

            {/* Map - Zaheerabad */}
            <div className="bg-white rounded-2xl border border-[#DDE3EC] overflow-hidden h-64 shadow-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30373.81506767067!2d77.57!3d17.68!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcbf5c0b6b5b5b5%3A0x1c1c1c1c1c1c1c1c!2sZaheerabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Little Tails Pet Clinic - Zaheerabad Location"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
