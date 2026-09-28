import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Apple,
  Carrot,
  Sparkles,
  Search,
  Filter,
  Package,
} from 'lucide-react';
import { Product, PromotionSlide } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { ProductCard } from '../common/ProductCard';
import { GROCERY_PROMOTIONS } from '../../data/promotions';
import { GROCERY_CATEGORIES } from '../../data/categories';
import { HomeCarousel } from '../home/HomeCarousel';

interface GroceryMarketplaceProps {
  products: Product[];
  onOpenProductDetail: (product: Product) => void;
}

const GroceryMarketplaceComponent: React.FC<GroceryMarketplaceProps> = ({
  products,
  onOpenProductDetail,
}) => {
  const { theme, categoryAccent, textColorPrimary, textColorMuted } = useTheme();

  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [searchGroceryQuery, setSearchGroceryQuery] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

  const groceryProducts = useMemo(() => {
    return products.filter((p) => p.category === 'grocery');
  }, [products]);

  const filteredProducts = useMemo(() => {
    return groceryProducts.filter((p) => {
      if (selectedSubCategory !== 'All' && p.subCategory !== selectedSubCategory) {
        return false;
      }
      if (inStockOnly && !p.inStock) {
        return false;
      }
      if (searchGroceryQuery.trim()) {
        const q = searchGroceryQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.subCategory.toLowerCase().includes(q) ||
          p.restaurantOrBrand.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [groceryProducts, selectedSubCategory, inStockOnly, searchGroceryQuery]);

  return (
    <div className="space-y-6 pb-16">
      {/* Dedicated 9-Slide Grocery Promotional Carousel */}
      <section>
        <HomeCarousel
          slides={GROCERY_PROMOTIONS}
          onSlideClick={() => {}}
        />
      </section>

      {/* Grocery Category Taxonomy Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${textColorMuted}`}>
            Browse Grocery Aisles
          </h3>
          {selectedSubCategory !== 'All' && (
            <button
              onClick={() => setSelectedSubCategory('All')}
              className="text-xs font-semibold text-emerald-500 hover:underline"
            >
              Reset Aisle
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedSubCategory('All')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedSubCategory === 'All'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : theme === 'LIGHT'
                ? 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                : 'bg-white/5 border border-white/10 text-stone-300 hover:bg-white/10'
            }`}
          >
            All Grocery ({groceryProducts.length})
          </button>
          {GROCERY_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedSubCategory(cat.name)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                selectedSubCategory === cat.name
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : theme === 'LIGHT'
                  ? 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10'
              }`}
            >
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="w-5 h-5 rounded-md object-cover"
                referrerPolicy="no-referrer"
              />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search and In-Stock Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-black/10 border border-stone-500/15">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              inStockOnly
                ? 'bg-emerald-600 border-emerald-600 text-white font-bold'
                : 'border-stone-500/20 text-stone-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>In-Stock Only</span>
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search fruits, milk, oil, veggies..."
            value={searchGroceryQuery}
            onChange={(e) => setSearchGroceryQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-black/20 border border-stone-500/20 text-white placeholder:text-stone-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid of Grocery Products */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4">
        {filteredProducts.map((p) => (
          <ProductCard key={p.id} product={p} onOpenDetail={onOpenProductDetail} />
        ))}
      </div>
    </div>
  );
};

export const GroceryMarketplace = React.memo(GroceryMarketplaceComponent);
