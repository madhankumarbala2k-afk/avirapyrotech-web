import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../../api';
import { Flame, CheckCircle, Search, X, ChevronDown, Check } from 'lucide-react';
import CrackerBlast from '../../components/customer/CrackerBlast';

// Price distribution histogram heights (matching FloatingActions)
const HISTOGRAM_DATA = [
  6, 12, 18, 28, 42, 58, 76, 92, 100, 95, 84, 75, 62, 50, 40, 32, 26, 22, 18, 15, 12, 10, 8, 7, 6, 5, 4, 4, 3, 2
];
const MAX_PRICE_LIMIT = 5000;

export default function ProductList() {
  const [products, setProducts]         = useState([]);
  const [categories, setCategories]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate                        = useNavigate();

  // Filter form states (matching the FloatingActions filter card)
  const [search, setSearch]             = useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get('category') ? searchParams.get('category').split(',').filter(Boolean) : []
  );
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(true);
  const [minPrice, setMinPrice]         = useState(Number(searchParams.get('minPrice')) || 0);
  const [maxPrice, setMaxPrice]         = useState(Number(searchParams.get('maxPrice')) || MAX_PRICE_LIMIT);
  const [sortBy, setSortBy]             = useState(searchParams.get('sort') || 'default');
  const [sortDropdownOpen, setSortDropdownOpen]         = useState(false);
  const [inStockOnly, setInStockOnly]   = useState(searchParams.get('inStock') === 'true');

  const [quantities, setQuantities]     = useState({});

  // Toast notification state
  const [toast, setToast] = useState('');
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const qSearch = searchParams.get('search') || search;
      const catParam = searchParams.get('category') || '';
      const catArray = catParam ? catParam.split(',').filter(Boolean) : selectedCategories;
      const singleCatId = catArray.length === 1 ? catArray[0] : null;

      const params = {
        search: qSearch.trim() || null,
        categoryId: singleCatId,
        size: 250,
      };
      const response = await api.get('/products', { params });
      setProducts(response.data?.content || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Sync state when URL params change
  useEffect(() => {
    const qSearch = searchParams.get('search') || '';
    const qCategory = searchParams.get('category') || '';
    const qMinPrice = Number(searchParams.get('minPrice')) || 0;
    const qMaxPrice = Number(searchParams.get('maxPrice')) || MAX_PRICE_LIMIT;
    const qSort = searchParams.get('sort') || 'default';
    const qInStock = searchParams.get('inStock') === 'true';

    setSearch(qSearch);
    setSelectedCategories(qCategory ? qCategory.split(',').filter(Boolean) : []);
    setMinPrice(qMinPrice);
    setMaxPrice(qMaxPrice);
    setSortBy(qSort);
    setInStockOnly(qInStock);

    fetchProducts();
  }, [searchParams]);

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

    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setMinPrice(0);
    setMaxPrice(MAX_PRICE_LIMIT);
    setSortBy('default');
    setInStockOnly(false);
    setSearchParams({});
  };

  const sortParam = searchParams.get('sort') || 'default';
  const inStockParam = searchParams.get('inStock') === 'true';
  const activeMinPrice = Number(searchParams.get('minPrice')) || 0;
  const activeMaxPrice = Number(searchParams.get('maxPrice')) || MAX_PRICE_LIMIT;

  const filteredProducts = products
    .filter((prod) => {
      const price = prod.offerPrice || prod.originalPrice;
      const matchesPrice = price >= activeMinPrice && price <= activeMaxPrice;
      const activeSearch = searchParams.get('search') || '';
      const matchesSearch =
        activeSearch.trim() === '' ||
        prod.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
        (prod.productCode && prod.productCode.toLowerCase().includes(activeSearch.toLowerCase()));
      const matchesStock = !inStockParam || prod.stockQuantity > 0;
      const activeCats = searchParams.get('category') ? searchParams.get('category').split(',').filter(Boolean) : [];
      const matchesCategory =
        activeCats.length === 0 ||
        (prod.category && activeCats.includes(String(prod.category.id)));
      return matchesPrice && matchesSearch && matchesStock && matchesCategory;
    })
    .sort((a, b) => {
      const priceA = a.offerPrice || a.originalPrice;
      const priceB = b.offerPrice || b.originalPrice;
      if (sortParam === 'price_asc') return priceA - priceB;
      if (sortParam === 'price_desc') return priceB - priceA;
      if (sortParam === 'name_asc') return a.name.localeCompare(b.name);
      return 0;
    });

  const addToCartDirectly = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const idx = cart.findIndex((i) => i.product.id === product.id);
    if (idx > -1) {
      cart[idx].quantity += 1;
    } else {
      cart.push({
        product,
        quantity: 1,
        price: product.offerPrice || product.originalPrice,
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    showToast(`✅ ${product.name} added to cart!`);
  };

  // Dual range track percentages
  const minPercent = Math.min(100, Math.max(0, (minPrice / MAX_PRICE_LIMIT) * 100));
  const maxPercent = Math.min(100, Math.max(0, (maxPrice / MAX_PRICE_LIMIT) * 100));

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* ── Toast notification ── */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900/95 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2 border border-gray-700 animate-fade-in">
          <CheckCircle size={18} className="text-green-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between gap-4 border-b border-gray-200/80 pb-4">
        <div>
          <span className="text-red-600 text-[11px] font-black uppercase tracking-widest block mb-0.5">
            Direct Sivakasi Fireworks
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-outfit text-gray-900">Crackers Online Shop</h1>
          <p className="text-xs text-gray-400 font-semibold mt-0.5">
            {loading ? 'Loading catalog…' : `${filteredProducts.length} items available at factory prices`}
          </p>
        </div>
      </div>

      {/* ── Main Layout: Desktop Sidebar Filter + Products Grid ── */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* ── DESKTOP SIDEBAR FILTER (Increased Width, Rounded-None) ── */}
        <aside className="hidden lg:block w-full lg:w-[380px] xl:w-[410px] shrink-0 bg-white rounded-none shadow-sm border border-gray-200 overflow-hidden sticky top-20">
          {/* Header */}
          <div className="px-5 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 tracking-tight">Filter</h3>
          </div>

          {/* Form Body */}
          <form onSubmit={handleApplyFilters} className="p-5 space-y-5">
            {/* 1. Search Bar */}
            <div className="flex items-stretch border border-transparent focus-within:border-black rounded-none overflow-hidden bg-gray-100/80 focus-within:bg-white transition-colors duration-200">
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

            {/* 2. Compact Price Filter with Histogram & Inline Inputs */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Price
              </label>

              {/* Histogram & Dual Range Slider Container */}
              <div className="pt-2 pb-1 px-1">
                {/* Vertical Distribution Bars */}
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

              {/* Min & Max Price Input Boxes (Rounded-None, Price Next to Title) */}
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

            {/* 4. Sort By Dropdown */}
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

            {/* 5. In Stock Only Checkbox */}
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

            {/* Footer Buttons (Reset & Apply Filters) */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-1/3 py-2.5 px-4 bg-white hover:bg-gray-100 text-black border border-gray-300 font-bold text-xs sm:text-sm rounded-none transition-colors cursor-pointer text-center"
              >
                Reset
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 px-4 bg-black hover:bg-gray-900 text-white font-bold text-xs sm:text-sm rounded-none transition-all active:scale-98 flex items-center justify-center cursor-pointer"
              >
                Apply Filters
              </button>
            </div>
          </form>
        </aside>

        {/* ── Products Grid ── */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-150 p-14 text-center">
              <Flame className="mx-auto text-gray-200 mb-3 animate-pulse" size={52} />
              <p className="text-gray-500 font-bold text-sm">No crackers found matching your filters</p>
              <button
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((prod) => {
                const currentQty = quantities[prod.id] || 1;
                const discount =
                  prod.offerPrice && prod.offerPrice < prod.originalPrice
                    ? Math.round(((prod.originalPrice - prod.offerPrice) / prod.originalPrice) * 100)
                    : 20; // 20% discount badge default
                const finalPrice = prod.offerPrice || Math.round(prod.originalPrice * 0.8);
                const isOutOfStock = prod.stockQuantity <= 0;

                return (
                  <div
                    key={prod.id}
                    className="bg-white rounded-xl sm:rounded-2xl border border-amber-900/10 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-amber-400 hover:-translate-y-1.5 transition-all duration-300 group relative cracker-card-glow"
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
                          <Flame className="text-gray-300 group-hover:scale-115 transition-transform duration-300" size={36} />
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
                        <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          {prod.productCode || 'AP_101'}
                        </p>
                        <h3 className="font-bold text-xs sm:text-sm text-gray-800 mt-0.5 leading-snug break-words">
                          {prod.name}
                        </h3>
                      </div>

                      {/* Pricing Details */}
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm sm:text-lg font-extrabold text-red-600">
                          ₹{(prod.offerPrice || prod.originalPrice)?.toLocaleString('en-IN')}
                        </span>
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
                          className="w-full py-2 sm:py-2.5 px-2.5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95 shadow-xs flex items-center justify-center"
                        >
                          {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
