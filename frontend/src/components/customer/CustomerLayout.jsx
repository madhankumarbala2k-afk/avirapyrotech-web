import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Menu, X, Phone, MessageSquare, MapPin, 
  Clock, Sparkles, Search, FileText, ChevronDown, ShieldCheck 
} from 'lucide-react';
import api from '../../api';
import FireworksIntro from './FireworksIntro';
import FloatingActions from './FloatingActions';
import ClickCrackerBurst from './ClickCrackerBurst';

export default function CustomerLayout({ children }) {
  const [settings, setSettings] = useState({
    shop_name: 'AVIRA PYROTECH',
    phone_number: '8610315901, 9092180927',
    whatsapp_number: '8610315901',
    email: 'info@avirapyrotech.com',
    address: '112, Paraipatti, Sattur Road, Sivakasi - 626189',
    business_hours: '9:00 AM - 8:00 PM',
    footer_text: 'Premium Sivakasi Fireworks & Crackers directly from Sivakasi factory warehouse!',
    copyright_text: '© 2026 Avira Pyrotech. All Rights Reserved.'
  });

  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [searchCategory, setSearchCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Load cart count & total from localStorage
  const updateCartData = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const totalQty = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
      const totalPrice = cart.reduce((sum, item) => {
        const itemPrice = Number(item.price || item.product?.offerPrice || item.product?.originalPrice || 0);
        return sum + (itemPrice * (Number(item.quantity) || 1));
      }, 0);
      setCartCount(totalQty);
      setCartTotal(totalPrice);
    } catch (e) {
      setCartCount(0);
      setCartTotal(0);
    }
  };

  // Fetch shop settings & categories
  const fetchData = async () => {
    try {
      const [settingsRes, categoriesRes] = await Promise.allSettled([
        api.get('/settings'),
        api.get('/categories')
      ]);
      if (settingsRes.status === 'fulfilled' && settingsRes.value.data) {
        setSettings(prev => ({ ...prev, ...settingsRes.value.data }));
      }
      if (categoriesRes.status === 'fulfilled' && categoriesRes.value.data) {
        setCategories(categoriesRes.value.data);
      }
    } catch (err) {
      console.error("Failed to load layout data:", err);
    }
  };

  useEffect(() => {
    fetchData();
    updateCartData();

    // Listen for custom events to sync cart count when items are added
    window.addEventListener('cart-updated', updateCartData);
    return () => {
      window.removeEventListener('cart-updated', updateCartData);
    };
  }, []);

  // Listen to path changes to close mobile menu and update cart
  useEffect(() => {
    setMobileMenuOpen(false);
    updateCartData();
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (searchCategory) params.set('category', searchCategory);
    navigate(`/products?${params.toString()}`);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop Crackers', path: '/products' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const primaryPhone = (settings.phone_number || '8610315901').split(',')[0].trim();

  const announcementMessages = [
    '🎆 Welcome to Avira Pyrotech – Buy Sivakasi Crackers Online at Factory Prices!',
    '✨ Fresh Festive Collections & Family Gift Boxes Ready',
    '🚚 Direct Sivakasi Home Delivery & Fast Dispatch Across Tamil Nadu & India',
    '🛡️ 100% Quality Tested & Safe Sivakasi Fireworks',
    '📞 Bulk Orders & Festival Enquiries: 8610315901 / 9092180927'
  ];
  const tickerText = announcementMessages.join('    ★    ');

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-gray-800 font-sans selection:bg-amber-400 selection:text-black">
      
      {/* 🎆 FULL-SCREEN CANVAS FIREWORKS CELEBRATION INTRO */}
      <FireworksIntro brandName="AVIRA" tagline="PYROTECH" />

      {/* 💥 GLOBAL MOUSE CLICK CRACKER BURST ANIMATION */}
      <ClickCrackerBurst />

      {/* 1. TOP MARQUEE ANNOUNCEMENT TICKER (Yuvraj style) */}
      <div className="w-full bg-[#0b1f3a] text-yellow-300 text-xs font-bold py-2 overflow-hidden border-b border-yellow-500/20 select-none flex items-center shrink-0">
        <div className="w-full overflow-hidden relative">
          <div className="flex w-max animate-marquee-ticker whitespace-nowrap">
            <span className="px-4">{tickerText}</span>
            <span className="px-4" aria-hidden="true">{tickerText}</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (Search, Call Us, Price List, Cart) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu size={24} />
          </button>

          {/* Logo brand mark */}
          <Link to="/" className="flex items-center select-none shrink-0">
            <img src="/logo.png" alt="Avira Pyrotech" className="h-11 sm:h-13 w-auto object-contain" />
          </Link>

          {/* Central Search Bar (Category Select + Input + Button) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-lg items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-xs focus-within:border-red-600 focus-within:ring-1 focus-within:ring-red-600 transition-all mx-4"
          >
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="bg-gray-50 border-r border-gray-300 text-gray-700 text-xs font-semibold px-3 py-2.5 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crackers, sparklers, gift boxes..."
              className="flex-1 px-3 py-2 text-xs font-medium text-gray-800 placeholder-gray-400 outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="px-4 py-2.5 bg-[#d91d27] hover:bg-[#b3141e] text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <Search size={16} />
            </button>
          </form>

          {/* Right Header Controls (Call Info, Price List, Cart) */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Call Info Badge */}
            <div className="hidden xl:flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                <Phone size={18} />
              </div>
              <div className="leading-tight text-left">
                <span className="text-[11px] text-gray-500 font-semibold block">Call Us:</span>
                <a
                  href={`tel:${primaryPhone.replace(/\s+/g, '')}`}
                  className="text-xs font-black text-gray-900 hover:text-red-600 transition-colors"
                >
                  {primaryPhone}
                </a>
              </div>
            </div>

            {/* Price List Catalog Button */}
            <Link
              to="/products"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#dc3545] hover:bg-[#b02a37] text-white rounded-lg text-xs font-bold transition-all shadow-xs shrink-0"
            >
              <FileText size={15} />
              <span>Price List</span>
            </Link>

            {/* Admin Console Header Button */}
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0b1f3a] hover:bg-[#12294d] text-white rounded-lg text-xs font-bold transition-all shadow-xs border border-yellow-500/30 shrink-0"
              title="Admin Console"
            >
              <ShieldCheck size={15} className="text-yellow-400" />
              <span>Admin Console</span>
            </Link>

            {/* Cart Button with Counter Badge & Price */}
            <Link
              to="/cart"
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 text-gray-800 hover:bg-gray-100 rounded-xl transition-all group"
            >
              <div className="relative flex items-center justify-center w-8 h-8 text-gray-800 group-hover:text-red-600 transition-colors">
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-5 h-5 bg-[#f04419] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white shadow-xs animate-scale-up">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-black text-gray-900">
                ₹{cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </Link>
          </div>
        </div>

        {/* Desktop Golden Navigation Strip (Yuvraj style) */}
        <nav className="hidden lg:block bg-gradient-to-r from-[#f8c51c] via-[#ffd43b] to-[#f8c51c] border-t border-amber-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  location.pathname === link.path
                    ? 'bg-black/10 text-gray-950 font-black'
                    : 'text-gray-900 hover:bg-white/20'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* 3. MOBILE DRAWER NAVIGATION MENU (Left-to-Right with 100% Width & Smooth Transition) */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          mobileMenuOpen ? 'visible opacity-100' : 'invisible opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop overlay */}
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        />

        {/* 100% Width Sliding Drawer from Left */}
        <aside
          className={`w-full bg-white h-full flex flex-col p-6 shadow-2xl relative z-10 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Header Row: Logo & Close Button */}
          <div className="flex items-center justify-between mb-6 mt-1">
            <img src="/logo.png" alt="Avira Pyrotech" className="h-11 w-auto object-contain" />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* Mobile Search input */}
          <form onSubmit={handleSearchSubmit} className="flex mb-6 border border-gray-300 rounded-xl overflow-hidden shadow-xs focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crackers..."
              className="flex-1 px-3.5 py-2.5 text-sm font-medium text-gray-800 outline-none"
            />
            <button type="submit" className="px-4 bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer">
              <Search size={16} />
            </button>
          </form>

          {/* Nav list */}
          <nav className="flex-1 flex flex-col gap-2.5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-bold py-3 px-4 rounded-xl transition-all ${
                  location.pathname === link.path
                    ? 'bg-red-50 text-red-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-bold py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center gap-2 mt-3 shadow-md shadow-red-600/20 transition-all active:scale-98"
            >
              <FileText size={18} />
              <span>Download Price List</span>
            </Link>
          </nav>

          {/* Mobile Contact quick cards */}
          <div className="border-t border-gray-100 pt-6 mt-4 space-y-3 text-xs font-semibold text-gray-600">
            {primaryPhone && (
              <div className="flex items-center gap-2.5">
                <Phone size={16} className="text-red-600 shrink-0" />
                <a href={`tel:${primaryPhone.replace(/\s+/g, '')}`} className="hover:text-red-600">{primaryPhone}</a>
              </div>
            )}
            {settings.whatsapp_number && (
              <div className="flex items-center gap-2.5">
                <MessageSquare size={16} className="text-green-600 shrink-0" />
                <a
                  href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-green-600"
                >
                  WhatsApp: {settings.whatsapp_number}
                </a>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* 4. PUBLIC PAGE CONTENT OUTLET */}
      <main className="flex-1">
        {children}
      </main>

      {/* 5. FLOATING WHATSAPP & ACTION BUTTONS */}
      <FloatingActions whatsappNumber={settings.whatsapp_number} />

      {/* 6. PUBLIC WEBSITE FOOTER */}
      <footer className="bg-[#0b1f3a] text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800 shrink-0">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-gray-800/80">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <img src="/logo.png" alt="Avira Pyrotech" className="h-12 w-auto object-contain brightness-200" />
            </div>
            <p className="text-gray-300 text-xs leading-relaxed font-medium">
              {settings.footer_text}
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  sessionStorage.setItem('aviraTriggerFireworks', 'true');
                  window.location.reload();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/20 hover:bg-amber-400/30 text-yellow-300 text-xs font-bold border border-yellow-400/30 transition-all cursor-pointer"
              >
                <Sparkles size={13} className="text-yellow-400 animate-spin" />
                <span>Replay Fireworks Show</span>
              </button>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs text-gray-300 font-medium">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="hover:text-amber-400 transition-colors">{link.name}</Link>
                </li>
              ))}
              <li>
                <Link to="/products" className="hover:text-amber-400 transition-colors">Crackers Catalog</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-amber-400 transition-colors">Enquiry Cart</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contacts & Address */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-4">Sivakasi Warehouse</h4>
            {settings.phone_number && (
              <div className="text-xs text-gray-300 leading-relaxed font-medium flex items-start gap-2">
                <Phone size={16} className="text-red-400 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  {settings.phone_number.split(',').map((num, idx) => (
                    <a
                      key={idx}
                      href={`tel:${num.trim().replace(/\s+/g, '')}`}
                      className="hover:text-white transition-colors"
                    >
                      {num.trim()}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {settings.whatsapp_number && (
              <p className="text-xs text-gray-300 font-medium flex items-center gap-2">
                <MessageSquare size={16} className="text-green-400 shrink-0" />
                <a
                  href={`https://wa.me/${settings.whatsapp_number.replace(/[^\d]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp: {settings.whatsapp_number}
                </a>
              </p>
            )}
            {settings.address && (
              <p className="text-xs text-gray-300 leading-relaxed font-medium flex items-start gap-2">
                <MapPin size={16} className="text-red-400 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </p>
            )}
          </div>

        </div>

        {/* Footer bottom line */}
        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 font-medium gap-3">
          <span>{settings.copyright_text}</span>
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-amber-300 hover:text-amber-200 transition-colors font-semibold flex items-center gap-1">
              <ShieldCheck size={14} className="text-amber-400" />
              <span>Admin Console</span>
            </Link>
            <span className="text-gray-600">•</span>
            <Link to="/admin/login" className="hover:text-gray-300 transition-colors">Admin Login</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
