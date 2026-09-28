import React from 'react';
import { Sparkles, UtensilsCrossed, ShoppingBag, Pill } from 'lucide-react';
import { CategoryTab } from '../../types';

export const CategoryGradientDefs: React.FC = () => {
  return (
    <svg
      width="0"
      height="0"
      className="absolute pointer-events-none -z-50"
      aria-hidden="true"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs>
        {/* Home: Yellow/Gold diagonal gradient (upper-left to lower-right) */}
        <linearGradient id="gravvy-cat-grad-home" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF176" />
          <stop offset="35%" stopColor="#FFD600" />
          <stop offset="100%" stopColor="#FF8C00" />
        </linearGradient>

        {/* Food: Rich Red diagonal gradient (upper-left to lower-right) */}
        <linearGradient id="gravvy-cat-grad-food" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF7A70" />
          <stop offset="40%" stopColor="#FF5A4F" />
          <stop offset="100%" stopColor="#B91C1C" />
        </linearGradient>

        {/* Grocery: Vibrant Green diagonal gradient (upper-left to lower-right) */}
        <linearGradient id="gravvy-cat-grad-grocery" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#86EFAC" />
          <stop offset="40%" stopColor="#4ADE80" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>

        {/* Medicine: Bright Sky Blue diagonal gradient (upper-left to lower-right) */}
        <linearGradient id="gravvy-cat-grad-medicine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="40%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>
    </svg>
  );
};

interface CategoryGradientIconProps {
  category: CategoryTab;
  isActive: boolean;
  className?: string;
  size?: number;
}

export const CategoryGradientIcon: React.FC<CategoryGradientIconProps> = ({
  category,
  isActive,
  className = 'w-4 h-4',
  size,
}) => {
  const iconProps = {
    className: `${className} transition-all duration-300`,
    size,
    strokeWidth: isActive ? 2.5 : 2,
    stroke: isActive ? `url(#gravvy-cat-grad-${category})` : 'currentColor',
    style: isActive
      ? {
          stroke: `url(#gravvy-cat-grad-${category})`,
          filter:
            category === 'home'
              ? 'drop-shadow(0 1px 2px rgba(245, 158, 11, 0.4))'
              : category === 'food'
              ? 'drop-shadow(0 1px 2px rgba(220, 38, 38, 0.4))'
              : category === 'grocery'
              ? 'drop-shadow(0 1px 2px rgba(22, 163, 74, 0.4))'
              : 'drop-shadow(0 1px 2px rgba(2, 132, 199, 0.4))',
        }
      : undefined,
  };

  switch (category) {
    case 'home':
      return <Sparkles {...iconProps} />;
    case 'food':
      return <UtensilsCrossed {...iconProps} />;
    case 'grocery':
      return <ShoppingBag {...iconProps} />;
    case 'medicine':
      return <Pill {...iconProps} />;
    default:
      return <Sparkles {...iconProps} />;
  }
};
