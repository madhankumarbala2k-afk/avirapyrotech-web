import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../api';
import { Flame, Sparkles } from 'lucide-react';
import CrackerBlast from './CrackerBlast';

export default function CategoryMarquee({ categories = [] }) {
  // Built-in fallback categories with festive imagery/illustrations if backend categories are still loading or empty
  const defaultCategories = [
    { id: 'sparklers', name: 'Sparklers', icon: '✨', count: '15+ Items' },
    { id: 'flower-pots', name: 'Flower Pots', icon: '🎆', count: '20+ Items' },
    { id: 'ground-chakkars', name: 'Ground Chakkars', icon: '🌀', count: '18+ Items' },
    { id: 'rockets', name: 'Rockets & Bombs', icon: '🚀', count: '25+ Items' },
    { id: 'sky-shots', name: 'Aerial Sky Shots', icon: '🎇', count: '30+ Items' },
    { id: 'gift-boxes', name: 'Diwali Gift Boxes', icon: '🎁', count: '10+ Packs' },
    { id: 'novelties', name: 'Fancy Novelties', icon: '⭐', count: '14+ Items' },
    { id: 'single-crackers', name: 'Single Crackers', icon: '💥', count: '12+ Items' }
  ];

  // If user has categories from backend, use them; if fewer than 6, blend with defaults to keep the marquee grand
  const displayCategories = categories && categories.length >= 4 
    ? categories 
    : (categories && categories.length > 0 
        ? [...categories, ...defaultCategories.filter(d => !categories.some(c => c.name.toLowerCase() === d.name.toLowerCase()))] 
        : defaultCategories);

  // Duplicate items twice to achieve completely seamless infinite marquee loop
  const marqueeItems = [...displayCategories, ...displayCategories, ...displayCategories];

  return (
    <section className="w-full overflow-hidden py-10 bg-[#fdf8ef] border-b border-amber-100 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px] font-black uppercase tracking-widest mb-1.5">
          <Sparkles size={12} />
          <span>Shop by Category</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 font-outfit tracking-tight">
          Shop Crackers by Category
        </h2>
        <p className="text-gray-500 text-xs sm:text-sm font-semibold max-w-xl mx-auto mt-1">
          Explore our wide range of authentic Sivakasi fireworks, family gift combos, and aerial display shots.
        </p>
      </div>

      {/* Infinite Scrolling Track */}
      <div className="relative w-full overflow-hidden py-2 group">
        <div className="flex gap-6 sm:gap-8 w-max animate-category-scroll group-hover:[animation-play-state:paused]">
          {marqueeItems.map((cat, idx) => {
            const hasCustomImage = cat.imagePath;
            const categoryLink = cat.id && typeof cat.id === 'number'
              ? `/products?category=${cat.id}`
              : `/products?search=${encodeURIComponent(cat.name)}`;

            return (
              <Link
                key={`${cat.id || cat.name}-${idx}`}
                to={categoryLink}
                className="flex flex-col items-center flex-shrink-0 w-32 sm:w-36 group/item transition-transform"
              >
                {/* Circular thumbnail container with gold border */}
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white border-3 border-amber-300/60 shadow-sm group-hover/item:border-[#d9ac4f] group-hover/item:-translate-y-2 group-hover/item:shadow-xl group-hover/item:shadow-amber-500/15 transition-all duration-300 flex items-center justify-center overflow-hidden relative">
                  <CrackerBlast />
                  {hasCustomImage ? (
                    <img
                      src={getImageUrl(cat.imagePath)}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-4">
                      <span className="text-3xl sm:text-4xl group-hover/item:scale-115 transition-transform duration-300">
                        {cat.icon || '🎆'}
                      </span>
                    </div>
                  )}
                  {/* Subtle inner gold glow on hover */}
                  <div className="absolute inset-0 rounded-full bg-amber-400/0 group-hover/item:bg-amber-400/5 transition-colors pointer-events-none" />
                </div>

                {/* Category Name */}
                <span className="mt-3 text-xs sm:text-sm font-bold text-gray-800 group-hover/item:text-[#d9ac4f] transition-colors text-center whitespace-nowrap line-clamp-1">
                  {cat.name}
                </span>

                {cat.count && (
                  <span className="text-[10px] text-gray-600 font-semibold mt-0.5">
                    {cat.count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
