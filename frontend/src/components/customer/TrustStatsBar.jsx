import React from 'react';
import { Award, Store, Package, Truck } from 'lucide-react';

export default function TrustStatsBar() {
  const stats = [
    {
      icon: Award,
      title: "30+ YEARS",
      subtitle: "Trusted Experience"
    },
    {
      icon: Store,
      title: "100% SIVAKASI",
      subtitle: "Direct Factory Prices"
    },
    {
      icon: Package,
      title: "200+ PRODUCTS",
      subtitle: "Wide Festival Range"
    },
    {
      icon: Truck,
      title: "HOME DELIVERY",
      subtitle: "Safe Doorstep Transport"
    }
  ];

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#f8c51c] via-[#ffd43b] to-[#f8c51c] shadow-md border-y border-amber-400/40 select-none">
      {/* Moving Diagonal Light Sweeping Shine */}
      <div className="absolute top-0 bottom-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] animate-trust-shine pointer-events-none z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-5 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 divide-y lg:divide-y-0 lg:divide-x divide-red-800/15">
          {stats.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3.5 sm:gap-4 px-2 sm:px-4 py-2 sm:py-1 transition-transform duration-300 hover:-translate-y-1 group cursor-default"
              >
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-red-700/10 border border-red-700/15 flex items-center justify-center text-[#b32616] transition-all duration-300 group-hover:scale-115 group-hover:-rotate-6 group-hover:bg-red-700/15 shrink-0 shadow-sm">
                  <IconComponent size={26} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-black text-gray-900 tracking-wide uppercase leading-tight font-outfit">
                    {item.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs font-semibold text-gray-800/80 leading-tight mt-0.5 truncate">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
