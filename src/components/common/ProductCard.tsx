import React, { useMemo } from 'react';
import { Star, Plus, Minus, Heart, Clock } from 'lucide-react';
import { Product, CartItem } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
}

interface ProductCardViewProps {
  product: Product;
  cartItem?: CartItem;
  isInWishlist: boolean;
  onOpenDetail: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onToggleWishlist: (productId: string) => void;
  theme: string;
  categoryAccent: { bgClass: string; textClass: string };
  cardBgClass: string;
  textColorPrimary: string;
}

const ProductCardView = React.memo<ProductCardViewProps>(
  ({
    product,
    cartItem,
    isInWishlist,
    onOpenDetail,
    onAddToCart,
    onUpdateQuantity,
    onToggleWishlist,
    theme,
    categoryAccent,
    cardBgClass,
    textColorPrimary,
  }) => {
    return (
      <div
        onClick={() => onOpenDetail(product)}
        className={`group relative flex flex-col rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer box-border transform-gpu cv-auto ${cardBgClass} ${
          theme === 'LIGHT' ? 'border-stone-200 hover:border-stone-300' : 'border-white/10 hover:border-white/20'
        }`}
      >
        {/* Product Image Slot with measured scrim and badges */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-900/10 shrink-0">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out transform-gpu"
          />

          {/* Wishlist toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
              isInWishlist
                ? 'bg-rose-500 text-white'
                : 'bg-black/40 text-white/80 hover:text-white hover:bg-black/60'
            }`}
            title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>

          {/* Top left badges: Veg / Non-Veg & Discount */}
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex items-center gap-1 sm:gap-1.5">
            {product.veg !== undefined && product.veg !== null && (
              <div
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-xs border flex items-center justify-center bg-white/90 shadow-xs ${
                  product.veg ? 'border-emerald-600' : 'border-rose-600'
                }`}
                title={product.veg ? 'Pure Veg' : 'Non-Veg'}
              >
                <div
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                    product.veg ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                />
              </div>
            )}

            {product.discountPercent > 0 && (
              <span className="text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-500 text-stone-950 shadow-xs">
                {product.discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Delivery Time & Unit Weight overlay */}
          <div className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-2 sm:left-2 sm:right-2 flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-white drop-shadow-md">
            <span className="flex items-center gap-1 bg-black/50 px-1.5 sm:px-2 py-0.5 rounded-md backdrop-blur-xs">
              <Clock className="w-3 h-3 text-amber-400 shrink-0" /> {product.deliveryTimeMinutes}
            </span>
            {product.unitWeight && (
              <span className="bg-black/50 px-1.5 sm:px-2 py-0.5 rounded-md backdrop-blur-xs truncate max-w-[70px]">
                {product.unitWeight}
              </span>
            )}
          </div>
        </div>

        {/* Card Content & Metadata */}
        <div className="p-2.5 xs:p-3 sm:p-3.5 flex-1 flex flex-col justify-between min-w-0 box-border">
          <div>
            {/* Brand & Subcategory */}
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-stone-400 mb-1 gap-1 min-w-0">
              <span className="truncate flex-1 min-w-0 font-medium">{product.restaurantOrBrand}</span>
              <div className="flex items-center gap-0.5 sm:gap-1 font-semibold text-amber-500 shrink-0">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                <span className="font-bold">{product.rating}</span>
                <span className="text-stone-400 text-[10px]">({product.ratingCount})</span>
              </div>
            </div>

            {/* Product Name */}
            <h3 className={`font-semibold text-xs sm:text-sm line-clamp-2 leading-snug min-w-0 ${textColorPrimary}`}>
              {product.name}
            </h3>
          </div>

          {/* Bottom Price & Add Action Container */}
          <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-stone-500/10 flex items-center justify-between gap-1.5 min-w-0 box-border">
            {/* Price Container */}
            <div className="min-w-0 flex flex-col xs:flex-row xs:items-baseline gap-0 xs:gap-1.5 leading-none">
              <span className={`text-sm sm:text-base font-black font-mono tabular-nums tracking-tight ${textColorPrimary}`}>
                ₹{product.price}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-[10px] sm:text-xs text-stone-400 line-through font-mono tabular-nums leading-none truncate">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>

            {/* Cart Control Button (Always Contained, Never Clipped) */}
            <div className="shrink-0 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              {cartItem ? (
                <div className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-1 rounded-xl bg-amber-400 text-stone-950 font-black text-xs shadow-xs min-h-[32px] box-border select-none shrink-0">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(cartItem.id, cartItem.quantity - 1)}
                    className="w-5 h-5 flex items-center justify-center hover:opacity-75 active:scale-90 transition-transform cursor-pointer shrink-0 rounded"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <span className="font-mono tabular-nums min-w-[16px] text-center font-black text-xs">
                    {cartItem.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(cartItem.id, cartItem.quantity + 1)}
                    className="w-5 h-5 flex items-center justify-center hover:opacity-75 active:scale-90 transition-transform cursor-pointer shrink-0 rounded"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onAddToCart(product)}
                  className={`inline-flex items-center justify-center gap-1 px-3 py-1 sm:py-1.5 rounded-xl font-black text-[11px] sm:text-xs tracking-wider transition-all shadow-xs shrink-0 whitespace-nowrap box-border min-h-[32px] cursor-pointer hover:brightness-110 active:scale-95 select-none ${
                    categoryAccent.bgClass
                  }`}
                  aria-label={`Add ${product.name} to cart`}
                >
                  <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 stroke-[2.5]" />
                  <span className="inline-block whitespace-nowrap font-black uppercase">ADD</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
  (prev, next) => {
    return (
      prev.product.id === next.product.id &&
      prev.product.price === next.product.price &&
      prev.product.originalPrice === next.product.originalPrice &&
      prev.product.inStock === next.product.inStock &&
      prev.cartItem?.id === next.cartItem?.id &&
      prev.cartItem?.quantity === next.cartItem?.quantity &&
      prev.isInWishlist === next.isInWishlist &&
      prev.theme === next.theme &&
      prev.categoryAccent.bgClass === next.categoryAccent.bgClass &&
      prev.cardBgClass === next.cardBgClass &&
      prev.textColorPrimary === next.textColorPrimary &&
      prev.onOpenDetail === next.onOpenDetail &&
      prev.onAddToCart === next.onAddToCart &&
      prev.onUpdateQuantity === next.onUpdateQuantity &&
      prev.onToggleWishlist === next.onToggleWishlist
    );
  }
);

const ProductCardComponent: React.FC<ProductCardProps> = ({ product, onOpenDetail }) => {
  const { theme, categoryAccent, cardBgClass, textColorPrimary } = useTheme();
  const { cartItems, addToCart, updateQuantity, isWishlisted, toggleWishlist } = useCart();

  const cartItem = useMemo(() => {
    return cartItems.find((ci) => ci.product.id === product.id);
  }, [cartItems, product.id]);

  const isInWishlist = isWishlisted(product.id);

  return (
    <ProductCardView
      product={product}
      cartItem={cartItem}
      isInWishlist={isInWishlist}
      onOpenDetail={onOpenDetail}
      onAddToCart={addToCart}
      onUpdateQuantity={updateQuantity}
      onToggleWishlist={toggleWishlist}
      theme={theme}
      categoryAccent={categoryAccent}
      cardBgClass={cardBgClass}
      textColorPrimary={textColorPrimary}
    />
  );
};

export const ProductCard = React.memo(ProductCardComponent);
