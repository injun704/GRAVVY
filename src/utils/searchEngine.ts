import { Product } from '../types';

/**
 * Levenshtein distance for typo tolerance
 */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Normalizes text for search matching: lowercases, trims, removes special punctuation,
 * handles common singular/plural suffixes.
 */
export function normalizeSearchTerm(term: string): string {
  return term
    .toLowerCase()
    .trim()
    .replace(/['’".,/#!$%^&*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Synonyms and category mapping dictionary for smart e-commerce search
 */
const SEARCH_SYNONYMS: Record<string, string[]> = {
  medicine: ['medicine', 'medicines', 'pharma', 'pharmacy', 'tablet', 'tablets', 'capsule', 'capsules', 'syrup', 'pain', 'fever', 'cold', 'health', 'rx', 'otc', 'doctor', 'medical', 'ointment', 'relief', 'care'],
  medicines: ['medicine', 'medicines', 'pharma', 'pharmacy', 'tablet', 'tablets', 'health', 'medical'],
  fever: ['dolo', 'paracetamol', 'fever', 'temperature', 'crocin', 'calpol', 'pyrexia', 'headache'],
  cough: ['cough', 'syrup', 'benadryl', 'cold', 'throat', 'lozenge', 'strepsils', 'ascoril', 'chest'],
  cold: ['cold', 'flu', 'sinus', 'vicks', 'inhaler', 'nasal', 'congestion', 'cough', 'fever'],
  pain: ['pain', 'relief', 'gel', 'spray', 'volini', 'moov', 'headache', 'bodyache', 'paracetamol', 'sprain', 'balm'],
  vitamin: ['vitamin', 'vitamins', 'multivitamin', 'zinc', 'calcium', 'immunity', 'supplements', 'd3', 'c', 'b12'],
  food: ['food', 'meal', 'lunch', 'dinner', 'breakfast', 'dish', 'biryani', 'pizza', 'burger', 'momo', 'roll', 'noodles', 'snack', 'restaurant', 'eat', 'kitchen', 'curry', 'rice', 'roti'],
  grocery: ['grocery', 'groceries', 'supermarket', 'mart', 'staples', 'milk', 'fruit', 'fruits', 'vegetables', 'veggies', 'apple', 'banana', 'bread', 'butter', 'oil', 'atta', 'flour', 'rice', 'dal', 'snack', 'beverage', 'drink', 'cola', 'sprite'],
  drink: ['drink', 'drinks', 'beverage', 'beverages', 'soda', 'coke', 'coca cola', 'sprite', 'pepsi', 'juice', 'shake', 'smoothie'],
  fruit: ['fruit', 'fruits', 'apple', 'apples', 'banana', 'bananas', 'orange', 'mango', 'pomegranate', 'papaya', 'grapes'],
  sweet: ['sweet', 'sweets', 'dessert', 'desserts', 'gulab jamun', 'rasgulla', 'cake', 'ice cream', 'pastry', 'kulfi'],
};

/**
 * Evaluates match score for a product against a search query
 */
export function evaluateProductSearchScore(product: Product, query: string): { score: number; matches: boolean } {
  const cleanQuery = normalizeSearchTerm(query);
  if (!cleanQuery) return { score: 100, matches: true };

  const queryWords = cleanQuery.split(' ').filter(Boolean);
  const nameNorm = normalizeSearchTerm(product.name);
  const brandNorm = normalizeSearchTerm(product.restaurantOrBrand || '');
  const subCatNorm = normalizeSearchTerm(product.subCategory || '');
  const catNorm = normalizeSearchTerm(product.category || '');
  const descNorm = normalizeSearchTerm(product.description || '');
  const tagsNorm = (product.tags || []).map((t) => normalizeSearchTerm(t)).join(' ');

  let totalScore = 0;
  let wordMatchesCount = 0;

  // 1. Direct exact or prefix match on entire query
  if (nameNorm === cleanQuery) totalScore += 200;
  else if (nameNorm.startsWith(cleanQuery)) totalScore += 160;
  else if (nameNorm.includes(cleanQuery)) totalScore += 120;
  else if (subCatNorm === cleanQuery || subCatNorm.startsWith(cleanQuery)) totalScore += 140;
  else if (brandNorm === cleanQuery || brandNorm.startsWith(cleanQuery)) totalScore += 130;
  else if (catNorm === cleanQuery) totalScore += 110;

  // 2. Synonyms expansion check
  for (const [key, synList] of Object.entries(SEARCH_SYNONYMS)) {
    if (cleanQuery.includes(key) || synList.includes(cleanQuery)) {
      if (catNorm === key || (key === 'medicine' && product.category === 'medicine') || (key === 'food' && product.category === 'food') || (key === 'grocery' && product.category === 'grocery')) {
        totalScore += 90;
      }
      for (const syn of synList) {
        if (nameNorm.includes(syn) || subCatNorm.includes(syn) || tagsNorm.includes(syn)) {
          totalScore += 70;
        }
      }
    }
  }

  // 3. Multi-word and partial matching with typo tolerance
  for (const qWord of queryWords) {
    let wordMatched = false;
    let wordScore = 0;

    // Check exact word or stem match
    if (nameNorm.includes(qWord)) {
      wordScore = Math.max(wordScore, 80);
      wordMatched = true;
    } else if (subCatNorm.includes(qWord)) {
      wordScore = Math.max(wordScore, 70);
      wordMatched = true;
    } else if (brandNorm.includes(qWord)) {
      wordScore = Math.max(wordScore, 65);
      wordMatched = true;
    } else if (catNorm.includes(qWord)) {
      wordScore = Math.max(wordScore, 60);
      wordMatched = true;
    } else if (tagsNorm.includes(qWord)) {
      wordScore = Math.max(wordScore, 50);
      wordMatched = true;
    } else if (descNorm.includes(qWord)) {
      wordScore = Math.max(wordScore, 30);
      wordMatched = true;
    }

    // Typo tolerance check for words of length >= 3
    if (!wordMatched && qWord.length >= 3) {
      const allTargetWords = `${nameNorm} ${subCatNorm} ${brandNorm} ${catNorm} ${tagsNorm}`.split(' ');
      for (const tWord of allTargetWords) {
        if (!tWord || tWord.length < 3) continue;

        // Prefix check (e.g., 'parac' matching 'paracetamol', 'sprt' matching 'sprite')
        if (tWord.startsWith(qWord) || qWord.startsWith(tWord)) {
          wordScore = Math.max(wordScore, 55);
          wordMatched = true;
          break;
        }

        const maxAllowedDistance = qWord.length <= 4 ? 1 : 2;
        const dist = levenshtein(qWord, tWord);
        if (dist <= maxAllowedDistance) {
          wordScore = Math.max(wordScore, 45 - dist * 10);
          wordMatched = true;
          break;
        }
      }
    }

    if (wordMatched) {
      wordMatchesCount++;
      totalScore += wordScore;
    }
  }

  // If query had multiple words, require match on at least one word
  const matches = totalScore > 0 && (queryWords.length === 0 || wordMatchesCount > 0);

  // Bonus for bestselling / high rated products to improve relevance
  if (matches) {
    if (product.bestSeller) totalScore += 10;
    if (product.trending) totalScore += 8;
    if (product.rating >= 4.7) totalScore += 5;
  }

  return { score: totalScore, matches };
}

/**
 * Searches and filters catalog products
 */
export function searchProducts(
  products: Product[],
  query: string,
  options?: {
    category?: 'all' | 'food' | 'grocery' | 'medicine';
    sortBy?: 'relevance' | 'popularity' | 'price_low' | 'price_high' | 'rating' | 'discount';
    subCategory?: string;
    inStockOnly?: boolean;
    vegFilter?: 'all' | 'veg' | 'non-veg';
    prescriptionFilter?: 'all' | 'otc' | 'rx';
    priceRange?: 'all' | 'under200' | 'under500' | 'above500';
    minRating?: number;
  }
): Product[] {
  const cleanQuery = query.trim();

  // 1. Score and filter matching products
  let results = products
    .map((p) => {
      const { score, matches } = evaluateProductSearchScore(p, cleanQuery);
      return { product: p, score, matches };
    })
    .filter((item) => item.matches)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product);

  // 2. Apply Category filter
  if (options?.category && options.category !== 'all') {
    results = results.filter((p) => p.category === options.category);
  }

  // 3. Apply SubCategory filter
  if (options?.subCategory && options.subCategory !== 'all') {
    results = results.filter((p) => p.subCategory === options.subCategory);
  }

  // 4. In-Stock filter
  if (options?.inStockOnly) {
    results = results.filter((p) => p.inStock);
  }

  // 5. Veg / Non-Veg filter
  if (options?.vegFilter && options.vegFilter !== 'all') {
    if (options.vegFilter === 'veg') {
      results = results.filter((p) => p.veg === true);
    } else if (options.vegFilter === 'non-veg') {
      results = results.filter((p) => p.veg === false);
    }
  }

  // 6. Prescription filter
  if (options?.prescriptionFilter && options.prescriptionFilter !== 'all') {
    if (options.prescriptionFilter === 'otc') {
      results = results.filter((p) => !p.prescriptionRequired);
    } else if (options.prescriptionFilter === 'rx') {
      results = results.filter((p) => p.prescriptionRequired === true);
    }
  }

  // 7. Price range filter
  if (options?.priceRange && options.priceRange !== 'all') {
    if (options.priceRange === 'under200') {
      results = results.filter((p) => p.price <= 200);
    } else if (options.priceRange === 'under500') {
      results = results.filter((p) => p.price <= 500);
    } else if (options.priceRange === 'above500') {
      results = results.filter((p) => p.price > 500);
    }
  }

  // 8. Rating filter
  if (options?.minRating && options.minRating > 0) {
    results = results.filter((p) => p.rating >= options.minRating!);
  }

  // 9. Sorting
  if (options?.sortBy) {
    switch (options.sortBy) {
      case 'popularity':
        results = [...results].sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0));
        break;
      case 'price_low':
        results = [...results].sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        results = [...results].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        results = [...results].sort((a, b) => b.rating - a.rating);
        break;
      case 'discount':
        results = [...results].sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
        break;
      case 'relevance':
      default:
        // already scored by relevance
        break;
    }
  }

  return results;
}
