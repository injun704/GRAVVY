import React, { useState, useMemo, useCallback } from 'react';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Star,
  Clock,
  Sparkles,
  ArrowLeft,
  Check,
  UtensilsCrossed,
  Pill,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { Product } from '../../types';
import { DedicatedPageHeader } from '../common/DedicatedPageHeader';

interface WishlistCardProps {
  product: Product;
  theme: string;
  categoryAccent: { bgClass: string; textClass: string };
  textColorPrimary: string;
  isAdded: boolean;
  onOpenDetail: (product: Product) => void;
  onRemove: (productId: string) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
}

const WishlistCard = React.memo<WishlistCardProps>(
  ({
    product,
    theme,
    categoryAccent,
    textColorPrimary,
    isAdded,
    onOpenDetail,
    onRemove,
    onAddToCart,
  }) => {
    return (
      <div
        onClick={() => onOpenDetail(product)}
        className={`group flex flex-col sm:flex-row rounded-3xl border overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-xl ${
          theme === 'LIGHT'
            ? 'bg-white border-stone-200 shadow-xs'
            : 'bg-stone-900/40 border-white/10 hover:border-white/20'
        }`}
      >
        {/* Product Image */}
        <div className="relative aspect-[4/3] sm:aspect-square sm:w-48 overflow-hidden bg-stone-900/10 shrink-0">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />

          {/* Remove from wishlist button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(product.id);
            }}
            className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/60 text-white/80 hover:text-rose-400 hover:bg-black/80 backdrop-blur-md transition-all cursor-pointer"
            title="Remove from wishlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Veg / Non-Veg badge */}
          {product.veg !== undefined && product.veg !== null && (
            <div className="absolute top-2.5 left-2.5">
              <div
                className={`w-4 h-4 rounded-xs border flex items-center justify-center bg-white/95 shadow-xs ${
                  product.veg ? 'border-emerald-600' : 'border-rose-600'
                }`}
                title={product.veg ? 'Pure Veg' : 'Non-Veg'}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    product.veg ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Category Pill */}
          <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
            {product.category}
          </span>
        </div>

        {/* Product Details */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span className="truncate max-w-[150px] font-medium">
                {product.restaurantOrBrand}
              </span>
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-3 h-3 fill-current" />
                <span>{product.rating}</span>
              </div>
            </div>

            <h3
              className={`text-sm sm:text-base font-bold line-clamp-1 leading-snug group-hover:text-amber-500 transition-colors ${textColorPrimary}`}
            >
              {product.name}
            </h3>

            <p className="text-xs text-stone-400 line-clamp-1">
              {product.description}
            </p>
          </div>

          {/* Price & Availability Row */}
          <div className="pt-2 border-t border-stone-500/10 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-base font-black font-mono ${textColorPrimary}`}>
                  ₹{product.price}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-xs font-mono text-stone-400 line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
              </div>
              {/* Availability status */}
              <span
                className={`text-[10px] font-bold block ${
                  product.inStock ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {product.inStock ? '● In Stock' : '✕ Out of Stock'}
              </span>
            </div>

            {/* Quick Add To Cart Button */}
            <button
              type="button"
              disabled={!product.inStock || isAdded}
              onClick={(e) => onAddToCart(product, e)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                isAdded
                  ? 'bg-emerald-500 text-white cursor-default'
                  : !product.inStock
                  ? 'bg-stone-500/20 text-stone-500 cursor-not-allowed'
                  : categoryAccent.bgClass
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap uppercase">Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

interface YourWishViewProps {
  allProducts: Product[];
  onOpenProductDetail: (product: Product) => void;
  onContinueShopping: () => void;
  onNavigateToCart: () => void;
}

const YourWishViewComponent: React.FC<YourWishViewProps> = ({
  allProducts,
  onOpenProductDetail,
  onContinueShopping,
  onNavigateToCart,
}) => {
  const {
    theme,
    categoryAccent,
    setActiveCategory,
    textColorPrimary,
    textColorSecondary,
    textColorMuted,
  } = useTheme();

  const { wishlist, toggleWishlist, addToCart } = useCart();
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  // Resolve product objects for wishlisted IDs with useMemo
  const wishlistedProducts = useMemo(() => {
    return allProducts.filter((p) => wishlist.includes(p.id));
  }, [allProducts, wishlist]);

  const handleAddToCart = useCallback((product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedItemIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  }, [addToCart]);

  const handleMoveAllToCart = useCallback(() => {
    wishlistedProducts.forEach((p) => {
      if (p.inStock) {
        addToCart(p, 1);
      }
    });
    onNavigateToCart();
  }, [wishlistedProducts, addToCart, onNavigateToCart]);

  // Android / browser back navigation handler
  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      onContinueShopping();
    }
  }, [onContinueShopping]);

  return (
    <div className="w-full space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Top Dedicated Header Bar: ← Back Your Wish */}
      <DedicatedPageHeader
        title="Your Wish"
        onBack={handleBack}
        itemCount={wishlistedProducts.length}
        rightAction={
          wishlistedProducts.length > 0 ? (
            <button
              onClick={handleMoveAllToCart}
              className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer min-h-[38px] ${categoryAccent.bgClass}`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Move All to Bag</span>
            </button>
          ) : undefined
        }
        subtitle={
          wishlistedProducts.length > 0
            ? 'Saved products ready to add to your delivery bag anytime'
            : undefined
        }
      />

      {/* Empty State */}
      {wishlistedProducts.length === 0 ? (
        <div className="w-full min-h-[50vh] sm:min-h-[55vh] flex flex-col items-center justify-center py-6 px-3 sm:px-4 animate-in fade-in duration-300">
          <div
            className={`w-full max-w-sm sm:max-w-md p-5 sm:p-7 rounded-2xl sm:rounded-3xl border text-center shadow-lg backdrop-blur-md transition-all ${
              theme === 'LIGHT'
                ? 'bg-white/95 border-stone-200'
                : theme === 'DARK'
                ? 'bg-neutral-900/90 border-neutral-800'
                : 'bg-black/60 border-white/15'
            }`}
          >
            {/* Animated Empty Wishlist Container */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3.5 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-500/25 via-pink-500/20 to-amber-500/20 blur-md sm:blur-lg animate-pulse" />
              <div
                className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border shadow-inner ${
                  theme === 'LIGHT'
                    ? 'bg-rose-50 border-rose-200 text-rose-500'
                    : 'bg-white/5 border-white/10 text-rose-400'
                }`}
              >
                <Heart className="w-7 h-7 sm:w-8 sm:h-8 fill-rose-500/20" strokeWidth={1.75} />
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 absolute top-1.5 right-1.5 text-rose-400 animate-bounce" />
              </div>
            </div>

            <h2 className={`text-base sm:text-lg font-bold font-display tracking-tight ${textColorPrimary}`}>
              Your Wish is empty
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-xs mx-auto leading-normal">
              Start adding products to your wishlist.
            </p>

            {/* Quick Category Jump Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-4">
              <button
                onClick={() => {
                  setActiveCategory('food');
                  onContinueShopping();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <UtensilsCrossed className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Explore Food</span>
              </button>
              <button
                onClick={() => {
                  setActiveCategory('grocery');
                  onContinueShopping();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Explore Groceries</span>
              </button>
              <button
                onClick={() => {
                  setActiveCategory('medicine');
                  onContinueShopping();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold border border-sky-500/30 text-sky-500 hover:bg-sky-500/10 transition-colors cursor-pointer"
              >
                <Pill className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Explore Medicines</span>
              </button>
            </div>

            {/* Prominent Continue Shopping Button */}
            <div className="mt-5">
              <button
                onClick={onContinueShopping}
                className={`w-full py-2.5 sm:py-3 px-5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${categoryAccent.bgClass}`}
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Grid of Wishlist Products */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {wishlistedProducts.map((product) => (
            <WishlistCard
              key={product.id}
              product={product}
              theme={theme}
              categoryAccent={categoryAccent}
              textColorPrimary={textColorPrimary}
              isAdded={!!addedItemIds[product.id]}
              onOpenDetail={onOpenProductDetail}
              onRemove={toggleWishlist}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const YourWishView = React.memo(YourWishViewComponent);
