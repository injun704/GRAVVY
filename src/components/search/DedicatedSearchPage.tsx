import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  X,
  Mic,
  Clock,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Check,
} from 'lucide-react';
import { Product } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { searchProducts } from '../../utils/searchEngine';
import { VoiceSearchModal } from '../common/VoiceSearchModal';

interface DedicatedSearchPageProps {
  products: Product[];
  initialQuery: string;
  onSelectProduct: (product: Product) => void;
  onBack: () => void;
  onSubmitSearch: (query: string) => void;
}

const RECENT_SEARCHES_STORAGE_KEY = 'gravvy_recent_searches';
const MAX_RECENT_SEARCHES = 5;

const TRENDING_QUERIES = [
  'Chicken Biryani',
  'Amul Butter',
  'Dolo 650',
  'Paneer Masala',
  'Fresh Apples',
  'Crocin',
  'Momos',
  'Organic Milk',
];

const DedicatedSearchPageComponent: React.FC<DedicatedSearchPageProps> = ({
  products,
  initialQuery,
  onSelectProduct,
  onBack,
  onSubmitSearch,
}) => {
  const { theme, categoryAccent, textColorPrimary } = useTheme();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize recent searches from localStorage
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
    } catch {}
    return [];
  });

  // Automatically focus input and open mobile keyboard on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const saveRecentSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      try {
        localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const removeRecentSearch = (termToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== termToRemove);
      try {
        localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearAllRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
    } catch {}
  };

  const handleSearchSubmit = (term?: string) => {
    const queryToUse = (term || searchQuery).trim();
    if (!queryToUse) return;

    saveRecentSearch(queryToUse);
    onSubmitSearch(queryToUse);
  };

  // Matching products for autocomplete suggestions
  const matchingProducts = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return [];
    return searchProducts(products, q).slice(0, 6);
  }, [searchQuery, products]);

  // Keyword suggestions
  const keywordSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const suggestions: string[] = [];
    suggestions.push(searchQuery.trim());

    products.forEach((p) => {
      if (p.subCategory && p.subCategory.toLowerCase().includes(q) && !suggestions.includes(p.subCategory)) {
        suggestions.push(p.subCategory);
      }
    });

    return suggestions.slice(0, 4);
  }, [searchQuery, products]);

  return (
    <div
      className={`min-h-screen w-full flex flex-col transition-all pb-24 ${
        theme === 'LIGHT' ? 'bg-stone-50 text-stone-900' : 'bg-stone-950 text-stone-100'
      }`}
    >
      {/* Top Search Header: Fully Transparent & Seamless */}
      <header className="sticky top-0 z-40 w-full px-2 xs:px-3 py-2 sm:py-3 bg-transparent border-0 border-none shadow-none outline-none flex items-center gap-2 select-none">
        {/* Back Button matching GRAVVY dedicated header pattern */}
        <button
          type="button"
          onClick={onBack}
          className={`flex items-center gap-1 py-1 px-1 text-xs font-semibold transition-colors cursor-pointer bg-transparent border-0 outline-none active:scale-95 shrink-0 ${
            theme === 'LIGHT' ? 'text-stone-700 hover:text-stone-900' : 'text-stone-300 hover:text-white'
          }`}
          title="Back"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span className="hidden xs:inline">Back</span>
        </button>

        {/* Search Field */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchSubmit();
          }}
          className={`flex-1 flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-2xl border transition-all ${
            theme === 'LIGHT'
              ? 'bg-white border-stone-200 focus-within:border-amber-400'
              : 'bg-stone-900/80 border-white/15 focus-within:border-amber-400'
          }`}
        >
          <Search className="w-4 h-4 text-stone-400 shrink-0" />

          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearchSubmit();
              }
            }}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Search products, food, groceries, medicine..."
            className={`w-full bg-transparent text-sm sm:text-base focus:outline-none placeholder:text-stone-400 font-medium ${textColorPrimary}`}
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-full text-stone-400 hover:text-stone-200 cursor-pointer shrink-0"
              title="Clear text"
              aria-label="Clear text"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Microphone Icon ONLY in Dedicated Search Page at Top-Right */}
          <button
            type="button"
            onClick={() => {
              inputRef.current?.blur(); // Dismiss keyboard when voice search starts
              setIsVoiceModalOpen(true);
            }}
            className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30`}
            title="Voice Search"
            aria-label="Voice Search"
          >
            <Mic className="w-4 h-4 text-white" />
          </button>
        </form>
      </header>

      {/* Main Content Body: Search History, Suggestions, Matching Products */}
      <div className="flex-1 max-w-3xl w-full mx-auto p-3 sm:p-4 space-y-4">
        {/* Recent Search History */}
        {!searchQuery && recentSearches.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-stone-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> Recent Searches
              </span>
              <button
                type="button"
                onClick={clearAllRecentSearches}
                className="text-[11px] font-semibold text-rose-400 hover:underline cursor-pointer"
              >
                Clear All
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleSearchSubmit(term)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    theme === 'LIGHT'
                      ? 'bg-white hover:bg-stone-100 border-stone-200 text-stone-700 shadow-2xs'
                      : 'bg-stone-900 hover:bg-stone-800 border-stone-800 text-stone-200'
                  }`}
                >
                  <Clock className="w-3 h-3 text-stone-400" />
                  <span>{term}</span>
                  <span
                    onClick={(e) => removeRecentSearch(term, e)}
                    className="p-0.5 rounded-full hover:bg-stone-500/20 text-stone-400 hover:text-stone-200"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trending Searches */}
        {!searchQuery && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-stone-400 flex items-center gap-1.5 uppercase tracking-wider px-1">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-500" /> Trending Searches
            </span>
            <div className="flex flex-wrap gap-2">
              {TRENDING_QUERIES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleSearchSubmit(term)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                    theme === 'LIGHT'
                      ? 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-700'
                      : 'bg-stone-900/60 hover:bg-stone-800 border-stone-800 text-stone-300'
                  }`}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live Autocomplete Suggestions & Matching Products while typing */}
        {searchQuery && (
          <div className="space-y-4">
            {/* Keyword suggestions */}
            {keywordSuggestions.length > 0 && (
              <div className="space-y-1.5">
                {keywordSuggestions.map((kw, i) => (
                  <button
                    key={kw + i}
                    type="button"
                    onClick={() => handleSearchSubmit(kw)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between text-sm font-semibold transition-colors cursor-pointer ${
                      theme === 'LIGHT'
                        ? 'hover:bg-stone-100 text-stone-800'
                        : 'hover:bg-stone-900 text-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Search className="w-4 h-4 text-stone-400" />
                      <span>{kw}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400" />
                  </button>
                ))}
              </div>
            )}

            {/* Matching Products */}
            {matchingProducts.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider px-1">
                  Matching Products ({matchingProducts.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {matchingProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        saveRecentSearch(p.name);
                        onSelectProduct(p);
                      }}
                      className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                        theme === 'LIGHT'
                          ? 'bg-white hover:bg-stone-50 border-stone-200 shadow-2xs'
                          : 'bg-stone-900/80 hover:bg-stone-900 border-stone-800'
                      }`}
                    >
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 bg-stone-100"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-xs font-bold truncate ${textColorPrimary}`}>{p.name}</h4>
                        <p className="text-[11px] text-amber-500 font-extrabold mt-0.5">₹{p.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Compact Frosted-Glass Voice Search Popup Modal */}
      <VoiceSearchModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onVoiceResult={(query) => {
          setSearchQuery(query);
          saveRecentSearch(query);
          onSubmitSearch(query);
        }}
      />
    </div>
  );
};

export const DedicatedSearchPage = React.memo(DedicatedSearchPageComponent);
