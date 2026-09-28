import React, { useMemo } from 'react';
import {
  Sparkles,
  Flame,
  ArrowRight,
  TrendingUp,
  Percent,
  Award,
  Apple,
  Carrot,
  Coffee,
  ShoppingBag,
  UtensilsCrossed,
  ShieldCheck,
} from 'lucide-react';
import { Product, PromotionSlide, CategoryTab } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { HomeCarousel } from './HomeCarousel';
import { ProductCard } from '../common/ProductCard';
import { FOOD_CATEGORIES, GROCERY_CATEGORIES } from '../../data/categories';

interface HomePageProps {
  products: Product[];
  promotions: PromotionSlide[];
  onOpenProductDetail: (product: Product) => void;
  onSelectCategory: (tab: CategoryTab) => void;
}

const HomePageComponent: React.FC<HomePageProps> = ({
  products,
  promotions,
  onOpenProductDetail,
  onSelectCategory,
}) => {
  const { theme, categoryAccent, textColorPrimary, textColorSecondary, textColorMuted } = useTheme();

  // STRICT REQUIREMENT (Section 9): Home page must contain ONLY Food and Grocery products.
  // NEVER display Medicine products or healthcare recommendations on Home.
  const {
    homeSafeProducts,
    popularFood,
    foodDeals,
    groceryDeals,
    freshFruits,
    freshVegetables,
    dailyEssentials,
    bestSellers,
    budgetFriendly,
    trendingProducts,
    recommendedForYou,
    recentlyViewed,
    specialOffers,
    moreFood,
    moreGrocery,
  } = useMemo(() => {
    const homeSafe = products.filter((p) => p.category !== 'medicine');
    return {
      homeSafeProducts: homeSafe,
      popularFood: homeSafe.filter((p) => p.category === 'food' && p.rating >= 4.7),
      foodDeals: homeSafe.filter((p) => p.category === 'food' && p.discountPercent >= 16),
      groceryDeals: homeSafe.filter((p) => p.category === 'grocery' && p.discountPercent >= 18),
      freshFruits: homeSafe.filter((p) => p.category === 'grocery' && p.subCategory === 'Fruits'),
      freshVegetables: homeSafe.filter((p) => p.category === 'grocery' && p.subCategory === 'Vegetables'),
      dailyEssentials: homeSafe.filter(
        (p) =>
          p.category === 'grocery' &&
          (p.subCategory === 'Milk & Dairy' ||
            p.subCategory === 'Rice & Flour' ||
            p.subCategory === 'Cooking Oil & Spices')
      ),
      bestSellers: homeSafe.filter((p) => p.bestSeller),
      budgetFriendly: homeSafe.filter((p) => p.budgetFriendly || p.price < 200),
      trendingProducts: homeSafe.filter((p) => p.trending),
      recommendedForYou: homeSafe.slice(0, 6),
      recentlyViewed: homeSafe.slice(2, 6),
      specialOffers: homeSafe.filter((p) => p.dealOfTheDay),
      moreFood: homeSafe.filter((p) => p.category === 'food').slice(0, 6),
      moreGrocery: homeSafe.filter((p) => p.category === 'grocery').slice(0, 6),
    };
  }, [products]);

  // Trending Restaurants list
  const trendingRestaurants = [
    {
      name: 'Dawat-e-Khaas',
      cuisine: 'Hyderabadi Dum Biryani & Mughlai',
      rating: 4.8,
      deliveryTime: '25-30 mins',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
      tag: '50% OFF',
    },
    {
      name: 'Crust & Hearth Pizzeria',
      cuisine: 'Woodfired Sourdough Pizzas',
      rating: 4.9,
      deliveryTime: '20-25 mins',
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
      tag: 'Free Garlic Bread',
    },
    {
      name: 'The Gourmet Bun Co.',
      cuisine: 'Smash Angus & Crispy Burgers',
      rating: 4.7,
      deliveryTime: '15-20 mins',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
      tag: 'Top Rated',
    },
    {
      name: 'Park Street Rolls',
      cuisine: 'Authentic Nizam Kolkata Kathi Rolls',
      rating: 4.9,
      deliveryTime: '15-20 mins',
      imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=80',
      tag: 'Street Legend',
    },
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* 9-Slide Food & Grocery Promotional Carousel */}
      <section>
        <HomeCarousel
          slides={promotions}
          onSlideClick={(slide) => onSelectCategory(slide.targetCategory)}
        />
      </section>

      {/* 1. Shop by Category (Food & Grocery quick buttons) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-lg font-bold font-display ${textColorPrimary}`}>
              Shop Food & Grocery Categories
            </h2>
            <p className="text-xs text-stone-400">Handcrafted meals & farm fresh daily groceries</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onSelectCategory('food')}
              className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-0.5"
            >
              Food Menu <ArrowRight className="w-3 h-3" />
            </button>
            <span className="text-stone-500">·</span>
            <button
              onClick={() => onSelectCategory('grocery')}
              className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-0.5"
            >
              Grocery Mart <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
          {[...FOOD_CATEGORIES.slice(0, 4), ...GROCERY_CATEGORIES.slice(0, 4)].map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.category)}
              className={`flex flex-col items-center p-3 rounded-2xl border transition-all hover:scale-105 cursor-pointer ${
                theme === 'LIGHT'
                  ? 'bg-white/80 hover:bg-white border-stone-200 shadow-xs'
                  : 'bg-white/5 hover:bg-white/10 border-white/10'
              }`}
            >
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="w-12 h-12 rounded-xl object-cover mb-2 border border-stone-500/20"
                referrerPolicy="no-referrer"
              />
              <span className={`text-[11px] font-semibold text-center line-clamp-1 ${textColorPrimary}`}>
                {cat.name}
              </span>
              <span className="text-[9px] text-stone-400 capitalize">{cat.category}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 2. Popular Food Near You */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500" />
            <h2 className={`text-lg font-bold font-display ${textColorPrimary}`}>
              Popular Food Near You
            </h2>
          </div>
          <button
            onClick={() => onSelectCategory('food')}
            className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
          >
            See All Food <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4">
          {popularFood.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} onOpenDetail={onOpenProductDetail} />
          ))}
        </div>
      </section>

      {/* 3. Trending Restaurants */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            <h2 className={`text-lg font-bold font-display ${textColorPrimary}`}>
              Trending Restaurants
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trendingRestaurants.map((res, i) => (
            <div
              key={i}
              onClick={() => onSelectCategory('food')}
              className={`p-3.5 rounded-2xl border transition-all hover:scale-[1.02] cursor-pointer ${
                theme === 'LIGHT'
                  ? 'bg-white border-stone-200 shadow-xs'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-3">
                <img
                  src={res.imageUrl}
                  alt={res.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-bold">
                  {res.tag}
                </span>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-semibold backdrop-blur-xs">
                  {res.deliveryTime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <h3 className={`font-bold text-sm truncate ${textColorPrimary}`}>{res.name}</h3>
                <span className="text-xs font-bold text-amber-500">{res.rating} ★</span>
              </div>
              <p className="text-xs text-stone-400 truncate mt-0.5">{res.cuisine}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Food Deals & 5. Today's Grocery Deals (Dual Grid) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Food Deals */}
        <div
          className={`p-5 rounded-3xl border ${
            theme === 'LIGHT'
              ? 'bg-rose-50/60 border-rose-200'
              : 'bg-red-950/20 border-red-500/20'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-red-500" />
              <h3 className={`font-bold font-display text-base ${textColorPrimary}`}>
                Exclusive Food Deals
              </h3>
            </div>
            <button
              onClick={() => onSelectCategory('food')}
              className="text-xs font-bold text-red-500 hover:underline"
            >
              View More
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {foodDeals.slice(0, 2).map((p) => (
              <ProductCard key={p.id} product={p} onOpenDetail={onOpenProductDetail} />
            ))}
          </div>
        </div>

        {/* Grocery Deals */}
        <div
          className={`p-5 rounded-3xl border ${
            theme === 'LIGHT'
              ? 'bg-emerald-50/60 border-emerald-200'
              : 'bg-emerald-950/20 border-emerald-500/20'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-emerald-500" />
              <h3 className={`font-bold font-display text-base ${textColorPrimary}`}>
                Today's Grocery Deals
              </h3>
            </div>
            <button
              onClick={() => onSelectCategory('grocery')}
              className="text-xs font-bold text-emerald-500 hover:underline"
            >
              View More
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {groceryDeals.slice(0, 2).map((p) => (
              <ProductCard key={p.id} product={p} onOpenDetail={onOpenProductDetail} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Fresh Fruits */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Apple className="w-5 h-5 text-red-500" />
            <h2 className={`text-lg font-bold font-display ${textColorPrimary}`}>
              Fresh Orchard Fruits
            </h2>
          </div>
          <button
            onClick={() => onSelectCategory('grocery')}
            className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-1"
          >
            All Fruits <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4">
          {freshFruits.map((p) => (
            <ProductCard key={p.id} product={p} onOpenDetail={onOpenProductDetail} />
          ))}
        </div>
      </section>

      {/* 7. Fresh Vegetables */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Carrot className="w-5 h-5 text-orange-500" />
            <h2 className={`text-lg font-bold font-display ${textColorPrimary}`}>
              Farm Fresh Vegetables
            </h2>
          </div>
          <button
            onClick={() => onSelectCategory('grocery')}
            className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-1"
          >
            All Vegetables <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4">
          {freshVegetables.map((p) => (
            <ProductCard key={p.id} product={p} onOpenDetail={onOpenProductDetail} />
          ))}
        </div>
      </section>

      {/* 8. Daily Essentials */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-amber-500" />
            <h2 className={`text-lg font-bold font-display ${textColorPrimary}`}>
              Daily Kitchen Essentials
            </h2>
          </div>
          <button
            onClick={() => onSelectCategory('grocery')}
            className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-1"
          >
            Stock Pantry <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4">
          {dailyEssentials.map((p) => (
            <ProductCard key={p.id} product={p} onOpenDetail={onOpenProductDetail} />
          ))}
        </div>
      </section>

      {/* 9. Best Sellers */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className={`text-lg font-bold font-display ${textColorPrimary}`}>
              Best Sellers on GRAVVY
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4">
          {bestSellers.map((p) => (
            <ProductCard key={p.id} product={p} onOpenDetail={onOpenProductDetail} />
          ))}
        </div>
      </section>

      {/* 10. Budget-Friendly Products (Under ₹200) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <h2 className={`text-lg font-bold font-display ${textColorPrimary}`}>
              Budget-Friendly Products (Under ₹200)
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4">
          {budgetFriendly.map((p) => (
            <ProductCard key={p.id} product={p} onOpenDetail={onOpenProductDetail} />
          ))}
        </div>
      </section>

      {/* 11. Trending Products & 12. Recommended for You */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            <h2 className={`text-lg font-bold font-display ${textColorPrimary}`}>
              Recommended For You
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4">
          {recommendedForYou.map((p) => (
            <ProductCard key={p.id} product={p} onOpenDetail={onOpenProductDetail} />
          ))}
        </div>
      </section>

      {/* 13. Recently Viewed */}
      <section>
        <h2 className={`text-lg font-bold font-display mb-4 ${textColorPrimary}`}>
          Recently Viewed
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4">
          {recentlyViewed.map((p) => (
            <ProductCard key={p.id} product={p} onOpenDetail={onOpenProductDetail} />
          ))}
        </div>
      </section>

      {/* 14. More Food & 15. More Grocery */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* More Food Callout */}
        <div
          onClick={() => onSelectCategory('food')}
          className="p-6 rounded-3xl bg-gradient-to-r from-red-600 to-rose-700 text-white cursor-pointer shadow-xl hover:scale-[1.01] transition-transform"
        >
          <UtensilsCrossed className="w-8 h-8 text-amber-300 mb-3" />
          <h3 className="text-xl font-black font-display">Craving More Food?</h3>
          <p className="text-xs text-rose-100 mt-1 max-w-sm">
            Explore 100+ restaurants offering hot Biryani, Woodfired Pizza, Momos, Rolls and Thalis.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold bg-white text-stone-950 px-4 py-2 rounded-xl w-fit">
            <span>Explore Full Food Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* More Grocery Callout */}
        <div
          onClick={() => onSelectCategory('grocery')}
          className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-green-700 text-white cursor-pointer shadow-xl hover:scale-[1.01] transition-transform"
        >
          <ShoppingBag className="w-8 h-8 text-yellow-300 mb-3" />
          <h3 className="text-xl font-black font-display">Need More Groceries?</h3>
          <p className="text-xs text-emerald-100 mt-1 max-w-sm">
            Fresh vegetables, fruits, dairy, snacks, cold-pressed oils, and cleaning supplies.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold bg-white text-stone-950 px-4 py-2 rounded-xl w-fit">
            <span>Explore Full Grocery Mart</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </section>
    </div>
  );
};

export const HomePage = React.memo(HomePageComponent);
