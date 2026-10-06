import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, X, Search, Sparkles, Check, RotateCcw, ArrowRight, ChevronDown } from 'lucide-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import api from '../../api';

// Price distribution histogram heights (mimicking real product pricing distribution)
const HISTOGRAM_DATA = [
  6, 12, 18, 28, 42, 58, 76, 92, 100, 95, 84, 75, 62, 50, 40, 32, 26, 22, 18, 15, 12, 10, 8, 7, 6, 5, 4, 4, 3, 2
];
const MAX_PRICE_LIMIT = 5000;

export default function FloatingActions({ whatsappNumber = "8610315901" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  // Filter form states
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(true);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE_LIMIT);
  const [sortBy, setSortBy] = useState('default');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data || []);
      } catch (err) {
        console.error('Failed to load categories for filter modal:', err);
      }
    };
    loadCategories();
  }, []);

  // Sync modal state from current URL params whenever modal opens
  useEffect(() => {
    if (filterModalOpen) {
      setSearch(searchParams.get('search') || '');
      const catParam = searchParams.get('category') || '';
      setSelectedCategories(catParam ? catParam.split(',').filter(Boolean) : []);
      setMinPrice(Number(searchParams.get('minPrice')) || 0);
      setMaxPrice(Number(searchParams.get('maxPrice')) || MAX_PRICE_LIMIT);
      setSortBy(searchParams.get('sort') || 'default');
      setInStockOnly(searchParams.get('inStock') === 'true');
    }
  }, [filterModalOpen, searchParams]);

  const activeFiltersCount = [
    Boolean(searchParams.get('search')),
    Boolean(searchParams.get('category')),
    Boolean(searchParams.get('minPrice') && Number(searchParams.get('minPrice')) > 0),
    Boolean(searchParams.get('maxPrice') && Number(searchParams.get('maxPrice')) < MAX_PRICE_LIMIT),
    Boolean(searchParams.get('sort') && searchParams.get('sort') !== 'default'),
    searchParams.get('inStock') === 'true'
  ].filter(Boolean).length;

  const toggleCategory = (catIdStr) => {
    if (selectedCategories.includes(catIdStr)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== catIdStr));
    } else {
      setSelectedCategories([...selectedCategories, catIdStr]);
    }
  };

  const handleMinSliderChange = (e) => {
    const val = Math.min(Number(e.target.value), maxPrice - 50);
    setMinPrice(Math.max(0, val));
  };

  const handleMaxSliderChange = (e) => {
    const val = Math.max(Number(e.target.value), minPrice + 50);
    setMaxPrice(Math.min(MAX_PRICE_LIMIT, val));
  };

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (selectedCategories.length > 0) params.set('category', selectedCategories.join(','));
    if (minPrice > 0) params.set('minPrice', String(minPrice));
    if (maxPrice < MAX_PRICE_LIMIT) params.set('maxPrice', String(maxPrice));
    if (sortBy && sortBy !== 'default') params.set('sort', sortBy);
    if (inStockOnly) params.set('inStock', 'true');

    navigate(`/products?${params.toString()}`);
    setFilterModalOpen(false);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setMinPrice(0);
    setMaxPrice(MAX_PRICE_LIMIT);
    setSortBy('default');
    setInStockOnly(false);

    if (location.pathname === '/products') {
      navigate('/products');
    }
  };

  const triggerFireworks = () => {
    sessionStorage.setItem('aviraTriggerFireworks', 'true');
    window.location.reload();
  };

  const cleanNumber = whatsappNumber ? whatsappNumber.replace(/[^\d]/g, '') : '918610315901';
  const fullWaNumber = cleanNumber.startsWith('91') ? cleanNumber : `91${cleanNumber}`;
  const whatsappUrl = `https://wa.me/${fullWaNumber}?text=${encodeURIComponent(
    "Hi Avira Pyrotech, I would like to enquire about Sivakasi crackers price list and bulk orders."
  )}`;

  // Calculate percentage for dual range track
  const minPercent = Math.min(100, Math.max(0, (minPrice / MAX_PRICE_LIMIT) * 100));
  const maxPercent = Math.min(100, Math.max(0, (maxPrice / MAX_PRICE_LIMIT) * 100));

  return (
    <>
      {/* ── Floating Action Buttons (Bottom-Right) ── */}
      <div className="fixed bottom-6 right-5 z-40 flex flex-col items-end gap-3 pointer-events-none select-none">
        {/* Replay Fireworks Mini Action */}
        <button
          onClick={triggerFireworks}
          title="Replay Fireworks Show"
          aria-label="Replay Fireworks Show"
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900/90 hover:bg-black text-amber-300 text-xs font-bold shadow-lg border border-amber-400/30 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Sparkles size={14} className="text-amber-400 animate-pulse" />
          <span className="hidden sm:inline">Fireworks Show</span>
        </button>

        {/* Floating Filter Button (Matching WhatsApp Button Size) - Mobile Only */}
        <button
          onClick={() => setFilterModalOpen(true)}
          title="Filter Crackers"
          aria-label="Filter Crackers"
          className="pointer-events-auto relative flex lg:hidden items-center justify-center w-11 h-11 bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-700 hover:to-orange-700 text-white rounded-full shadow-lg border border-white/20 transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <SlidersHorizontal size={20} />
          {/* Active Filters Badge Indicator */}
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 text-gray-900 text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-scale-up">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Floating WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="pointer-events-auto flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-6 h-6 fill-current"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
        </a>
      </div>

      {/* ── Filter Modal / Bottom Sheet (Bottom to Center) ── */}
      {filterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          {/* Backdrop */}
          <div
            onClick={() => setFilterModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Card */}
          <div className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] animate-slide-up">
            {/* Header: White background, left Filter text, right Close button, and divider line */}
            <div className="px-5 py-3.5 bg-white border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 tracking-tight">Filter</h3>
              <button
                type="button"
                onClick={() => setFilterModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                aria-label="Close filter modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleApplyFilters} className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* 1. Search Bar (Matching Reference Image) */}
              <div className="flex items-stretch border border-transparent focus-within:border-black rounded-lg overflow-hidden bg-gray-100/80 focus-within:bg-white transition-colors duration-200">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-gray-800 placeholder-gray-400 outline-none focus:outline-none focus:ring-0 bg-transparent border-none"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="px-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer flex items-center justify-center"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 bg-[#2b2b2b] hover:bg-[#1f1f1f] text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Search"
                >
                  <Search size={16} />
                </button>
              </div>

              {/* Divider Line between Search and Price */}
              <div className="border-t border-gray-200" />

              {/* 2. Minimal Compact Price Filter with Histogram & Inline Inputs */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Price
                </label>

                {/* Compact Histogram & Dual Range Slider Container */}
                <div className="pt-2 pb-1 px-1">
                  {/* Vertical Distribution Bars (Compact Height) */}
                  <div className="h-10 flex items-end gap-[2.5px] w-full px-1">
                    {HISTOGRAM_DATA.map((height, i) => {
                      const barPrice = (i / (HISTOGRAM_DATA.length - 1)) * MAX_PRICE_LIMIT;
                      const isInRange = barPrice >= minPrice && barPrice <= maxPrice;
                      return (
                        <div
                          key={i}
                          style={{ height: `${height}%` }}
                          className={`flex-1 rounded-t-xs transition-colors duration-150 ${
                            isInRange ? 'bg-gray-400' : 'bg-gray-200'
                          }`}
                        />
                      );
                    })}
                  </div>

                  {/* Range Slider Track & Two Thumbs */}
                  <div className="relative h-6 flex items-center">
                    {/* Inactive Track */}
                    <div className="absolute w-full h-[2px] bg-gray-300 rounded-full" />

                    {/* Active Track between Min and Max */}
                    <div
                      className="absolute h-[3px] bg-[#222222] rounded-full"
                      style={{
                        left: `${minPercent}%`,
                        right: `${100 - maxPercent}%`
                      }}
                    />

                    {/* Min Price Slider Input */}
                    <input
                      type="range"
                      min="0"
                      max={MAX_PRICE_LIMIT}
                      step="25"
                      value={minPrice}
                      onChange={handleMinSliderChange}
                      className="range-slider-input"
                      aria-label="Minimum price"
                    />

                    {/* Max Price Slider Input */}
                    <input
                      type="range"
                      min="0"
                      max={MAX_PRICE_LIMIT}
                      step="25"
                      value={maxPrice}
                      onChange={handleMaxSliderChange}
                      className="range-slider-input"
                      aria-label="Maximum price"
                    />
                  </div>
                </div>

                {/* Min & Max Price Input Boxes (No Border Radius, Price Next to Title) */}
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <div className="border border-gray-300 rounded-none px-3 py-2 bg-white flex items-center justify-between focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                    <span className="text-xs text-gray-600 font-semibold shrink-0">Min Price</span>
                    <div className="flex items-center justify-end font-bold text-xs sm:text-sm text-gray-900 ml-1">
                      <span className="text-gray-500 mr-0.5">₹</span>
                      <input
                        type="number"
                        min="0"
                        max={maxPrice - 50}
                        value={minPrice}
                        onChange={(e) => {
                          const v = Number(e.target.value) || 0;
                          setMinPrice(Math.max(0, Math.min(v, maxPrice - 50)));
                        }}
                        className="w-14 text-right font-bold outline-none bg-transparent"
                      />
                    </div>
                  </div>

                  <div className="border border-gray-300 rounded-none px-3 py-2 bg-white flex items-center justify-between focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                    <span className="text-xs text-gray-600 font-semibold shrink-0">Max Price</span>
                    <div className="flex items-center justify-end font-bold text-xs sm:text-sm text-gray-900 ml-1">
                      <span className="text-gray-500 mr-0.5">₹</span>
                      <input
                        type="number"
                        min={minPrice + 50}
                        max={MAX_PRICE_LIMIT}
                        value={maxPrice}
                        onChange={(e) => {
                          const v = Number(e.target.value) || minPrice + 50;
                          setMaxPrice(Math.min(MAX_PRICE_LIMIT, Math.max(v, minPrice + 50)));
                        }}
                        className="w-14 text-right font-bold outline-none bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider Line between Price and Categories */}
              <div className="border-t border-gray-200" />

              {/* 3. Categories Dropdown (Matching Search Bar Style, Rounded-None) */}
              <div>
                <div className="border border-gray-300 rounded-none overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                    className="w-full flex items-stretch bg-white cursor-pointer transition-colors"
                  >
                    <div className="flex-1 px-3.5 py-2.5 bg-white flex items-center justify-between text-left min-w-0">
                      <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate pr-2">
                        {selectedCategories.length === 0
                          ? 'All Categories'
                          : categories
                              .filter((cat) => selectedCategories.includes(String(cat.id)))
                              .map((cat) => cat.name)
                              .join(', ')}
                      </span>
                      {selectedCategories.length > 0 && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-black rounded-none shrink-0">
                          {selectedCategories.length} selected
                        </span>
                      )}
                    </div>
                    <div className="px-4 bg-[#2b2b2b] hover:bg-[#1f1f1f] text-white flex items-center justify-center transition-colors shrink-0">
                      <ChevronDown
                        size={16}
                        className={`text-white transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </button>

                  {/* Smooth Animated Collapsible Content */}
                  <div
                    className={`grid transition-all duration-300 ease-in-out border-gray-200 bg-white ${
                      categoryDropdownOpen ? 'grid-rows-[1fr] opacity-100 border-t' : 'grid-rows-[0fr] opacity-0 border-t-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="p-0 max-h-52 overflow-y-auto divide-y divide-gray-200">
                        {/* All Categories Option */}
                        <button
                          type="button"
                          onClick={() => setSelectedCategories([])}
                          className={`w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-medium rounded-none cursor-pointer transition-colors duration-150 ${
                            selectedCategories.length === 0
                              ? 'bg-black text-white'
                              : 'bg-white text-gray-800 hover:bg-gray-100'
                          }`}
                        >
                          <span>All Categories</span>
                          {selectedCategories.length === 0 && (
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">All</span>
                          )}
                        </button>

                        {/* Individual Category Item Buttons */}
                        {categories.map((cat) => {
                          const isSelected = selectedCategories.includes(String(cat.id));
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => toggleCategory(String(cat.id))}
                              className={`w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-medium rounded-none cursor-pointer transition-all duration-150 ${
                                isSelected
                                  ? 'bg-black text-white shadow-xs'
                                  : 'bg-white text-gray-800 hover:bg-gray-100'
                              }`}
                            >
                              <span>{cat.name}</span>
                              {isSelected && (
                                <X
                                  size={14}
                                  className="text-white hover:text-red-400 shrink-0 transition-colors ml-2"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider Line between Categories and Sort */}
              <div className="border-t border-gray-200" />

              {/* 4. Sort By Dropdown (Matching Search & Category Bar Style, Rounded-None) */}
              <div>
                <div className="border border-gray-300 rounded-none overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                    className="w-full flex items-stretch bg-white cursor-pointer transition-colors"
                  >
                    <div className="flex-1 px-3.5 py-2.5 bg-white flex items-center justify-between text-left min-w-0">
                      <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate pr-2">
                        {[
                          { id: 'default', label: 'Featured / Default' },
                          { id: 'price_asc', label: 'Price: Low to High' },
                          { id: 'price_desc', label: 'Price: High to Low' },
                          { id: 'name_asc', label: 'Name: A to Z' },
                        ].find((s) => s.id === sortBy)?.label || 'Featured / Default'}
                      </span>
                    </div>
                    <div className="px-4 bg-[#2b2b2b] hover:bg-[#1f1f1f] text-white flex items-center justify-center transition-colors shrink-0">
                      <ChevronDown
                        size={16}
                        className={`text-white transition-transform duration-200 ${sortDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </button>

                  {/* Smooth Animated Collapsible Content */}
                  <div
                    className={`grid transition-all duration-300 ease-in-out border-gray-200 bg-white ${
                      sortDropdownOpen ? 'grid-rows-[1fr] opacity-100 border-t' : 'grid-rows-[0fr] opacity-0 border-t-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="p-0 max-h-52 overflow-y-auto divide-y divide-gray-200">
                        {[
                          { id: 'default', label: 'Featured / Default' },
                          { id: 'price_asc', label: 'Price: Low to High' },
                          { id: 'price_desc', label: 'Price: High to Low' },
                          { id: 'name_asc', label: 'Name: A to Z' },
                        ].map((s) => {
                          const isSelected = sortBy === s.id;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setSortBy(s.id);
                                setSortDropdownOpen(false);
                              }}
                              className={`w-full px-3.5 py-2.5 flex items-center justify-between text-xs sm:text-sm font-medium rounded-none cursor-pointer transition-all duration-150 ${
                                isSelected
                                  ? 'bg-black text-white shadow-xs'
                                  : 'bg-white text-gray-800 hover:bg-gray-100'
                              }`}
                            >
                              <span>{s.label}</span>
                              {isSelected && (
                                <Check
                                  size={14}
                                  className="text-white shrink-0 ml-2"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider Line between Sort and In Stock */}
              <div className="border-t border-gray-200" />

              {/* 5. In Stock Only Checkbox (Rounded-None, Text Left, Checkbox Right) */}
              <div>
                <label className="flex items-center justify-between p-3.5 bg-white hover:bg-gray-50/80 border border-gray-300 rounded-none cursor-pointer transition-colors select-none">
                  <span className="text-xs sm:text-sm font-semibold text-gray-800">In Stock Only</span>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 text-black accent-black rounded-none border-gray-300 focus:ring-0 cursor-pointer"
                  />
                </label>
              </div>
            </form>

            {/* Footer Buttons */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-1/3 py-2.5 px-4 bg-white hover:bg-gray-100 text-black border border-gray-300 font-bold text-xs sm:text-sm rounded-none transition-colors cursor-pointer text-center"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="w-2/3 py-2.5 px-4 bg-black hover:bg-gray-900 text-white font-bold text-xs sm:text-sm rounded-none transition-all active:scale-98 flex items-center justify-center cursor-pointer"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
