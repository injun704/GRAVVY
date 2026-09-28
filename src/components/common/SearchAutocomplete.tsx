import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  ArrowRight,
  Mic,
  UtensilsCrossed,
  ShoppingBag,
  Pill,
  Sparkles,
} from 'lucide-react';
import { Product } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { searchProducts } from '../../utils/searchEngine';

interface SearchAutocompleteProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onOpenVoiceSearch?: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSubmitSearch?: (query: string) => void;
  hideMic?: boolean;
  onFocusInput?: () => void;
}

const RECENT_SEARCHES_STORAGE_KEY = 'gravvy_recent_searches';
const MAX_RECENT_SEARCHES = 5;

const TRENDING_SEARCHES = [
  'Biryani',
  'Burger',
  'Pizza',
  'Apples',
  'Bananas',
  'Dolo 650',
  'Momos',
  'Milk',
  'Paracetamol',
  'Sprite',
];

const SearchAutocompleteComponent: React.FC<SearchAutocompleteProps> = ({
  products,
  onSelectProduct,
  onOpenVoiceSearch,
  searchQuery,
  setSearchQuery,
  onSubmitSearch,
  hideMic,
  onFocusInput,
}) => {
  const { theme, categoryAccent, textColorPrimary, textColorSecondary, textColorMuted } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize recent searches from localStorage (strictly up to 5 items)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
            .slice(0, MAX_RECENT_SEARCHES);
        }
      }
    } catch (err) {
      console.warn('Failed to parse recent searches from localStorage:', err);
    }
    return [];
  });

  // Handle outside click / touch
  useEffect(() => {
    const handlePointerDownOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDownOutside);
    document.addEventListener('touchstart', handlePointerDownOutside);
    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside);
      document.removeEventListener('touchstart', handlePointerDownOutside);
    };
  }, []);

  // Save term to localStorage (strictly maintains last 5, deduplicated, case-insensitive)
  const saveRecentSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      try {
        localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save recent searches to localStorage:', err);
      }
      return updated;
    });
  };

  // Remove single recent search
  const removeRecentSearch = (termToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== termToRemove);
      try {
        localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to update recent searches:', err);
      }
      return updated;
    });
  };

  // Clear all recent searches
  const clearAllRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to clear recent searches:', err);
    }
  };

  // Smart Typo-Tolerant & Category-Aware matching products
  const matchingProducts = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return [];
    return searchProducts(products, q).slice(0, 6);
  }, [searchQuery, products]);

  // Total matching count in entire database
  const totalMatchesCount = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return 0;
    return searchProducts(products, q).length;
  }, [searchQuery, products]);

  // Level 1 Search Suggestions (Keywords + Query In Categories)
  const keywordSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const suggestions: { text: string; category?: 'food' | 'grocery' | 'medicine'; isDirectSearch?: boolean }[] = [];

    // 1. Direct search suggestion
    suggestions.push({ text: searchQuery.trim(), isDirectSearch: true });

    // 2. Category targeted searches
    const foodCount = searchProducts(products, q, { category: 'food' }).length;
    const groceryCount = searchProducts(products, q, { category: 'grocery' }).length;
    const medicineCount = searchProducts(products, q, { category: 'medicine' }).length;

    if (foodCount > 0) suggestions.push({ text: `${searchQuery.trim()} in Food`, category: 'food' });
    if (groceryCount > 0) suggestions.push({ text: `${searchQuery.trim()} in Grocery`, category: 'grocery' });
    if (medicineCount > 0) suggestions.push({ text: `${searchQuery.trim()} in Medicine`, category: 'medicine' });

    // 3. Matched subcategories / brand keywords
    const matchedSubcats = new Set<string>();
    products.forEach((p) => {
      if (p.subCategory && p.subCategory.toLowerCase().includes(q) && p.subCategory.toLowerCase() !== q) {
        matchedSubcats.add(p.subCategory);
      }
      if (p.restaurantOrBrand && p.restaurantOrBrand.toLowerCase().includes(q) && p.restaurantOrBrand.toLowerCase() !== q) {
        matchedSubcats.add(p.restaurantOrBrand);
      }
    });

    Array.from(matchedSubcats).slice(0, 3).forEach((sub) => {
      suggestions.push({ text: sub });
    });

    return suggestions.slice(0, 4);
  }, [searchQuery, products]);

  // Matching recent searches for current query
  const matchingRecentSearches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return recentSearches.filter((s) => s.toLowerCase().includes(q));
  }, [searchQuery, recentSearches]);

  const handleSelect = (product: Product) => {
    saveRecentSearch(product.name);
    setSearchQuery(product.name);
    setIsOpen(false);
    onSelectProduct(product);
  };

  const handleSearchSubmit = (term?: string) => {
    const queryToUse = (term || searchQuery).trim();
    if (!queryToUse) return;

    saveRecentSearch(queryToUse);
    setIsOpen(false);

    if (onSubmitSearch) {
      onSubmitSearch(queryToUse);
    } else if (matchingProducts.length > 0) {
      handleSelect(matchingProducts[0]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < matchingProducts.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : matchingProducts.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const clearQuery = () => {
    setSearchQuery('');
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full z-30">
      {/* Search Bar Form - Interactive & Fully Accessible across Desktop and Mobile */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearchSubmit();
        }}
        onClick={() => {
          if (onFocusInput) {
            onFocusInput();
          } else {
            inputRef.current?.focus();
            setIsOpen(true);
          }
        }}
        className={`w-full flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl transition-all duration-200 border cursor-text shadow-sm ${
          theme === 'LIGHT'
            ? 'bg-stone-50/95 hover:bg-white focus-within:bg-white border-stone-200/90 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20'
            : theme === 'DARK'
            ? 'bg-neutral-900/90 hover:bg-neutral-900 focus-within:bg-neutral-900 border-neutral-700/80 focus-within:border-amber-400/60 focus-within:ring-2 focus-within:ring-amber-400/20'
            : 'bg-stone-900/85 hover:bg-stone-900 focus-within:bg-stone-900 border-white/20 focus-within:border-amber-400/50 focus-within:ring-2 focus-within:ring-amber-400/20 shadow-inner'
        }`}
      >
        {/* Search Icon */}
        <button
          type="submit"
          className={`p-0.5 rounded-lg hover:text-amber-500 transition-colors cursor-pointer shrink-0 ${textColorMuted}`}
          title="Search"
          aria-label="Submit search"
        >
          <Search className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
        </button>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            if (onFocusInput) {
              onFocusInput();
            } else {
              setIsOpen(true);
            }
          }}
          onClick={(e) => {
            if (onFocusInput) {
              e.preventDefault();
              onFocusInput();
            } else {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Search food, grocery, medicine (e.g. Biryani, Apple, Paracetamol)..."
          className={`w-full bg-transparent text-xs xs:text-sm sm:text-base focus:outline-none placeholder:text-stone-400 select-text font-medium pointer-events-auto ${textColorPrimary}`}
        />

        {/* Clear query button */}
        {searchQuery ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              clearQuery();
            }}
            className={`p-1 rounded-full hover:bg-stone-500/20 text-stone-400 hover:${textColorPrimary} cursor-pointer shrink-0 transition-colors`}
            title="Clear search query"
            aria-label="Clear query"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        ) : null}

        {/* Voice Search Trigger (Only rendered if hideMic is not true and onOpenVoiceSearch exists) */}
        {!hideMic && onOpenVoiceSearch && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenVoiceSearch();
            }}
            className={`p-1.5 sm:p-2 rounded-xl transition-all hover:bg-stone-500/20 cursor-pointer shrink-0 ${categoryAccent.textClass}`}
            title="Voice Search"
            aria-label="Search with voice"
          >
            <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </form>

      {/* ============================================================ */}
      {/* Dropdown Menu: Level 1 Suggestions, Trending, Autocomplete */}
      {/* ============================================================ */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-full mt-2 rounded-2xl border shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in-50 slide-in-from-top-2 duration-150 max-h-[80vh] overflow-y-auto ${
            theme === 'LIGHT'
              ? 'bg-white/98 border-stone-200 divide-stone-100'
              : theme === 'DARK'
              ? 'bg-neutral-900/98 border-neutral-800 divide-neutral-800'
              : 'bg-stone-950/95 border-white/20 divide-white/10'
          }`}
        >
          {searchQuery.trim() ? (
            /* Results & Suggestion State */
            <div>
              {/* If any past recent searches match typed query */}
              {matchingRecentSearches.length > 0 && (
                <div className="px-3.5 py-2 border-b border-stone-500/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-stone-500/5">
                  <span className="text-[11px] font-bold text-stone-400 flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3 text-amber-500" /> Recent:
                  </span>
                  {matchingRecentSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleSearchSubmit(term)}
                      className="text-xs px-2.5 py-0.5 rounded-lg bg-stone-500/15 hover:bg-amber-400/20 hover:text-amber-400 text-stone-300 transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                    >
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* LEVEL 1: Search Keyword Suggestions */}
              {keywordSuggestions.length > 0 && (
                <div className="p-2 border-b border-stone-500/10 space-y-1">
                  {keywordSuggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSearchSubmit(sug.text)}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-stone-500/10 text-left transition-colors cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Search className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className={`font-semibold truncate ${textColorPrimary}`}>
                          {sug.text}
                        </span>
                        {sug.category && (
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                              sug.category === 'food'
                                ? 'bg-red-500/15 text-red-400'
                                : sug.category === 'grocery'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-sky-500/15 text-sky-400'
                            }`}
                          >
                            {sug.category}
                          </span>
                        )}
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Matching Products Header */}
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stone-400 border-b border-stone-500/10 flex items-center justify-between">
                <span>Direct Matches ({matchingProducts.length})</span>
                <span className="text-[10px] text-stone-400 font-normal hidden sm:inline">
                  Press Enter for full results
                </span>
              </div>

              {/* Product Results */}
              {matchingProducts.length > 0 ? (
                <div className="py-1">
                  {matchingProducts.map((p, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelect(p)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                          isSelected
                            ? theme === 'LIGHT'
                              ? 'bg-stone-100/90'
                              : 'bg-white/10'
                            : 'hover:bg-stone-500/10'
                        }`}
                      >
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-11 h-11 rounded-xl object-cover shrink-0 border border-stone-500/20"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-semibold truncate ${textColorPrimary}`}
                            >
                              {p.name}
                            </span>
                            {p.veg !== undefined && p.veg !== null && (
                              <span
                                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                  p.veg ? 'bg-emerald-500' : 'bg-red-500'
                                }`}
                                title={p.veg ? 'Pure Veg' : 'Non-Veg'}
                              />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                            <span
                              className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded-md ${
                                p.category === 'food'
                                  ? 'bg-red-500/15 text-red-400 border border-red-500/25'
                                  : p.category === 'grocery'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                                  : 'bg-sky-500/15 text-sky-400 border border-sky-500/25'
                              }`}
                            >
                              {p.category}
                            </span>
                            <span>·</span>
                            <span className="truncate">{p.restaurantOrBrand}</span>
                            <span>·</span>
                            <span className="font-semibold text-amber-400">₹{p.price}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />
                      </div>
                    );
                  })}

                  {/* LEVEL 2 CTA: View all results on dedicated Search Results page */}
                  <div className="p-2 border-t border-stone-500/10 bg-stone-500/5">
                    <button
                      type="button"
                      onClick={() => handleSearchSubmit()}
                      className="w-full py-2 px-3 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>See all {totalMatchesCount} results for "{searchQuery}"</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-stone-400 space-y-2">
                  <p>No exact product name match found for "{searchQuery}".</p>
                  <button
                    type="button"
                    onClick={() => handleSearchSubmit()}
                    className="mt-2 px-4 py-2 rounded-xl bg-amber-400 text-stone-950 font-bold text-xs hover:brightness-110 cursor-pointer"
                  >
                    Search full catalog for "{searchQuery}"
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Idle State: Recent Searches + Trending */
            <div className="p-3.5 space-y-4">
              {/* Recent Searches Section (Strictly last 5, persisted) */}
              {recentSearches.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between px-1 mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-400 uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Recent Searches</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-stone-500/15 text-stone-400">
                        {recentSearches.length}/5
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={clearAllRecentSearches}
                      className="text-[11px] font-bold text-stone-400 hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1"
                      title="Clear all recent searches"
                    >
                      <span>Clear All</span>
                    </button>
                  </div>

                  <div className="space-y-1">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        onClick={() => handleSearchSubmit(term)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer group ${
                          theme === 'LIGHT' ? 'hover:bg-stone-100' : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Clock className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-500 transition-colors" />
                          <span className={`text-xs sm:text-sm font-medium ${textColorPrimary}`}>
                            {term}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(term, e)}
                          className="p-1 rounded-md text-stone-400 hover:text-rose-400 hover:bg-stone-500/20 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          title={`Remove "${term}"`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Trending Searches Grid */}
              <div>
                <div className="flex items-center gap-1.5 px-1 mb-2 text-xs font-bold text-stone-400 uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                  <span>Trending on GRAVVY</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {TRENDING_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleSearchSubmit(term)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer font-medium flex items-center gap-1 active:scale-95 ${
                        theme === 'LIGHT'
                          ? 'bg-stone-100 hover:bg-amber-50 border-stone-200 text-stone-700 hover:border-amber-300'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-stone-300 hover:border-amber-400/40'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const SearchAutocomplete = React.memo(SearchAutocompleteComponent);
