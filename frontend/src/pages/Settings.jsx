import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import { Store, Globe, Save, AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function Settings() {
  const location = useLocation();
  
  // Tab states: 'shop' or 'website'
  // Determine starting tab based on URL path
  const [activeTab, setActiveTab] = useState(
    location.pathname.includes('website') ? 'website' : 'shop'
  );

  const [settings, setSettings] = useState({
    // Shop settings
    shop_name: '',
    shop_logo: '',
    phone_number: '',
    whatsapp_number: '',
    email: '',
    address: '',
    google_maps_link: '',
    business_hours: '',
    social_facebook: '',
    social_instagram: '',
    social_youtube: '',
    
    // Website settings
    homepage_title: '',
    about_us_content: '',
    contact_details: '',
    footer_text: '',
    copyright_text: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings');
      // Merge with initial values to prevent undefined errors
      setSettings(prev => ({ ...prev, ...response.data }));
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError("Failed to load settings from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Update specific setting key
  const handleChange = (key, val) => {
    setSettings(prev => ({
      ...prev,
      [key]: val
    }));
  };

  // Submit settings
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');

    try {
      await api.post('/settings', settings);
      setSuccess(true);
      // Auto dismiss success toast
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || "Failed to update configurations");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 font-outfit">
          System settings
        </h1>
        <p className="text-gray-500 text-sm font-semibold mt-1">
          Adjust store coordinates, WhatsApp contact links, footer text, and search titles instantly.
        </p>
      </div>

      {/* Tabs selectors */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('shop')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-bold tracking-wide transition-all cursor-pointer ${
            activeTab === 'shop'
              ? 'border-red-600 text-red-650'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Store size={18} />
          <span>Shop Configuration</span>
        </button>

        <button
          onClick={() => setActiveTab('website')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-bold tracking-wide transition-all cursor-pointer ${
            activeTab === 'website'
              ? 'border-red-600 text-red-650'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Globe size={18} />
          <span>Website Configuration</span>
        </button>
      </div>

      {/* Success/Error Toasts */}
      {success && (
        <div className="flex items-center gap-2.5 bg-green-50 text-green-700 p-4 border border-green-200 rounded-2xl text-sm font-semibold animate-fade-in">
          <CheckCircle size={20} className="shrink-0 text-green-500" />
          <span>Configurations updated successfully! All public interfaces will update immediately.</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 bg-red-50 text-red-700 p-4 border border-red-200 rounded-2xl text-sm font-semibold animate-fade-in">
          <AlertCircle size={20} className="shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Settings Form Card */}
      <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* TAB 1: SHOP SETTINGS */}
          {activeTab === 'shop' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-2 text-gray-500 border-b border-gray-100 pb-2">
                <Info size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Business Contacts & Metadata</span>
              </div>

              {/* Grid 1: Name and Hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Shop Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.shop_name}
                    onChange={(e) => handleChange('shop_name', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Business Hours
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9:00 AM - 9:00 PM"
                    value={settings.business_hours}
                    onChange={(e) => handleChange('business_hours', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Grid 2: Contacts info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Phone Number (Callable)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={settings.phone_number}
                    onChange={(e) => handleChange('phone_number', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    WhatsApp Number (Pre-filled links)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +919876543210"
                    value={settings.whatsapp_number}
                    onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. contact@avirapyrotech.com"
                    value={settings.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Grid 3: Location and Maps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Physical Address
                  </label>
                  <textarea
                    rows="3"
                    value={settings.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Google Maps Share Link
                  </label>
                  <textarea
                    rows="3"
                    placeholder="https://maps.google.com/..."
                    value={settings.google_maps_link}
                    onChange={(e) => handleChange('google_maps_link', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium"
                  ></textarea>
                </div>
              </div>

              {/* Grid 4: Social media handles */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-500 border-b border-gray-100 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Social Media Links</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Facebook</label>
                    <input
                      type="url"
                      placeholder="https://facebook.com/..."
                      value={settings.social_facebook}
                      onChange={(e) => handleChange('social_facebook', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Instagram</label>
                    <input
                      type="url"
                      placeholder="https://instagram.com/..."
                      value={settings.social_instagram}
                      onChange={(e) => handleChange('social_instagram', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">YouTube Channel</label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/..."
                      value={settings.social_youtube}
                      onChange={(e) => handleChange('social_youtube', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WEBSITE CONFIGURATION */}
          {activeTab === 'website' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-2 text-gray-500 border-b border-gray-100 pb-2">
                <Info size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">SEO, Title tag & Static Contents</span>
              </div>

              {/* Homepage title tag */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Homepage Browser Title Tag * (Great for SEO)
                </label>
                <input
                  type="text"
                  required
                  value={settings.homepage_title}
                  onChange={(e) => handleChange('homepage_title', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium"
                />
              </div>

              {/* About Us section content */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  About Us Content (Rich Text)
                </label>
                <textarea
                  rows="5"
                  placeholder="Tell customers about the history of Avira Pyrotech, your safety standards, and location..."
                  value={settings.about_us_content}
                  onChange={(e) => handleChange('about_us_content', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium leading-relaxed"
                ></textarea>
              </div>

              {/* Contact Footer */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Contact Details Display
                </label>
                <input
                  type="text"
                  value={settings.contact_details}
                  onChange={(e) => handleChange('contact_details', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium"
                />
              </div>

              {/* Footer text & Copyright */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Footer Caption / Catchphrase
                  </label>
                  <input
                    type="text"
                    value={settings.footer_text}
                    onChange={(e) => handleChange('footer_text', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Copyright Notice Footer
                  </label>
                  <input
                    type="text"
                    value={settings.copyright_text}
                    onChange={(e) => handleChange('copyright_text', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Submit Footer */}
          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all text-sm cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
