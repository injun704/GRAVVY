import React, { useState, useMemo } from 'react';
import {
  Flame,
  Search,
  Filter,
  Check,
  Star,
  Clock,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import { Product, PromotionSlide } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { ProductCard } from '../common/ProductCard';
import { FOOD_CATEGORIES } from '../../data/categories';
import { FOOD_PROMOTIONS } from '../../data/promotions';
import { HomeCarousel } from '../home/HomeCarousel';

interface FoodMarketplaceProps {
  products: Product[];
  onOpenProductDetail: (product: Product) => void;
}

const FoodMarketplaceComponent: React.FC<FoodMarketplaceProps> = ({
  products,
  onOpenProductDetail,
}) => {
  const { theme, categoryAccent, textColorPrimary, textColorSecondary, textColorMuted } = useTheme();

  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under200' | 'under400'>('all');
  const [ratingFilter, setRatingFilter] = useState<boolean>(false);
  const [searchFoodQuery, setSearchFoodQuery] = useState('');

  const foodProducts = useMemo(() => {
    return products.filter((p) => p.category === 'food');
  }, [products]);

  const handleSlideAction = (slide: PromotionSlide) => {
    if (slide.subCategoryFilter) {
      setSelectedSubCategory(slide.subCategoryFilter);
    }
  };

  const filteredProducts = useMemo(() => {
    return foodProducts.filter((p) => {
      // Subcategory filter
      if (selectedSubCategory !== 'All' && p.subCategory !== selectedSubCategory) {
        return false;
      }
      // Veg filter
      if (vegFilter === 'veg' && p.veg !== true) return false;
      if (vegFilter === 'non-veg' && p.veg !== false) return false;
      // Price filter
      if (priceFilter === 'under200' && p.price > 200) return false;
      if (priceFilter === 'under400' && p.price > 400) return false;
      // Rating filter
      if (ratingFilter && p.rating < 4.7) return false;
      // Search query
      if (searchFoodQuery.trim()) {
        const q = searchFoodQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.subCategory.toLowerCase().includes(q) ||
          p.restaurantOrBrand.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [foodProducts, selectedSubCategory, vegFilter, priceFilter, ratingFilter, searchFoodQuery]);

  return (
    <div className="space-y-6 pb-16">
      {/* 9-Slide High-Quality Food Promotional Carousel */}
      <section>
        <HomeCarousel
          slides={FOOD_PROMOTIONS}
          onSlideClick={handleSlideAction}
          carouselTitle="Food Promotional Carousel"
        />
      </section>

      {/* Food Categories Horizontal Scroll Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${textColorMuted}`}>
            Browse Food Cuisines
          </h3>
          {selectedSubCategory !== 'All' && (
            <button
              onClick={() => setSelectedSubCategory('All')}
              className="text-xs font-semibold text-red-500 hover:underline"
            >
              Reset Cuisine
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedSubCategory('All')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedSubCategory === 'All'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : theme === 'LIGHT'
                ? 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                : 'bg-white/5 border border-white/10 text-stone-300 hover:bg-white/10'
            }`}
          >
            All Dishes ({foodProducts.length})
          </button>
          {FOOD_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedSubCategory(cat.name)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                selectedSubCategory === cat.name
                  ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-600/30'
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

      {/* Filter Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-black/10 border border-stone-500/15">
        <div className="flex flex-wrap items-center gap-2">
          {/* Veg / Non-Veg Pills */}
          <div className="flex rounded-xl p-1 bg-black/20 border border-stone-500/20">
            <button
              onClick={() => setVegFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                vegFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setVegFilter('veg')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                vegFilter === 'veg' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-300" /> Veg
            </button>
            <button
              onClick={() => setVegFilter('non-veg')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                vegFilter === 'non-veg' ? 'bg-red-600 text-white shadow-xs' : 'text-red-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-300" /> Non-Veg
            </button>
          </div>

          {/* Price Selector */}
          <div className="flex rounded-xl p-1 bg-black/20 border border-stone-500/20">
            <button
              onClick={() => setPriceFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                priceFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-400'
              }`}
            >
              Any Price
            </button>
            <button
              onClick={() => setPriceFilter('under200')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                priceFilter === 'under200' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-400'
              }`}
            >
              &lt; ₹200
            </button>
            <button
              onClick={() => setPriceFilter('under400')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                priceFilter === 'under400' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-400'
              }`}
            >
              &lt; ₹400
            </button>
          </div>

          {/* 4.7+ Rating Toggle */}
          <button
            onClick={() => setRatingFilter(!ratingFilter)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              ratingFilter
                ? 'bg-amber-400 border-amber-400 text-stone-950 font-bold'
                : 'border-stone-500/20 text-stone-400 hover:text-white'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${ratingFilter ? 'fill-stone-950' : 'text-amber-400'}`} />
            <span>4.7+ Rated</span>
          </button>
        </div>

        {/* In-food Search box */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dishes or restaurants..."
            value={searchFoodQuery}
            onChange={(e) => setSearchFoodQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-black/20 border border-stone-500/20 text-white placeholder:text-stone-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Filtered Products Count */}
      <div className="flex items-center justify-between text-xs text-stone-400">
        <span>
          Showing <strong className="text-white">{filteredProducts.length}</strong> available dishes
        </span>
      </div>

      {/* Product Cards Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} onOpenDetail={onOpenProductDetail} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 rounded-3xl border border-stone-500/20 bg-black/10">
          <UtensilsCrossed className="w-10 h-10 text-stone-500 mx-auto mb-3" />
          <h4 className={`text-base font-bold ${textColorPrimary}`}>No dishes match your filters</h4>
          <p className="text-xs text-stone-400 mt-1">
            Try adjusting your cuisine or dietary filters to view available meals.
          </p>
          <button
            onClick={() => {
              setSelectedSubCategory('All');
              setVegFilter('all');
              setPriceFilter('all');
              setRatingFilter(false);
              setSearchFoodQuery('');
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export const FoodMarketplace = React.memo(FoodMarketplaceComponent);
