import React, { useState } from 'react';
import {
  X,
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
  FileText,
  AlertCircle,
  ThumbsUp,
} from 'lucide-react';
import { Product, Review, ProductVariant } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { INITIAL_REVIEWS } from '../../data/products';

interface ProductDetailModalProps {
  product: Product | null;
  allProducts: Product[];
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
  onOpenCheckoutDirectly?: () => void;
  onOpenReviewModal?: (productId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  allProducts,
  onClose,
  onSelectProduct,
  onOpenCheckoutDirectly,
  onOpenReviewModal,
}) => {
  const { theme, categoryAccent, textColorPrimary, textColorSecondary, textColorMuted } = useTheme();
  const { addToCart, isWishlisted, toggleWishlist } = useCart();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [customInstructions, setCustomInstructions] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'reviews'>('details');

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>(() => {
    return INITIAL_REVIEWS.filter((r) => r.productId === product?.id);
  });

  // Reset image on product change
  React.useEffect(() => {
    setActiveImageIndex(0);
    setQuantity(1);
    setCustomInstructions('');
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(undefined);
    }
  }, [product]);

  if (!product) return null;

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentOriginalPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;
  const isInWishlist = isWishlisted(product.id);

  // Recommendations
  const similarProducts = allProducts
    .filter((p) => p.id !== product.id && p.subCategory === product.subCategory)
    .slice(0, 4);

  const moreFromCategory = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category && p.subCategory !== product.subCategory)
    .slice(0, 4);

  const frequentlyBoughtTogether = allProducts
    .filter((p) => p.id !== product.id && (p.category === 'grocery' || p.category === 'food'))
    .slice(0, 3);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : product.images.length - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev < product.images.length - 1 ? prev + 1 : 0));
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant, customInstructions);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariant, customInstructions);
    onClose();
    if (onOpenCheckoutDirectly) {
      onOpenCheckoutDirectly();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden relative ${
          theme === 'LIGHT'
            ? 'bg-white border-stone-200'
            : theme === 'DARK'
            ? 'bg-neutral-900 border-neutral-800'
            : 'bg-stone-900 border-white/20'
        }`}
      >
        {/* Top Header Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-500/15">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              {product.category}
            </span>
            <span className="text-stone-400">·</span>
            <span className={`text-xs font-semibold ${textColorMuted}`}>
              {product.restaurantOrBrand}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`p-2 rounded-full border transition-colors ${
                isInWishlist
                  ? 'bg-rose-500 border-rose-500 text-white'
                  : 'border-stone-500/20 text-stone-400 hover:text-white'
              }`}
              title="Add to Wishlist"
            >
              <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full border border-stone-500/20 text-stone-400 hover:text-white hover:bg-white/10"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8">
          {/* Main Grid: Left Gallery + Right Purchase Module */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
            {/* FOUR-IMAGE HORIZONTALLY SWIPEABLE GALLERY */}
            <div className="space-y-3">
              {/* Large Main Display Image */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/20 border border-stone-500/20 group">
                <img
                  src={product.images[activeImageIndex]}
                  alt={`${product.name} - View ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover transition-all duration-300"
                  referrerPolicy="no-referrer"
                />

                {/* Left / Right Nav Arrows */}
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all opacity-80 hover:opacity-100"
                  title="Previous photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all opacity-80 hover:opacity-100"
                  title="Next photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Counter Badge */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/70 text-[11px] font-bold text-white backdrop-blur-xs">
                  {activeImageIndex + 1} / {product.images.length} Photos
                </div>

                {/* Veg / Non-veg indicator */}
                {product.veg !== undefined && product.veg !== null && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs flex items-center gap-1.5 text-xs text-white">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        product.veg ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                    />
                    <span>{product.veg ? 'Pure Veg' : 'Non-Veg'}</span>
                  </div>
                )}
              </div>

              {/* 4 Distinct Thumbnails */}
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImageIndex === index
                        ? 'border-amber-400 scale-95 shadow-md shadow-amber-400/20'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* CONTIGUOUS PURCHASE MODULE (PDP) */}
            <div className="flex flex-col justify-between space-y-5">
              <div>
                <h1 className={`text-xl sm:text-2xl font-bold font-display ${textColorPrimary}`}>
                  {product.name}
                </h1>

                {/* Rating & Reviews row */}
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 text-stone-950 font-bold">
                    <Star className="w-3.5 h-3.5 fill-stone-950" />
                    <span>{product.rating}</span>
                  </div>
                  <span className="text-stone-400 font-medium">
                    {product.ratingCount} verified ratings
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                    <Clock className="w-3.5 h-3.5" /> {product.deliveryTimeMinutes} delivery
                  </span>
                </div>

                {/* Price Display */}
                <div className="mt-4 flex items-baseline gap-2.5">
                  <span className={`text-3xl font-extrabold font-mono tabular-nums ${textColorPrimary}`}>
                    ₹{currentPrice}
                  </span>
                  {currentOriginalPrice > currentPrice && (
                    <span className="text-base text-stone-400 line-through font-mono tabular-nums">
                      ₹{currentOriginalPrice}
                    </span>
                  )}
                  {product.discountPercent > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Save {product.discountPercent}%
                    </span>
                  )}
                </div>

                {/* Prescription Notice for Medicine */}
                {product.prescriptionRequired && (
                  <div className="mt-3 p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-start gap-2.5 text-xs text-sky-300">
                    <FileText className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Prescription Required:</span> A licensed pharmacist
                      will verify your doctor's prescription before dispatch.
                    </div>
                  </div>
                )}

                {/* Product Variants (if any) */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mt-4">
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${textColorMuted}`}>
                      Select Size / Pack
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            selectedVariant?.id === v.id
                              ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                              : 'border-stone-500/20 text-stone-400 hover:border-stone-500/40'
                          }`}
                        >
                          {v.label} - ₹{v.price}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="mt-5 flex items-center gap-4">
                  <label className={`text-xs font-bold uppercase tracking-wider ${textColorMuted}`}>
                    Quantity
                  </label>
                  <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-stone-500/20 bg-black/20">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-1 text-stone-400 hover:text-white"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className={`text-sm font-bold font-mono tabular-nums ${textColorPrimary}`}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="p-1 text-stone-400 hover:text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-stone-400">
                    Subtotal:{' '}
                    <strong className="text-amber-400 font-mono">₹{currentPrice * quantity}</strong>
                  </span>
                </div>

                {/* Custom instructions input */}
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Add cooking or packing instructions (e.g. Extra spicy, no cutlery)..."
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs border border-stone-500/20 bg-stone-500/10 text-white placeholder:text-stone-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons: Add to Cart + Buy Now */}
              <div className="flex items-center gap-3 pt-4 border-t border-stone-500/15">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-amber-400/50 hover:bg-amber-400/20 text-amber-400 flex items-center justify-center gap-2`}
                >
                  <Plus className="w-4 h-4" /> Add To Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${categoryAccent.bgClass} flex items-center justify-center gap-2 shadow-lg`}
                >
                  Buy Now · ₹{currentPrice * quantity}
                </button>
              </div>
            </div>
          </div>

          {/* Description & Specifications Tabs */}
          <div className="border-t border-stone-500/15 pt-6">
            <div className="flex items-center gap-4 border-b border-stone-500/15 pb-2">
              {(['details', 'specs', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === tab
                      ? `${categoryAccent.borderClass} ${categoryAccent.textClass}`
                      : 'border-transparent text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {tab === 'details'
                    ? 'Description'
                    : tab === 'specs'
                    ? 'Product Details'
                    : `Customer Reviews (${reviews.length})`}
                </button>
              ))}
            </div>

            {/* Tab 1: Description */}
            {activeTab === 'details' && (
              <div className="py-4">
                <p className={`text-sm leading-relaxed ${textColorSecondary}`}>
                  {product.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-stone-400">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Safe & Hygienic Packaging</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Instant delivery in {product.deliveryTimeMinutes}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Specifications */}
            {activeTab === 'specs' && (
              <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-3 rounded-xl bg-stone-500/10 border border-stone-500/10 flex justify-between text-xs"
                  >
                    <span className="text-stone-400 font-medium">{key}</span>
                    <span className={`font-semibold ${textColorPrimary}`}>{val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Customer Reviews */}
            {activeTab === 'reviews' && (
              <div className="py-4 space-y-4">
                {/* Rating breakdown summary */}
                <div className="p-4 rounded-2xl bg-stone-500/10 border border-stone-500/15 flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-extrabold text-amber-400 font-mono">
                      {product.rating} / 5
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5">
                      Based on {product.ratingCount} real verified purchases
                    </div>
                  </div>
                  {onOpenReviewModal && (
                    <button
                      onClick={() => onOpenReviewModal(product.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold ${categoryAccent.bgClass}`}
                    >
                      Write a Review
                    </button>
                  )}
                </div>

                {/* Reviews List */}
                <div className="space-y-3">
                  {reviews.length > 0 ? (
                    reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-xl border border-stone-500/15 bg-black/10 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${textColorPrimary}`}>
                              {rev.userName}
                            </span>
                            {rev.verifiedPurchase && (
                              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-sm">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-stone-400">{rev.date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                        <h4 className={`text-xs font-bold ${textColorPrimary}`}>{rev.title}</h4>
                        <p className="text-xs text-stone-300 leading-relaxed">{rev.comment}</p>
                        <div className="flex items-center gap-1 text-[11px] text-stone-400 pt-1">
                          <ThumbsUp className="w-3 h-3" />
                          <span>Helpful ({rev.helpfulCount})</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-stone-400 text-center py-4">
                      No reviews yet for this product. Be the first to share your thoughts!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* PRODUCT RECOMMENDATIONS */}
          <div className="border-t border-stone-500/15 pt-6 space-y-6">
            {/* Similar Products */}
            {similarProducts.length > 0 && (
              <div>
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${textColorPrimary}`}>
                  Similar Products
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {similarProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => onSelectProduct(p)}
                      className="p-2.5 rounded-xl border border-stone-500/15 bg-black/10 hover:border-amber-400/40 cursor-pointer transition-all"
                    >
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full aspect-[4/3] object-cover rounded-lg mb-2"
                        referrerPolicy="no-referrer"
                      />
                      <h4 className={`text-xs font-semibold truncate ${textColorPrimary}`}>{p.name}</h4>
                      <div className="flex items-center justify-between mt-1 text-xs">
                        <span className="font-bold text-amber-400">₹{p.price}</span>
                        <span className="text-[10px] text-stone-400">{p.rating} ★</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Frequently Bought Together */}
            {frequentlyBoughtTogether.length > 0 && (
              <div>
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${textColorPrimary}`}>
                  Frequently Bought Together
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {frequentlyBoughtTogether.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => onSelectProduct(p)}
                      className="p-3 rounded-xl border border-stone-500/15 bg-black/10 flex items-center gap-3 cursor-pointer hover:border-white/20"
                    >
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-12 h-12 rounded-lg object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-xs font-semibold truncate ${textColorPrimary}`}>{p.name}</h4>
                        <div className="text-xs font-bold text-amber-400">₹{p.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
