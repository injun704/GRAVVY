import React, { useMemo } from 'react';
import { Clock, ShoppingBag, ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Product } from '../../types';
import { ProductCard } from '../common/ProductCard';
import { DedicatedPageHeader } from '../common/DedicatedPageHeader';

interface RecentlyViewedPageProps {
  allProducts: Product[];
  onOpenProductDetail: (product: Product) => void;
  onContinueShopping: () => void;
  onBack: () => void;
}

export const RecentlyViewedPage: React.FC<RecentlyViewedPageProps> = ({
  allProducts,
  onOpenProductDetail,
  onContinueShopping,
  onBack,
}) => {
  const { theme, categoryAccent, textColorPrimary, textColorMuted } = useTheme();

  // Read recently viewed product IDs from localStorage
  const viewedProductIds = useMemo<string[]>(() => {
    try {
      const saved = localStorage.getItem('gravvy_recently_viewed');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  }, []);

  const recentlyViewedProducts = useMemo(() => {
    if (viewedProductIds.length === 0) return [];
    const map = new Map(allProducts.map((p) => [p.id, p]));
    const list: Product[] = [];
    for (const id of viewedProductIds) {
      const prod = map.get(id);
      if (prod) list.push(prod);
    }
    return list;
  }, [allProducts, viewedProductIds]);

  return (
    <div className="w-full space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Dedicated Header */}
      <DedicatedPageHeader
        title="Recently Viewed"
        onBack={onBack}
        itemCount={recentlyViewedProducts.length}
      />

      {recentlyViewedProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4">
          {recentlyViewedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetail={onOpenProductDetail}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div
          className={`p-8 rounded-3xl border text-center space-y-4 backdrop-blur-xl ${
            theme === 'LIGHT' ? 'bg-white/80 border-stone-200' : 'bg-stone-900/40 border-white/10'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-teal-500/15 text-teal-400 flex items-center justify-center mx-auto">
            <Clock className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className={`text-base font-bold font-display ${textColorPrimary}`}>
              No Recently Viewed Products
            </h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              As you browse dishes, groceries, and pharmacy medicines, your recently visited items will appear here for one-tap reordering.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onContinueShopping}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 mx-auto active:scale-95 transition-all shadow-md cursor-pointer ${categoryAccent.bgClass}`}
            >
              <ShoppingBag className="w-4 h-4 text-stone-950" />
              <span className="text-stone-950 font-black">Continue Shopping</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-950" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
