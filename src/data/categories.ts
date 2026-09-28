export interface CategoryItem {
  id: string;
  name: string;
  iconName: string;
  category: 'food' | 'grocery' | 'medicine';
  imageUrl: string;
  itemCount: number;
}

export const FOOD_CATEGORIES: CategoryItem[] = [
  {
    id: 'food-cat-biryani',
    name: 'Biryani',
    iconName: 'Flame',
    category: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80',
    itemCount: 48,
  },
  {
    id: 'food-cat-pizza',
    name: 'Pizza',
    iconName: 'Pizza',
    category: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80',
    itemCount: 36,
  },
  {
    id: 'food-cat-burgers',
    name: 'Burgers',
    iconName: 'UtensilsCrossed',
    category: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80',
    itemCount: 29,
  },
  {
    id: 'food-cat-momos',
    name: 'Momos',
    iconName: 'Soup',
    category: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300&auto=format&fit=crop&q=80',
    itemCount: 22,
  },
  {
    id: 'food-cat-chowmein',
    name: 'Chowmein',
    iconName: 'Utensils',
    category: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&auto=format&fit=crop&q=80',
    itemCount: 19,
  },
  {
    id: 'food-cat-friedrice',
    name: 'Fried Rice',
    iconName: 'Sparkles',
    category: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&auto=format&fit=crop&q=80',
    itemCount: 25,
  },
  {
    id: 'food-cat-rolls',
    name: 'Chicken Rolls',
    iconName: 'Wrap',
    category: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=300&auto=format&fit=crop&q=80',
    itemCount: 31,
  },
  {
    id: 'food-cat-sandwiches',
    name: 'Sandwiches',
    iconName: 'Layers',
    category: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300&auto=format&fit=crop&q=80',
    itemCount: 18,
  },
  {
    id: 'food-cat-thalis',
    name: 'Indian Thalis',
    iconName: 'Crown',
    category: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&auto=format&fit=crop&q=80',
    itemCount: 27,
  },
  {
    id: 'food-cat-desserts',
    name: 'Desserts',
    iconName: 'Cake',
    category: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=300&auto=format&fit=crop&q=80',
    itemCount: 42,
  },
  {
    id: 'food-cat-beverages',
    name: 'Beverages',
    iconName: 'Coffee',
    category: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=300&auto=format&fit=crop&q=80',
    itemCount: 35,
  },
];

export const GROCERY_CATEGORIES: CategoryItem[] = [
  {
    id: 'groc-cat-fruits',
    name: 'Fruits',
    iconName: 'Apple',
    category: 'grocery',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&auto=format&fit=crop&q=80',
    itemCount: 65,
  },
  {
    id: 'groc-cat-vegetables',
    name: 'Vegetables',
    iconName: 'Carrot',
    category: 'grocery',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&auto=format&fit=crop&q=80',
    itemCount: 84,
  },
  {
    id: 'groc-cat-dairy',
    name: 'Milk & Dairy',
    iconName: 'Milk',
    category: 'grocery',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop&q=80',
    itemCount: 42,
  },
  {
    id: 'groc-cat-rice',
    name: 'Rice & Flour',
    iconName: 'Wheat',
    category: 'grocery',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=80',
    itemCount: 56,
  },
  {
    id: 'groc-cat-oil',
    name: 'Cooking Oil & Spices',
    iconName: 'Droplet',
    category: 'grocery',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&auto=format&fit=crop&q=80',
    itemCount: 78,
  },
  {
    id: 'groc-cat-snacks',
    name: 'Snacks & Biscuits',
    iconName: 'Cookie',
    category: 'grocery',
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&auto=format&fit=crop&q=80',
    itemCount: 92,
  },
  {
    id: 'groc-cat-cleaning',
    name: 'Household & Cleaning',
    iconName: 'Sparkle',
    category: 'grocery',
    imageUrl: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=300&auto=format&fit=crop&q=80',
    itemCount: 49,
  },
];

export const MEDICINE_CATEGORIES: CategoryItem[] = [
  {
    id: 'med-cat-otc',
    name: 'OTC Medicines',
    iconName: 'Pill',
    category: 'medicine',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
    itemCount: 110,
  },
  {
    id: 'med-cat-firstaid',
    name: 'First Aid',
    iconName: 'Cross',
    category: 'medicine',
    imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&auto=format&fit=crop&q=80',
    itemCount: 45,
  },
  {
    id: 'med-cat-vitamins',
    name: 'Vitamins & Supplements',
    iconName: 'HeartPulse',
    category: 'medicine',
    imageUrl: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=300&auto=format&fit=crop&q=80',
    itemCount: 68,
  },
  {
    id: 'med-cat-wellness',
    name: 'Wellness',
    iconName: 'Activity',
    category: 'medicine',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&auto=format&fit=crop&q=80',
    itemCount: 52,
  },
  {
    id: 'med-cat-baby',
    name: 'Baby Care',
    iconName: 'Baby',
    category: 'medicine',
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&auto=format&fit=crop&q=80',
    itemCount: 38,
  },
  {
    id: 'med-cat-devices',
    name: 'Medical Devices',
    iconName: 'Thermometer',
    category: 'medicine',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&auto=format&fit=crop&q=80',
    itemCount: 29,
  },
];
