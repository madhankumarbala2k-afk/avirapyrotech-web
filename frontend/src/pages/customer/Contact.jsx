import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Phone, MessageSquare, MapPin, Mail, Clock, ShieldAlert } from 'lucide-react';

export default function Contact() {
  const [settings, setSettings] = useState({
    shop_name: 'AVIRA PYROTECH',
    phone_number: '8610315901, 9092180927',
    whatsapp_number: '8610315901',
    email: 'info@avirapyrotech.com',
    address: '112, Paraipatti, Sattur Road, Sivakasi - 626189',
    google_maps_link: 'https://www.google.com/maps/search/?api=1&query=112+Paraipatti+Sattur+Road+Sivakasi+626189',
    business_hours: '9:00 AM - 8:00 PM'
  });

  const fetchContactSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(prev => ({ ...prev, ...response.data }));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchContactSettings();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black font-outfit text-gray-900">Contact Avira Pyrotech</h1>
        <p className="text-gray-400 text-xs font-semibold mt-1">Get in touch with us for bulk orders, discount questions, and delivery slots details.</p>
      </div>

      {/* Grid: Details Cards + Location Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-6">
            <h3 className="font-extrabold text-sm text-gray-800 border-b border-gray-100 pb-3 font-outfit">Our Contacts</h3>

            {/* Phone */}
            {settings.phone_number && (
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-red-50 text-red-650 rounded-xl">
                  <Phone size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Call Phone Lines</h4>
                  {settings.phone_number.split(',').map((num, idx) => (
                    <a
                      key={idx}
                      href={`tel:${num.trim().replace(/\s+/g, '')}`}
                      className="block text-sm font-extrabold text-gray-800 hover:text-red-600 transition-colors"
                    >
                      {num.trim()}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* WhatsApp */}
            {settings.whatsapp_number && (
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">WhatsApp Messaging</h4>
                  <a
                    href={`https://wa.me/${settings.whatsapp_number.replace(/[^\d]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-extrabold text-gray-800 hover:text-green-600 transition-colors"
                  >
                    {settings.whatsapp_number}
                  </a>
                </div>
              </div>
            )}

            {/* Email */}
            {settings.email && (
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Mail size={18} />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Email Address</h4>
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-sm font-extrabold text-gray-800 hover:text-blue-600 transition-colors"
                  >
                    {settings.email}
                  </a>
                </div>
              </div>
            )}

            {/* Operating hours */}
            {settings.business_hours && (
              <div className="flex items-start gap-4 border-t border-gray-50 pt-4">
                <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                  <Clock size={18} />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Operating Hours</h4>
                  <p className="text-sm font-extrabold text-gray-850">
                    {settings.business_hours}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Location & Map panel */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-6">
          <h3 className="font-extrabold text-sm text-gray-800 border-b border-gray-100 pb-3 font-outfit">Shop Location</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="text-red-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Store Address</h4>
                  <p className="text-xs font-semibold text-gray-650 leading-relaxed mt-1">
                    {settings.address || '112, Paraipatti, Sattur Road, Sivakasi - 626189.'}
                  </p>
                </div>
              </div>

              {settings.google_maps_link && (
                <div className="pt-2">
                  <a
                    href={settings.google_maps_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-750 transition-all shadow-sm shadow-red-500/10 cursor-pointer"
                  >
                    <MapPin size={12} />
                    <span>Open in Google Maps</span>
                  </a>
                </div>
              )}
            </div>

            {/* Embedded Interactive Google Map */}
            <div className="w-full h-56 bg-gray-100 border border-gray-200 rounded-2xl overflow-hidden shadow-inner relative">
              <iframe
                title="Avira Pyrotech Shop Location"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(settings.address || '112, Paraipatti, Sattur Road, Sivakasi - 626189')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
