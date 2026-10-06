import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getImageUrl } from '../../api';
import { Sparkles, ArrowRight, ShieldCheck, Flame, ShoppingBag, Truck, Minus, Plus, CheckCircle } from 'lucide-react';
import TrustStatsBar from '../../components/customer/TrustStatsBar';
import CategoryMarquee from '../../components/customer/CategoryMarquee';
import CrackerBlast from '../../components/customer/CrackerBlast';

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [settings, setSettings] = useState({
    shop_name: 'AVIRA PYROTECH',
    homepage_title: 'AVIRA PYROTECH - Premium Sivakasi Fireworks & Crackers',
    footer_text: 'Quality Sivakasi Fireworks directly delivered to your doorstep!'
  });
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [quantities, setQuantities] = useState({});
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2600);
  };

  // Sample default featured products in case database is empty or loading
  const defaultFeatured = [
    {
      id: 'df-1',
      name: '7CM Electric Sparklers (10 Pcs)',
      productCode: 'SPK-001',
      originalPrice: 150,
      offerPrice: 120,
      stockQuantity: 100,
      imagePath: null,
      fallbackIcon: '✨'
    },
    {
      id: 'df-2',
      name: '10CM Colour Sparklers (10 Pcs)',
      productCode: 'SPK-002',
      originalPrice: 190,
      offerPrice: 152,
      stockQuantity: 80,
      imagePath: null,
      fallbackIcon: '🎇'
    },
    {
      id: 'df-3',
      name: 'Special Flower Pots Ashoka',
      productCode: 'FP-003',
      originalPrice: 280,
      offerPrice: 224,
      stockQuantity: 65,
      imagePath: null,
      fallbackIcon: '🎆'
    },
    {
      id: 'df-4',
      name: 'Ground Chakkars Deluxe (10 Pcs)',
      productCode: 'GC-004',
      originalPrice: 220,
      offerPrice: 176,
      stockQuantity: 90,
      imagePath: null,
      fallbackIcon: '🌀'
    },
    {
      id: 'df-5',
      name: 'Lunik Rockets (10 Pcs)',
      productCode: 'RCK-005',
      originalPrice: 260,
      offerPrice: 208,
      stockQuantity: 50,
      imagePath: null,
      fallbackIcon: '🚀'
    },
    {
      id: 'df-6',
      name: '12 Shots Multi-Color Sky Shots',
      productCode: 'SKY-006',
      originalPrice: 450,
      offerPrice: 360,
      stockQuantity: 40,
      imagePath: null,
      fallbackIcon: '🌟'
    },
    {
      id: 'df-7',
      name: 'Diwali Deluxe Family Gift Box (32 Items)',
      productCode: 'GB-007',
      originalPrice: 1650,
      offerPrice: 1320,
      stockQuantity: 30,
      imagePath: null,
      fallbackIcon: '🎁'
    },
    {
      id: 'df-8',
      name: '1000 Wala Deluxe Garland Sound',
      productCode: 'GAR-008',
      originalPrice: 380,
      offerPrice: 304,
      stockQuantity: 45,
      imagePath: null,
      fallbackIcon: '💥'
    }
  ];

  const fetchData = async () => {
    try {
      // 1. Fetch Active Banners
      const bannerRes = await api.get('/banners/active');
      if (bannerRes.data && bannerRes.data.length > 0) {
        setBanners(bannerRes.data);
      }

      // 2. Fetch Categories
      const catRes = await api.get('/categories');
      if (catRes.data && catRes.data.length > 0) {
        setCategories(catRes.data);
      }

      // 3. Fetch Featured Products (fetch first page, size 8)
      const prodRes = await api.get('/products', { params: { size: 8 } });
      const productsFromDb = prodRes.data?.content || [];
      if (productsFromDb.length > 0) {
        setFeaturedProducts(productsFromDb);
      } else {
        setFeaturedProducts(defaultFeatured);
      }

      // 4. Fetch Settings
      const settingsRes = await api.get('/settings');
      setSettings(prev => ({ ...prev, ...settingsRes.data }));
    } catch (e) {
      console.warn("Using fallback data for homepage showcase:", e);
      setFeaturedProducts(defaultFeatured);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Banner slide rotation loop
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIdx(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  // Helper to add item directly to cart
  const addToCartDirectly = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingIndex = cart.findIndex(item => item.product.id === product.id);
    
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        product,
        quantity: 1,
        price: product.offerPrice || product.originalPrice
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    showToast(`✅ ${product.name} added to cart!`);
  };

  const activeProducts = featuredProducts.length > 0 ? featuredProducts : defaultFeatured;

  return (
    <div className="space-y-0 pb-16 bg-[#F9FAFB]">

      {/* Toast notification floating badge */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900/95 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2 border border-gray-700 animate-fade-in">
          <CheckCircle size={18} className="text-green-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* 1. HERO SLIDER BANNER */}
      <section className="relative h-[65vw] min-h-[340px] max-h-[560px] bg-gradient-to-r from-gray-950 via-red-950 to-gray-950 overflow-hidden shrink-0">
        {banners.length > 0 ? (
          banners.map((banner, idx) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 flex items-center ${
                idx === activeBannerIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Background Cover Image with darkening gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent z-10" />
              <img
                src={getImageUrl(banner.imagePath)}
                alt={banner.title || 'AVIRA PYROTECH'}
                className="absolute inset-0 w-full h-full object-cover select-none"
              />

              {/* Caption Overlay */}
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20 text-white space-y-4 sm:space-y-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600/95 text-xs font-black rounded-full uppercase tracking-wider shadow-md">
                  <Sparkles size={12} className="animate-pulse" />
                  <span>Sivakasi Direct Crackers</span>
                </div>
                {banner.title && (
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-outfit tracking-tight max-w-2xl leading-tight drop-shadow-md">
                    {banner.title}
                  </h1>
                )}
                {banner.subtitle && (
                  <p className="text-xs sm:text-base text-gray-200 font-semibold max-w-xl leading-relaxed drop-shadow">
                    {banner.subtitle}
                  </p>
                )}
                <div className="pt-2">
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all text-sm hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span>View Crackers Price List</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Default Rich Festive Hero if no banners exist */
          <div className="absolute inset-0 flex items-center bg-gradient-to-br from-gray-950 via-[#1f0b0c] to-[#0a050d] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20 space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-gradient-to-r from-red-600 to-orange-600 text-xs font-black rounded-full uppercase tracking-wider shadow-md">
                <Sparkles size={13} className="animate-spin text-yellow-300" style={{ animationDuration: '6s' }} />
                <span>Genuine Factory Prices • 100% Sivakasi</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-outfit tracking-tight max-w-2xl leading-tight">
                Buy Sivakasi Crackers Online at <span className="text-amber-400">Factory Prices</span>
              </h1>
              <p className="text-gray-300 max-w-xl font-semibold text-xs sm:text-base leading-relaxed">
                Shop 200+ premium crackers, family gift boxes, sparklers & rockets — direct from Sivakasi with safe all-India transport & instant verification.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all text-xs sm:text-sm hover:scale-105 active:scale-95"
                >
                  <span>View Crackers Price List</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 py-3 px-5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl backdrop-blur-md transition-all text-xs sm:text-sm"
                >
                  <span>Contact Warehouse</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. GOLDEN TRUST & STATS BAR WITH DIAGONAL LIGHT SHINE */}
      <TrustStatsBar />

      {/* 3. INFINITE HORIZONTAL CATEGORY MARQUEE */}
      <CategoryMarquee categories={categories} />

      {/* 4. BEST-SELLING FEATURED PRODUCTS WITH STEPPERS & HOVER EFFECTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-gray-200/80 pb-4">
          <div>
            <span className="text-red-600 text-[11px] font-black uppercase tracking-widest block mb-1">
              Handpicked Festive Deals
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-outfit text-gray-900 tracking-tight">
              Best Selling Diwali Crackers
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-red-600 hover:text-red-700 transition-colors group"
          >
            <span>View Full Crackers Price List</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {activeProducts.map((prod) => {
            const currentQty = quantities[prod.id] || 1;
            const discount = prod.offerPrice && prod.offerPrice < prod.originalPrice
              ? Math.round(((prod.originalPrice - prod.offerPrice) / prod.originalPrice) * 100)
              : 20; // default 20% discount badge matching Yuvraj Pyromart
            const finalPrice = prod.offerPrice || Math.round(prod.originalPrice * 0.8);
            const isOutOfStock = prod.stockQuantity <= 0;

            return (
              <div
                key={prod.id}
                className="bg-white rounded-xl sm:rounded-2xl border border-amber-900/10 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-amber-400 hover:-translate-y-1.5 transition-all duration-300 group relative cracker-card-glow"
              >
                {/* Image Area with Zoom effect & Proportional Aspect Ratio */}
                <div className="w-full aspect-square sm:aspect-[4/3] bg-[#FAF7F4] border-b border-gray-100 flex items-center justify-center relative overflow-hidden">
                  <CrackerBlast />
                  {prod.imagePath ? (
                    <img
                      src={getImageUrl(prod.imagePath)}
                      alt={prod.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300 will-change-transform"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-3">
                      <span className="text-3xl sm:text-5xl group-hover:scale-115 transition-transform duration-300">
                        {prod.fallbackIcon || '🎆'}
                      </span>
                    </div>
                  )}

                  {/* Offer Discount Label Badge (Flush Left Ribbon) */}
                  {discount > 0 && (
                    <span className="absolute top-2 sm:top-2.5 left-0 bg-red-600 text-white text-[9px] sm:text-[10px] font-black py-0.5 px-2 rounded-r shadow-xs">
                      {discount}% OFF
                    </span>
                  )}

                  {/* Out of Stock Badge (Only if sold out) */}
                  {isOutOfStock && (
                    <span className="absolute top-2 sm:top-2.5 right-2 sm:right-2.5 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded border bg-red-50 text-red-600 border-red-100">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-2.5 sm:p-4 flex flex-col flex-grow justify-between space-y-2 sm:space-y-3">
                  <div>
                    <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                      {prod.productCode || 'AP_101'}
                    </span>
                    <h3 className="font-bold text-xs sm:text-sm text-gray-900 mt-0.5 leading-snug break-words">
                      {prod.name}
                    </h3>
                  </div>

                  {/* Pricing Details */}
                  <div className="flex items-baseline gap-1.5">
                    <strong className="text-sm sm:text-lg font-black text-[#d91d27]">
                      ₹{(prod.offerPrice || prod.originalPrice)?.toLocaleString('en-IN')}
                    </strong>
                    {prod.offerPrice && prod.offerPrice < prod.originalPrice && (
                      <span className="text-[11px] sm:text-xs text-gray-400 line-through font-medium">
                        ₹{prod.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  {/* Action button: Add to Cart */}
                  <div className="pt-0.5">
                    <button
                      onClick={() => addToCartDirectly(prod)}
                      disabled={isOutOfStock}
                      className="w-full py-2 sm:py-2.5 px-2.5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 shadow-xs flex items-center justify-center"
                    >
                      {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-4">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 py-3 px-8 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/25 transition-all text-xs sm:text-sm hover:scale-105 active:scale-95"
          >
            <span>View Full Crackers Price List</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* 5. FESTIVE DISCOUNT CALLOUT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-gray-900 via-red-950 to-gray-900 text-white p-8 sm:p-12 shadow-xl border border-red-900/30 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={13} />
            <span>Festival Orders Now Open</span>
          </div>
          <h3 className="text-2xl sm:text-4xl font-black font-outfit max-w-2xl mx-auto leading-tight">
            Diwali Crackers Offers & Factory Discounts Now Live
          </h3>
          <p className="text-gray-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Genuine Sivakasi factory discounts on sparklers, sky shots, flower pots, and family gift boxes. Direct supply from Sivakasi to your doorstep!
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 py-3 px-7 bg-[#f7b500] hover:bg-[#e0a400] text-gray-950 font-black rounded-xl shadow-lg transition-all text-xs sm:text-sm hover:scale-105 active:scale-95"
            >
              <span>Send Crackers Enquiry</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. NEWSLETTER / OFFERS SUBSCRIPTION STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-[#dc3545] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-4 text-white shadow-lg">
          <div>
            <h4 className="text-lg sm:text-xl font-black font-outfit">
              Get Diwali Crackers Offers First!
            </h4>
            <p className="text-xs text-red-100 font-semibold mt-1">
              Subscribe for the latest crackers price catalog, festival combos & safety tips.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              showToast("🎉 Thank you for subscribing! Price list sent to your inbox.");
            }}
            className="flex w-full md:w-auto max-w-md gap-2"
          >
            <input
              type="email"
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-2.5 rounded-xl bg-white text-gray-900 text-xs font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-md"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

    </div>
  );
}
