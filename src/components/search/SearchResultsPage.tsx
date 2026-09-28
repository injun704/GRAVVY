import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Search,
  X,
  Mic,
  SlidersHorizontal,
  Check,
  Star,
  RefreshCw,
  UtensilsCrossed,
  ShoppingBag,
  Pill,
  Flame,
} from 'lucide-react';
import { Product, CategoryTab } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { ProductCard } from '../common/ProductCard';
import { VoiceSearchModal } from '../common/VoiceSearchModal';
import { searchProducts } from '../../utils/searchEngine';

interface SearchResultsPageProps {
  products: Product[];
  initialQuery: string;
  onSelectProduct: (product: Product) => void;
  onBack: () => void;
  onSelectCategory?: (category: CategoryTab) => void;
  onOpenDedicatedSearch?: () => void;
}

const PAGE_SIZE = 12;

const SearchResultsPageComponent: React.FC<SearchResultsPageProps> = ({
  products,
  initialQuery,
  onSelectProduct,
  onBack,
  onSelectCategory,
  onOpenDedicatedSearch,
}) => {
  const { theme, categoryAccent, textColorPrimary, textColorSecondary, textColorMuted, setActiveCategory } = useTheme();

  // Search query states
  const [currentQuery, setCurrentQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Active Applied Filters & Sorting state
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'food' | 'grocery' | 'medicine'>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'popularity' | 'price_low' | 'price_high' | 'rating' | 'discount'>('relevance');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [prescriptionFilter, setPrescriptionFilter] = useState<'all' | 'otc' | 'rx'>('all');
  const [priceRange, setPriceRange] = useState<'all' | 'under200' | 'under500' | 'under1000'>('all');
  const [minRating, setMinRating] = useState<number>(0);

  // Draft filter state (for the bottom sheet before clicking Apply)
  const [tempCategory, setTempCategory] = useState<'all' | 'food' | 'grocery' | 'medicine'>('all');
  const [tempSubCategory, setTempSubCategory] = useState<string>('all');
  const [tempSortBy, setTempSortBy] = useState<'relevance' | 'popularity' | 'price_low' | 'price_high' | 'rating' | 'discount'>('relevance');
  const [tempInStockOnly, setTempInStockOnly] = useState(false);
  const [tempVegFilter, setTempVegFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [tempPrescriptionFilter, setTempPrescriptionFilter] = useState<'all' | 'otc' | 'rx'>('all');
  const [tempPriceRange, setTempPriceRange] = useState<'all' | 'under200' | 'under500' | 'under1000'>('all');
  const [tempMinRating, setTempMinRating] = useState<number>(0);

  // Pagination
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync when initialQuery changes
  useEffect(() => {
    setCurrentQuery(initialQuery);
    setActiveQuery(initialQuery);
    setVisibleCount(PAGE_SIZE);
  }, [initialQuery]);

  // Open filter panel & sync draft state
  const handleOpenFilterPanel = () => {
    setTempCategory(selectedCategory);
    setTempSubCategory(selectedSubCategory);
    setTempSortBy(sortBy);
    setTempInStockOnly(inStockOnly);
    setTempVegFilter(vegFilter);
    setTempPrescriptionFilter(prescriptionFilter);
    setTempPriceRange(priceRange);
    setTempMinRating(minRating);
    setIsFilterPanelOpen(true);
  };

  const handleApplyFilters = () => {
    setSelectedCategory(tempCategory);
    setSelectedSubCategory(tempSubCategory);
    setSortBy(tempSortBy);
    setInStockOnly(tempInStockOnly);
    setVegFilter(tempVegFilter);
    setPrescriptionFilter(tempPrescriptionFilter);
    setPriceRange(tempPriceRange);
    setMinRating(tempMinRating);
    setVisibleCount(PAGE_SIZE);
    setIsFilterPanelOpen(false);
  };

  const handleClearAllFilters = () => {
    setTempCategory('all');
    setTempSubCategory('all');
    setTempSortBy('relevance');
    setTempInStockOnly(false);
    setTempVegFilter('all');
    setTempPrescriptionFilter('all');
    setTempPriceRange('all');
    setTempMinRating(0);

    setSelectedCategory('all');
    setSelectedSubCategory('all');
    setSortBy('relevance');
    setInStockOnly(false);
    setVegFilter('all');
    setPrescriptionFilter('all');
    setPriceRange('all');
    setMinRating(0);
    setVisibleCount(PAGE_SIZE);
    setIsFilterPanelOpen(false);
  };

  // Convert under1000 into price range parameter
  const mappedPriceRange = priceRange === 'under1000' ? ('under500' as const) : priceRange;

  // Execute full product search
  const allMatchingResults = useMemo(() => {
    let list = searchProducts(products, activeQuery, {
      category: selectedCategory,
      subCategory: selectedSubCategory,
      sortBy,
      inStockOnly,
      vegFilter,
      prescriptionFilter,
      priceRange: mappedPriceRange,
      minRating,
    });

    if (priceRange === 'under1000') {
      list = list.filter((p) => p.price <= 1000);
    }

    return list;
  }, [
    products,
    activeQuery,
    selectedCategory,
    selectedSubCategory,
    sortBy,
    inStockOnly,
    vegFilter,
    prescriptionFilter,
    priceRange,
    minRating,
  ]);

  // Available subcategories for the matched items
  const availableSubCategories = useMemo(() => {
    const relevant = searchProducts(products, activeQuery, {
      category: tempCategory === 'all' ? undefined : tempCategory,
    });
    const subCats = new Set<string>();
    relevant.forEach((p) => {
      if (p.subCategory) subCats.add(p.subCategory);
    });
    return Array.from(subCats);
  }, [products, activeQuery, tempCategory]);

  // Visible sliced products for pagination
  const visibleProducts = useMemo(() => {
    return allMatchingResults.slice(0, visibleCount);
  }, [allMatchingResults, visibleCount]);

  const hasMore = visibleCount < allMatchingResults.length;

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + PAGE_SIZE);
      setIsLoadingMore(false);
    }, 300);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentQuery.trim()) return;
    setActiveQuery(currentQuery.trim());
    setVisibleCount(PAGE_SIZE);
    inputRef.current?.blur();
  };

  const handleVoiceSearchSubmit = (spokenText: string) => {
    const clean = spokenText.trim();
    if (!clean) return;
    setCurrentQuery(clean);
    setActiveQuery(clean);
    setVisibleCount(PAGE_SIZE);
    try {
      const raw = localStorage.getItem('gravvy_recent_searches');
      const list: string[] = raw ? JSON.parse(raw) : [];
      const next = [clean, ...list.filter((x) => x.toLowerCase() !== clean.toLowerCase())].slice(0, 5);
      localStorage.setItem('gravvy_recent_searches', JSON.stringify(next));
    } catch {}
    window.history.replaceState({ tab: 'search', q: clean }, '', `?q=${encodeURIComponent(clean)}`);
  };

  // Count active applied filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedSubCategory !== 'all') count++;
    if (sortBy !== 'relevance') count++;
    if (inStockOnly) count++;
    if (vegFilter !== 'all') count++;
    if (prescriptionFilter !== 'all') count++;
    if (priceRange !== 'all') count++;
    if (minRating > 0) count++;
    return count;
  }, [
    selectedCategory,
    selectedSubCategory,
    sortBy,
    inStockOnly,
    vegFilter,
    prescriptionFilter,
    priceRange,
    minRating,
  ]);

  // Popular recommendations if no results
  const popularFallbackProducts = useMemo(() => {
    return products.filter((p) => p.trending || p.bestSeller).slice(0, 8);
  }, [products]);

  return (
    <div className="w-full space-y-3 pb-24 animate-in fade-in duration-200">
      {/* ============================================================ */}
      {/* 1. SEAMLESS TOP HEADER WITH INTEGRATED SEARCH BAR */}
      {/* ============================================================ */}
      <div className="w-full flex items-center gap-2 pt-1 pb-0.5 bg-transparent border-0 border-none shadow-none outline-none select-none">
        {/* Back Button */}
        <button
          onClick={onBack}
          className={`flex items-center gap-1 py-1.5 px-1 text-xs font-semibold transition-colors cursor-pointer bg-transparent border-0 outline-none active:scale-95 shrink-0 ${
            theme === 'LIGHT' ? 'text-stone-700 hover:text-stone-900' : 'text-stone-300 hover:text-white'
          }`}
          title="Go back"
          aria-label="Back to previous page"
        >
          <ArrowLeft className={`w-4 h-4 shrink-0 ${theme === 'LIGHT' ? 'text-stone-700' : 'text-stone-300'}`} />
          <span className="hidden xs:inline text-xs">Back</span>
        </button>

        {/* Integrated Search Input Form */}
        <form
          onSubmit={handleSearchSubmit}
          onClick={() => {
            if (onOpenDedicatedSearch) onOpenDedicatedSearch();
          }}
          className={`flex-1 flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-2xl border transition-all cursor-pointer ${
            theme === 'LIGHT'
              ? 'bg-white/90 border-stone-200/90 focus-within:border-amber-500 shadow-xs'
              : theme === 'DARK'
              ? 'bg-stone-900/80 border-white/15 focus-within:border-amber-400/60'
              : 'bg-stone-950/40 border-white/15 focus-within:border-amber-400/50'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={currentQuery}
            onChange={(e) => setCurrentQuery(e.target.value)}
            onFocus={() => {
              if (onOpenDedicatedSearch) onOpenDedicatedSearch();
            }}
            onClick={(e) => {
              if (onOpenDedicatedSearch) {
                e.preventDefault();
                onOpenDedicatedSearch();
              }
            }}
            placeholder="Search food, grocery, medicine..."
            className={`w-full bg-transparent text-xs sm:text-sm focus:outline-none placeholder:text-stone-400 font-medium ${textColorPrimary} cursor-pointer`}
          />
          {currentQuery && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentQuery('');
                inputRef.current?.focus();
              }}
              className="p-0.5 rounded-full text-stone-400 hover:text-stone-200 cursor-pointer"
              title="Clear text"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <button
            type="submit"
            className="px-2 py-1 rounded-xl text-[11px] font-bold bg-amber-400 text-stone-950 hover:brightness-105 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* ============================================================ */}
      {/* 2. COMPACT TOOLBAR WITH SMALL THREE-LINE FILTER ICON ON THE RIGHT */}
      {/* ============================================================ */}
      <div className="w-full flex items-center justify-between px-1 py-0.5 select-none">
        {/* Subtle Result Item Count */}
        <div className="text-[11px] text-stone-400 font-medium truncate">
          {allMatchingResults.length > 0 ? (
            <span>
              <span className="font-mono font-semibold text-stone-300">{allMatchingResults.length}</span> items
            </span>
          ) : null}
        </div>

        {/* Small Three-Line Filter Icon on the Right */}
        <button
          type="button"
          onClick={handleOpenFilterPanel}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all active:scale-95 cursor-pointer text-xs font-semibold ${
            activeFilterCount > 0
              ? 'bg-amber-400/15 border-amber-400/40 text-amber-400 shadow-xs'
              : theme === 'LIGHT'
              ? 'bg-white/80 hover:bg-stone-100 border-stone-200 text-stone-700'
              : 'bg-white/5 hover:bg-white/10 border-white/10 text-stone-300'
          }`}
          title="Filter and Sort"
          aria-label="Open filter and sort panel"
        >
          {/* Minimal 3 Short Horizontal Lines Icon */}
          <div className="w-3.5 h-3 flex flex-col justify-between items-end py-0.5">
            <span className="w-3.5 h-[1.5px] bg-current rounded-full block" />
            <span className="w-2.5 h-[1.5px] bg-current rounded-full block" />
            <span className="w-1.5 h-[1.5px] bg-current rounded-full block" />
          </div>

          <span className="text-[11px]">Filter</span>

          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-400 text-stone-950 text-[9px] font-mono font-black flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ============================================================ */}
      {/* 3. PRODUCT RESULTS GRID OR EMPTY STATE */}
      {/* ============================================================ */}
      {visibleProducts.length > 0 ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetail={onSelectProduct}
              />
            ))}
          </div>

          {/* Load More Pagination */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-5 py-2 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/15 border border-white/15 text-stone-100 transition-all active:scale-95 cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                {isLoadingMore ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>Loading more...</span>
                  </>
                ) : (
                  <>
                    <span>Load More ({allMatchingResults.length - visibleCount} left)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="w-full space-y-6 py-4">
          <div
            className={`w-full max-w-md mx-auto p-5 sm:p-6 rounded-3xl border text-center space-y-3 backdrop-blur-xl ${
              theme === 'LIGHT'
                ? 'bg-white/80 border-stone-200 shadow-xs'
                : 'bg-stone-900/40 border-white/10 shadow-md'
            }`}
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Search className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className={`text-sm font-bold font-display ${textColorPrimary}`}>
                No products found
              </h2>
              <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                Check spelling, adjust filters, or explore categories below.
              </p>
            </div>

            {/* Quick Category Shortcuts */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              <button
                onClick={() => {
                  setActiveCategory('food');
                  if (onSelectCategory) onSelectCategory('food');
                  onBack();
                }}
                className="px-3 py-1 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1"
              >
                <UtensilsCrossed className="w-3 h-3" />
                <span>Food</span>
              </button>

              <button
                onClick={() => {
                  setActiveCategory('grocery');
                  if (onSelectCategory) onSelectCategory('grocery');
                  onBack();
                }}
                className="px-3 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1"
              >
                <ShoppingBag className="w-3 h-3" />
                <span>Grocery</span>
              </button>

              <button
                onClick={() => {
                  setActiveCategory('medicine');
                  if (onSelectCategory) onSelectCategory('medicine');
                  onBack();
                }}
                className="px-3 py-1 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-400 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1"
              >
                <Pill className="w-3 h-3" />
                <span>Medicine</span>
              </button>
            </div>
          </div>

          {/* Popular Catalog Items */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1 px-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Popular on GRAVVY</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {popularFallbackProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onOpenDetail={onSelectProduct}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. COMPACT FILTER & SORT PANEL (BOTTOM SHEET / MODAL) */}
      {/* ============================================================ */}
      {isFilterPanelOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsFilterPanelOpen(false)}
          />

          {/* Panel Container */}
          <div
            className={`relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden z-10 max-h-[85vh] flex flex-col backdrop-blur-xl animate-in slide-in-from-bottom duration-250 ${
              theme === 'LIGHT'
                ? 'bg-white border-stone-200 text-stone-900'
                : theme === 'DARK'
                ? 'bg-stone-900 border-neutral-800 text-stone-100'
                : 'bg-stone-950 border-white/20 text-stone-100'
            }`}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-stone-500/15 flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-bold tracking-tight">
                  Sort & Filter
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterPanelOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-200 cursor-pointer"
                title="Close filter panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Filter Content */}
            <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh] text-xs">
              {/* SECTION: SORT BY */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Sort By
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    { id: 'relevance', label: 'Relevance' },
                    { id: 'popularity', label: 'Popularity' },
                    { id: 'price_low', label: 'Price: Low to High' },
                    { id: 'price_high', label: 'Price: High to Low' },
                    { id: 'rating', label: 'Rating (High)' },
                    { id: 'discount', label: 'Top Discount' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setTempSortBy(s.id as any)}
                      className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold text-left transition-all cursor-pointer ${
                        tempSortBy === s.id
                          ? 'bg-amber-400/20 text-amber-400 border-amber-400/50 shadow-xs'
                          : theme === 'LIGHT'
                          ? 'bg-stone-100/90 text-stone-700 border-stone-200'
                          : 'bg-white/5 text-stone-300 border-white/10'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION: CATEGORY */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'all', label: 'All Categories' },
                    { id: 'food', label: 'Food' },
                    { id: 'grocery', label: 'Grocery' },
                    { id: 'medicine', label: 'Medicine' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setTempCategory(c.id as any);
                        setTempSubCategory('all');
                      }}
                      className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold text-center transition-all cursor-pointer ${
                        tempCategory === c.id
                          ? 'bg-amber-400/20 text-amber-400 border-amber-400/50 shadow-xs'
                          : theme === 'LIGHT'
                          ? 'bg-stone-100/90 text-stone-700 border-stone-200'
                          : 'bg-white/5 text-stone-300 border-white/10'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION: DIETARY / PRODUCT TYPE */}
              {(tempCategory === 'all' || tempCategory === 'food' || tempCategory === 'grocery') && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                    Dietary
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'veg', label: 'Veg Only' },
                      { id: 'non-veg', label: 'Non-Veg' },
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setTempVegFilter(d.id as any)}
                        className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          tempVegFilter === d.id
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-xs'
                            : theme === 'LIGHT'
                            ? 'bg-stone-100/90 text-stone-700 border-stone-200'
                            : 'bg-white/5 text-stone-300 border-white/10'
                        }`}
                      >
                        {d.id === 'veg' && <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />}
                        {d.id === 'non-veg' && <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />}
                        <span>{d.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: PRICE RANGE */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Price
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'all', label: 'Any Price' },
                    { id: 'under200', label: 'Under ₹200' },
                    { id: 'under500', label: 'Under ₹500' },
                    { id: 'under1000', label: 'Under ₹1000' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setTempPriceRange(p.id as any)}
                      className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold text-center transition-all cursor-pointer ${
                        tempPriceRange === p.id
                          ? 'bg-amber-400/20 text-amber-400 border-amber-400/50 shadow-xs'
                          : theme === 'LIGHT'
                          ? 'bg-stone-100/90 text-stone-700 border-stone-200'
                          : 'bg-white/5 text-stone-300 border-white/10'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION: RATING */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Rating
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { val: 0, label: 'Any Rating' },
                    { val: 4.0, label: '4★ & above' },
                    { val: 3.0, label: '3★ & above' },
                  ].map((r) => (
                    <button
                      key={r.val}
                      type="button"
                      onClick={() => setTempMinRating(r.val)}
                      className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        tempMinRating === r.val
                          ? 'bg-amber-400/20 text-amber-400 border-amber-400/50 shadow-xs'
                          : theme === 'LIGHT'
                          ? 'bg-stone-100/90 text-stone-700 border-stone-200'
                          : 'bg-white/5 text-stone-300 border-white/10'
                      }`}
                    >
                      {r.val > 0 && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION: AVAILABILITY */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Availability
                </label>
                <button
                  type="button"
                  onClick={() => setTempInStockOnly((prev) => !prev)}
                  className={`w-full px-3 py-2 rounded-xl border text-[11px] font-semibold text-left transition-all cursor-pointer flex items-center justify-between ${
                    tempInStockOnly
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                      : theme === 'LIGHT'
                      ? 'bg-stone-100/90 text-stone-700 border-stone-200'
                      : 'bg-white/5 text-stone-300 border-white/10'
                  }`}
                >
                  <span>In Stock Only</span>
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      tempInStockOnly ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-stone-500/40'
                    }`}
                  >
                    {tempInStockOnly && <Check className="w-3 h-3" />}
                  </div>
                </button>
              </div>

              {/* SECTION: SUBCATEGORY (if available) */}
              {availableSubCategories.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                    Subcategory
                  </label>
                  <select
                    value={tempSubCategory}
                    onChange={(e) => setTempSubCategory(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-[11px] font-semibold border transition-colors cursor-pointer bg-transparent focus:outline-none ${
                      theme === 'LIGHT'
                        ? 'border-stone-200 text-stone-800 bg-stone-100'
                        : 'border-white/10 text-stone-200 bg-stone-900'
                    }`}
                  >
                    <option value="all" className="bg-stone-900 text-white">All Subcategories</option>
                    {availableSubCategories.map((sub) => (
                      <option key={sub} value={sub} className="bg-stone-900 text-white">
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="px-4 py-3 border-t border-stone-500/15 flex items-center gap-2 bg-stone-500/5">
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="flex-1 py-2 px-3 rounded-xl border border-stone-500/20 text-[11px] font-semibold text-stone-400 hover:text-rose-400 hover:border-rose-400/30 transition-all cursor-pointer text-center"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="flex-2 py-2 px-4 rounded-xl bg-amber-400 hover:brightness-105 active:scale-95 text-stone-950 font-bold text-[11px] transition-all cursor-pointer text-center shadow-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const SearchResultsPage = React.memo(SearchResultsPageComponent);
