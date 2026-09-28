import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  ShieldCheck,
  Check,
  Plus,
  Minus,
  Heart,
  Share2,
  Sparkles,
  Zap,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { Product, Review, ProductVariant } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_REVIEWS } from '../../data/products';
import { ProductCard } from '../common/ProductCard';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onBack: () => void;
  onSelectProduct: (p: Product) => void;
  onProceedToCheckout: () => void;
  onOpenReviewModal?: (productId: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onBack,
  onSelectProduct,
  onProceedToCheckout,
  onOpenReviewModal,
}) => {
  const {
    theme,
    categoryAccent,
    textColorPrimary,
    textColorSecondary,
    textColorMuted,
  } = useTheme();

  const { addToCart, isWishlisted, toggleWishlist, cartItems } = useCart();
  const { isAuthenticated, setIsAuthModalOpen } = useAuth();

  // EXACTLY 2 IMAGES for any product:
  // Image 1: Primary / Normal front view of the exact product
  // Image 2: Zoomed view / framing of the exact same product
  const productImages = React.useMemo<[string, string]>(() => {
    const rawImages = product.images || [];
    const img1 =
      rawImages[0] ||
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&auto=format&fit=crop&q=85';
    let img2 = rawImages[1];

    if (!img2 || img2 === img1) {
      if (img1.includes('unsplash.com')) {
        img2 = `${img1}&crop=focalpoint&fp-x=0.5&fp-y=0.5&fp-z=2.2`;
      } else {
        img2 = img1;
      }
    }
    return [img1, img2];
  }, [product.images]);

  // Gallery active index: strictly 0 or 1
  const [activeImageIndex, setActiveImageIndex] = useState<0 | 1>(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [customInstructions, setCustomInstructions] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'reviews'>('details');
  const [showShareToast, setShowShareToast] = useState(false);
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Reviews state for this product
  const [reviews, setReviews] = useState<Review[]>(() => {
    return INITIAL_REVIEWS.filter((r) => r.productId === product.id);
  });

  // Reset gallery and form when product changes
  useEffect(() => {
    setActiveImageIndex(0);
    setQuantity(1);
    setCustomInstructions('');
    if (product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(undefined);
    }
    setReviews(INITIAL_REVIEWS.filter((r) => r.productId === product.id));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [product.id]);

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const originalPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;
  const discountPercent =
    originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : product.discountPercent;

  const isInWishlist = isWishlisted(product.id);
  const existingCartItem = cartItems.find((ci) => ci.product.id === product.id);

  // Touch handlers for horizontal swiping between Image 1 and Image 2
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 40) {
      // Swiped right to left -> Switch to Image 2 (Zoomed)
      setActiveImageIndex(1);
    } else if (diff < -40) {
      // Swiped left to right -> Switch to Image 1 (Normal)
      setActiveImageIndex(0);
    }
  };

  const toggleImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? 1 : 0));
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant, customInstructions);
    setIsAddedFeedback(true);
    setTimeout(() => setIsAddedFeedback(false), 1800);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    addToCart(product, quantity, selectedVariant, customInstructions);
    onProceedToCheckout();
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on GRAVVY!`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2000);
      }
    } catch {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  };

  // Similar & Recommended Products
  const similarProducts = allProducts
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.subCategory === product.subCategory || p.category === product.category)
    )
    .slice(0, 4);

  return (
    <div className="w-full space-y-6 pb-32 sm:pb-28 animate-in fade-in duration-200">
      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed top-6 right-6 z-50 p-3 rounded-2xl bg-stone-900 border border-amber-400/40 text-amber-400 text-xs font-bold shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4" /> Link copied to clipboard!
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. LARGE PRODUCT IMAGE WITH OVERLAID CONTROLS (NO SEPARATE HEADER) */}
      {/* ============================================================ */}
      <div className="w-full max-w-4xl mx-auto">
        <div
          className={`relative w-full rounded-3xl overflow-hidden border shadow-xl backdrop-blur-md transition-all ${
            theme === 'LIGHT'
              ? 'bg-stone-100/90 border-stone-200/90 shadow-stone-200/50'
              : theme === 'DARK'
              ? 'bg-neutral-900/90 border-neutral-800'
              : 'bg-black/70 border-white/15'
          }`}
        >
          {/* Main Visual Display Area */}
          <div
            className="relative w-full aspect-[4/3] xs:aspect-[16/11] sm:aspect-[16/10] md:h-[460px] max-h-[520px] flex items-center justify-center overflow-hidden cursor-pointer select-none group"
            onClick={toggleImage}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            title={activeImageIndex === 0 ? 'Click to view zoomed image' : 'Click to view normal image'}
          >
            {/* The Active Product Image (ONE large product image at a time) */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={activeImageIndex}
                src={productImages[activeImageIndex]}
                alt={`${product.name} - ${activeImageIndex === 0 ? 'Normal view' : 'Zoomed view'}`}
                initial={{ opacity: 0.85, scale: activeImageIndex === 1 ? 1.05 : 0.98 }}
                animate={{ opacity: 1, scale: activeImageIndex === 1 ? 1.15 : 1 }}
                exit={{ opacity: 0.85, scale: 0.98 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>

            {/* Overlaid Controls: Directly over product image (Top-left & Top-right) */}
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between pointer-events-none z-20">
              {/* Top-Left: ← Back */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBack();
                }}
                className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/85 active:scale-95 text-white backdrop-blur-md border border-white/20 shadow-lg text-xs sm:text-sm font-bold transition-all cursor-pointer"
                title="Back to previous page"
                aria-label="Back"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              {/* Top-Right: ♡ Wishlist & Share */}
              <div className="pointer-events-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border transition-all cursor-pointer active:scale-95 shadow-lg ${
                    isInWishlist
                      ? 'bg-rose-600/90 hover:bg-rose-600 border-rose-500 text-white'
                      : 'bg-black/60 hover:bg-black/85 border-white/20 text-white hover:text-rose-400'
                  }`}
                  title={isInWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current text-white' : ''}`} />
                  <span className="text-xs font-bold hidden xs:inline">
                    {isInWishlist ? 'Saved' : 'Wishlist'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare();
                  }}
                  className="p-2 rounded-full bg-black/60 hover:bg-black/85 active:scale-95 text-white backdrop-blur-md border border-white/20 shadow-lg transition-all cursor-pointer flex items-center justify-center"
                  title="Share this product"
                  aria-label="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Previous / Next Arrow Chevrons (Desktop & Tablet convenience) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIndex(0);
              }}
              className={`absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/85 transition-all opacity-80 hover:opacity-100 z-10 backdrop-blur-md border border-white/15 shadow-lg cursor-pointer ${
                activeImageIndex === 0 ? 'hidden' : 'flex'
              }`}
              title="Switch to Normal view"
              aria-label="Previous view"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIndex(1);
              }}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/85 transition-all opacity-80 hover:opacity-100 z-10 backdrop-blur-md border border-white/15 shadow-lg cursor-pointer ${
                activeImageIndex === 1 ? 'hidden' : 'flex'
              }`}
              title="Switch to Zoomed view"
              aria-label="Next view"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Subtle Indicator Dots (● ○) at Bottom Center */}
            <div
              className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/15 z-20 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActiveImageIndex(0)}
                className={`transition-all duration-300 cursor-pointer ${
                  activeImageIndex === 0
                    ? 'w-5 sm:w-6 h-2 rounded-full bg-amber-400 shadow-sm'
                    : 'w-2 h-2 rounded-full bg-white/40 hover:bg-white/70'
                }`}
                title="View 1: Normal View"
                aria-label="Image 1 - Normal view"
              />
              <button
                type="button"
                onClick={() => setActiveImageIndex(1)}
                className={`transition-all duration-300 cursor-pointer ${
                  activeImageIndex === 1
                    ? 'w-5 sm:w-6 h-2 rounded-full bg-amber-400 shadow-sm'
                    : 'w-2 h-2 rounded-full bg-white/40 hover:bg-white/70'
                }`}
                title="View 2: Zoomed View"
                aria-label="Image 2 - Zoomed view"
              />
              <span className="text-[10px] font-mono font-bold text-white/90 pl-1.5 border-l border-white/20 select-none">
                {activeImageIndex === 0 ? '1/2 Normal' : '2/2 Zoomed'}
              </span>
            </div>

            {/* Veg / Non-Veg Indicator Badge */}
            {product.veg !== undefined && product.veg !== null && (
              <div
                className={`absolute bottom-3 left-3 sm:bottom-4 sm:left-4 w-5 h-5 rounded-md border flex items-center justify-center bg-white shadow-md z-10 ${
                  product.veg ? 'border-emerald-600' : 'border-rose-600'
                }`}
                title={product.veg ? 'Pure Veg' : 'Non-Veg'}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    product.veg ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. FLIPKART-STYLE SMALL IMAGE THUMBNAILS (EXACTLY 2 THUMBNAILS) */}
      {/* Placed BELOW THE LARGE PRODUCT IMAGE but BEFORE the product name */}
      {/* ============================================================ */}
      <div className="w-full max-w-4xl mx-auto px-1">
        <div className="flex items-center gap-3">
          {productImages.map((imgUrl, idx) => {
            const isSelected = activeImageIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx as 0 | 1)}
                className={`relative w-16 h-16 xs:w-18 xs:h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-lg scale-105 opacity-100'
                    : theme === 'LIGHT'
                    ? 'border-stone-300/80 hover:border-stone-400 opacity-70 hover:opacity-100 bg-stone-100/90'
                    : 'border-white/15 hover:border-white/30 opacity-70 hover:opacity-100 bg-white/5'
                }`}
                title={idx === 0 ? 'View 1: Front / Primary' : 'View 2: Zoomed / Detail'}
                aria-label={`Thumbnail ${idx + 1}`}
              >
                <img
                  src={imgUrl}
                  alt={`${product.name} thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-amber-400/10 pointer-events-none" />
                )}
                <span className="absolute bottom-1 right-1 text-[9px] font-bold font-mono px-1 rounded bg-black/75 text-white leading-none">
                  {idx === 0 ? '1' : '2'}
                </span>
              </button>
            );
          })}
          <div className="text-xs text-stone-400 pl-1">
            <span className={`font-bold block ${textColorPrimary}`}>
              {activeImageIndex === 0 ? 'Front / Primary View' : 'Zoomed / Detail View'}
            </span>
            <span className="text-[11px] text-stone-400">
              Tap thumbnail or swipe image
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. PRODUCT DETAILS, PRICE, VARIANTS, ACTIONS */}
      {/* ============================================================ */}
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div
          className={`p-5 sm:p-7 rounded-3xl border shadow-xl backdrop-blur-md space-y-5 transition-all ${
            theme === 'LIGHT'
              ? 'bg-white/95 border-stone-200'
              : theme === 'DARK'
              ? 'bg-neutral-900/90 border-neutral-800'
              : 'bg-black/60 border-white/15'
          }`}
        >
          {/* Header & Badges */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">
                {product.restaurantOrBrand}
              </span>
              <span>·</span>
              <span className="text-xs text-stone-400 capitalize">{product.subCategory}</span>
              {product.trending && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Trending
                </span>
              )}
              {product.bestSeller && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Best Seller
                </span>
              )}
            </div>

            {/* Product Name */}
            <h1
              className={`text-2xl sm:text-3xl font-black font-display tracking-tight leading-tight ${textColorPrimary}`}
            >
              {product.name}
            </h1>

            {/* Rating / Reviews & Delivery Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-400/15 text-amber-400 font-bold border border-amber-400/25">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{product.rating}</span>
                <span className="text-stone-400 font-normal">
                  ({product.ratingCount} reviews)
                </span>
              </div>

              <div className="flex items-center gap-1 text-stone-400 font-medium">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Delivered in {product.deliveryTimeMinutes}</span>
              </div>

              <span
                className={`font-bold ${
                  product.inStock ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {product.inStock ? '● In Stock' : '✕ Out of Stock'}
              </span>
            </div>
          </div>

          {/* Price & Discount */}
          <div className="pt-2 border-t border-stone-500/15 flex flex-wrap items-baseline gap-3">
            <span
              className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${textColorPrimary}`}
            >
              ₹{currentPrice}
            </span>
            {originalPrice > currentPrice && (
              <span className="text-lg font-mono text-stone-400 line-through">
                ₹{originalPrice}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {discountPercent}% OFF
              </span>
            )}
            <span className="text-[11px] text-stone-400 block w-full">
              Inclusive of all taxes & hygienic packaging
            </span>
          </div>

          {/* Description */}
          <p className={`text-sm sm:text-base leading-relaxed ${textColorSecondary}`}>
            {product.description}
          </p>

          {/* Variants / Options */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-stone-500/15">
              <label className={`text-xs font-bold uppercase tracking-wider block ${textColorMuted}`}>
                Select Option / Portion:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {product.variants.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400 text-stone-950 border-amber-400 shadow-md font-bold'
                          : theme === 'LIGHT'
                          ? 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                          : 'bg-stone-900/60 border-white/10 text-stone-300 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xs block leading-tight truncate">
                        {variant.label}
                      </span>
                      <span className="text-xs font-mono font-bold mt-1 block">
                        ₹{variant.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Stepper & Subtotal */}
          <div className="pt-2 border-t border-stone-500/15 flex flex-wrap items-center justify-between gap-4">
            <div>
              <label className={`text-xs font-bold uppercase tracking-wider block mb-1.5 ${textColorMuted}`}>
                Quantity:
              </label>
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-amber-400 text-stone-950 font-bold text-sm shadow-sm">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-1 hover:bg-stone-950/10 rounded transition-colors active:scale-90 cursor-pointer"
                  title="Decrease quantity"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono font-black min-w-5 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-1 hover:bg-stone-950/10 rounded transition-colors active:scale-90 cursor-pointer"
                  title="Increase quantity"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-stone-400 block">Total for {quantity} item(s)</span>
              <span className="text-xl font-mono font-black text-amber-400">
                ₹{currentPrice * quantity}
              </span>
            </div>
          </div>

          {/* Special Instructions Input */}
          <div>
            <label className={`text-xs font-bold uppercase tracking-wider block mb-1.5 ${textColorMuted}`}>
              Custom Request / Cooking Note (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g. Extra spicy, no onions, leave at door..."
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none transition-all ${
                theme === 'LIGHT'
                  ? 'bg-stone-50 border-stone-200 text-stone-900 focus:border-amber-400'
                  : 'bg-stone-900/80 border-white/15 text-stone-100 focus:border-amber-400'
              }`}
            />
          </div>

          {/* Delivery Information Promises */}
          <div className="pt-2 border-t border-stone-500/15 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-400">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-500/10">
              <Truck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>15-min Express Delivery from dark store</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-500/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Quality & Hygiene Verified</span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. TABS: SPECIFICATIONS & REVIEWS */}
        {/* ============================================================ */}
        <div
          className={`p-5 sm:p-7 rounded-3xl border shadow-xl backdrop-blur-md space-y-6 transition-all ${
            theme === 'LIGHT'
              ? 'bg-white/95 border-stone-200'
              : theme === 'DARK'
              ? 'bg-neutral-900/90 border-neutral-800'
              : 'bg-black/60 border-white/15'
          }`}
        >
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-stone-500/15 pb-3">
            {[
              { id: 'details', label: 'Overview' },
              { id: 'specs', label: 'Specifications' },
              { id: 'reviews', label: `Reviews (${reviews.length})` },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 sm:px-5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-stone-950 shadow-md'
                      : theme === 'LIGHT'
                      ? 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                      : 'text-stone-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'details' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <p className={`text-sm sm:text-base leading-relaxed ${textColorSecondary}`}>
                {product.description}
              </p>
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-xs text-stone-400 font-bold">Tags:</span>
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-2.5 py-0.5 rounded-full bg-stone-500/10 text-stone-300 border border-stone-500/20"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Specifications */}
          {activeTab === 'specs' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(product.specifications || {}).map(([key, val]) => (
                  <div
                    key={key}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-4 ${
                      theme === 'LIGHT'
                        ? 'bg-stone-50 border-stone-200'
                        : 'bg-black/30 border-white/10'
                    }`}
                  >
                    <span className="text-xs text-stone-400 font-medium">{key}</span>
                    <span className={`text-xs font-bold text-right ${textColorPrimary}`}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Customer Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-amber-400/10 border border-amber-400/20">
                <div className="flex items-center gap-3">
                  <div className="text-3xl sm:text-4xl font-black font-mono text-amber-400">
                    {product.rating}
                  </div>
                  <div>
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= Math.round(product.rating) ? 'fill-current' : 'text-stone-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-stone-400">
                      Based on {product.ratingCount} verified ratings
                    </span>
                  </div>
                </div>

                {onOpenReviewModal && (
                  <button
                    type="button"
                    onClick={() => onOpenReviewModal(product.id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 text-stone-950 hover:bg-amber-300 transition-colors shadow-md cursor-pointer"
                  >
                    + Write a Review
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className={`p-4 rounded-2xl border space-y-2.5 ${
                      theme === 'LIGHT'
                        ? 'bg-stone-50/80 border-stone-200/80'
                        : 'bg-stone-900/40 border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${textColorPrimary}`}>
                          {rev.userName}
                        </span>
                        {rev.verifiedPurchase && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/20">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-400">{rev.date}</span>
                    </div>

                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? 'fill-current' : 'text-stone-600'
                          }`}
                        />
                      ))}
                    </div>

                    <p className={`text-xs sm:text-sm ${textColorSecondary}`}>{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* 4. SIMILAR PRODUCTS / RECOMMENDED FOR YOU */}
        {/* ============================================================ */}
        {similarProducts.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2
                  className={`text-lg sm:text-xl font-black font-display tracking-tight ${textColorPrimary}`}
                >
                  Recommended for You
                </h2>
                <p className="text-xs text-stone-400">
                  Customers who viewed {product.name} also liked these
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4">
              {similarProducts.map((simProd) => (
                <ProductCard
                  key={simProd.id}
                  product={simProd}
                  onOpenDetail={(p: Product) => {
                    onSelectProduct(p);
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 5. DEDICATED FIXED BOTTOM PURCHASE ACTION BAR (FLIPKART STYLE) */}
      {/* ============================================================ */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-2.5 sm:px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 flex justify-center pointer-events-none select-none">
        <div
          className={`pointer-events-auto w-full max-w-xl mx-auto rounded-2xl sm:rounded-3xl border backdrop-blur-2xl shadow-2xl p-2 sm:p-2.5 flex items-center gap-2 sm:gap-3 transition-all ${
            theme === 'LIGHT'
              ? 'bg-white/95 border-stone-200/90 shadow-[0_-8px_30px_rgba(0,0,0,0.1)]'
              : theme === 'DARK'
              ? 'bg-neutral-900/95 border-neutral-800 shadow-[0_-8px_30px_rgba(0,0,0,0.5)]'
              : 'bg-black/85 border-white/20 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]'
          }`}
        >
          {/* Add to Cart Button (LEFT) */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`flex-1 py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-md cursor-pointer active:scale-95 ${
              !product.inStock
                ? 'opacity-40 cursor-not-allowed bg-stone-500/20 text-stone-400'
                : isAddedFeedback
                ? 'bg-emerald-600 text-white'
                : theme === 'LIGHT'
                ? 'bg-stone-900 text-white hover:bg-stone-800'
                : 'bg-white text-stone-950 hover:bg-stone-200'
            }`}
          >
            {isAddedFeedback ? (
              <>
                <Check className="w-4 h-4 text-white shrink-0" />
                <span className="truncate">Added!</span>
              </>
            ) : existingCartItem ? (
              <>
                <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
                <span className="truncate">In Bag ({existingCartItem.quantity}) · Add</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 shrink-0" />
                <span className="truncate">Add to Cart</span>
              </>
            )}
          </button>

          {/* Buy Now Button (RIGHT) */}
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!product.inStock}
            className={`flex-1 py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg hover:brightness-110 active:scale-95 cursor-pointer ${
              !product.inStock
                ? 'opacity-40 cursor-not-allowed bg-stone-500/20 text-stone-400'
                : categoryAccent.bgClass
            }`}
          >
            <Zap className="w-4 h-4 shrink-0 text-stone-950" />
            <span className="truncate text-stone-950 font-black">
              Buy Now · ₹{currentPrice * quantity}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
