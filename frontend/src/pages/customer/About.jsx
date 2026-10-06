import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Sparkles, ShieldCheck, Award, Heart, Flame } from 'lucide-react';

export default function About() {
  const [aboutContent, setAboutContent] = useState('');

  const fetchAboutContent = async () => {
    try {
      const response = await api.get('/settings');
      if (response.data && response.data.about_us_content) {
        setAboutContent(response.data.about_us_content);
      }
    } catch (e) {
      console.error("Failed to load settings copy:", e);
    }
  };

  useEffect(() => {
    fetchAboutContent();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* 1. Header Banner */}
      <section className="bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 text-white rounded-3xl p-8 md:p-12 text-center space-y-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[30%] h-[45%] rounded-full bg-red-600/10 blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[45%] rounded-full bg-orange-600/10 blur-[80px] pointer-events-none"></div>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600/90 text-[10px] font-black rounded-full uppercase tracking-wider">
          <Award size={12} />
          <span>Sivakasi's Pride</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black font-outfit tracking-wide leading-tight">
          About AVIRA <span className="text-red-500">PYROTECH</span>
        </h1>
        <p className="text-gray-300 text-xs font-semibold max-w-xl mx-auto leading-relaxed">
          Bringing colors, display sparks, and celebratory lights to your family since our inception. Safe, affordable, and quality fireworks.
        </p>
      </section>

      {/* 2. Core Profile Details (Database Content) */}
      <section className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-black font-outfit text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
          <Sparkles className="text-red-600 animate-pulse" size={20} />
          <span>Our Legacy and Mission</span>
        </h2>
        {aboutContent ? (
          <p className="text-gray-650 text-xs leading-relaxed font-semibold whitespace-pre-wrap">
            {aboutContent}
          </p>
        ) : (
          <div className="space-y-4 text-gray-650 text-xs leading-relaxed font-semibold">
            <p>
              AVIRA PYROTECH is a premier crackers and fireworks distributor based in Sivakasi, Tamil Nadu—the cracker hub of India. We are dedicated to providing the highest quality firecrackers directly from manufacturing units to customers, avoiding multiple layers of middle-agents to pass on maximum savings.
            </p>
            <p>
              Our wide catalog includes colorful ground chakkars, aerial rockets, loud sound crackers, fancy flower pots, gift box hampers, and children-friendly sparklers. Safety is our primary concern; we verify all cracker test certifications before cataloging to guarantee safe celebratory fireworks for all ages.
            </p>
          </div>
        )}
      </section>

      {/* 3. Badges Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck size={24} />
          </div>
          <h3 className="font-extrabold text-sm text-gray-800">Quality Verified</h3>
          <p className="text-xs text-gray-400 font-semibold leading-relaxed">Every firecracker goes through strict ignition safety audits before shipment.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto">
            <Flame size={24} />
          </div>
          <h3 className="font-extrabold text-sm text-gray-800">Affordable Pricing</h3>
          <p className="text-xs text-gray-400 font-semibold leading-relaxed">Direct factory pricing from Sivakasi ensures discounts of up to 70% off retail prices.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <Heart size={24} />
          </div>
          <h3 className="font-extrabold text-sm text-gray-800">Customer Satisfaction</h3>
          <p className="text-xs text-gray-400 font-semibold leading-relaxed">Dedicated phone and WhatsApp log supports to ensure quick delivery and order updates.</p>
        </div>
      </section>

    </div>
  );
}
