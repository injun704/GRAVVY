import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PromotionSlide } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface HomeCarouselProps {
  slides: PromotionSlide[];
  onSlideClick?: (slide: PromotionSlide) => void;
  autoplayIntervalMs?: number;
  carouselTitle?: string;
}

const HomeCarouselComponent: React.FC<HomeCarouselProps> = ({
  slides,
  onSlideClick,
  autoplayIntervalMs = 4000,
  carouselTitle,
}) => {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(1); // 1 for next (right->left), -1 for prev (left->right)
  const [isPaused, setIsPaused] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const slideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Default fallback image if network drops
  const FALLBACK_IMAGE =
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&auto=format&fit=crop&q=80';

  // Automatic right-to-left movement every 4 seconds (~4000ms), pausing during interaction and when tab is backgrounded
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (slideTimerRef.current) clearInterval(slideTimerRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (isPaused || slides.length === 0 || document.hidden) return;

    slideTimerRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, autoplayIntervalMs);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    };
  }, [isPaused, slides.length, autoplayIntervalMs]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(-1);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 40) {
      // Swiped right-to-left (next slide)
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    } else if (diff < -40) {
      // Swiped left-to-right (prev slide)
      setDirection(-1);
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
    }
  };

  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[currentIndex] || slides[0];
  const accentColor = currentSlide.accentColor || '#FFB800';

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0.85,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      transition: {
        x: { ease: 'easeOut' as const, duration: 0.5 },
        opacity: { duration: 0.25 },
      },
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0.85,
      transition: {
        x: { ease: 'easeOut' as const, duration: 0.5 },
        opacity: { duration: 0.25 },
      },
    }),
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl group shadow-xl border border-white/10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label={carouselTitle || 'Promotions Carousel'}
    >
      {/* Slide Container with smooth AnimatePresence horizontal sliding */}
      <div className="relative h-[230px] xs:h-[250px] sm:h-64 md:h-80 w-full overflow-hidden select-none">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentSlide.id || currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            onClick={() => onSlideClick && onSlideClick(currentSlide)}
            className="absolute inset-0 w-full h-full cursor-pointer overflow-hidden"
          >
            {/* Slide Background Image */}
            <img
              src={
                failedImages[currentSlide.id]
                  ? FALLBACK_IMAGE
                  : currentSlide.imageUrl
              }
              alt={currentSlide.title}
              onError={() => {
                setFailedImages((prev) => ({ ...prev, [currentSlide.id]: true }));
              }}
              className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
              referrerPolicy="no-referrer"
            />

            {/* Deep, layered contrast scrim for crystal-clear readability across all light & dark themes */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/70 to-black/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20" />

            {/* Slide Content */}
            <div className="absolute inset-0 p-3 xs:p-4 sm:p-6 md:p-8 pr-10 xs:pr-12 sm:pr-14 md:pr-16 pb-7 xs:pb-8 sm:pb-8 flex flex-col justify-between max-w-full sm:max-w-xl z-10 overflow-hidden">
              <div>
                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                  <span
                    style={{ backgroundColor: accentColor }}
                    className="text-[9px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 rounded-full text-stone-950 flex items-center gap-1 shadow-md"
                  >
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {currentSlide.badge}
                  </span>
                  {currentSlide.code && (
                    <span className="text-[9px] sm:text-xs font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/20 flex items-center gap-1 shadow-xs">
                      <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white/90" /> CODE: {currentSlide.code}
                    </span>
                  )}
                </div>

                {/* Slide Title */}
                <h2 className="text-sm xs:text-base sm:text-2xl md:text-3xl lg:text-4xl font-black font-display text-white tracking-tight leading-tight sm:leading-snug drop-shadow-md line-clamp-2">
                  {currentSlide.title}
                </h2>

                {/* Slide Subtitle */}
                <p className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm text-stone-200 mt-0.5 sm:mt-1.5 line-clamp-2 max-w-xs sm:max-w-md drop-shadow-xs font-medium leading-tight sm:leading-relaxed">
                  {currentSlide.subtitle}
                </p>
              </div>

              {/* Action Row */}
              <div className="flex items-center gap-2 sm:gap-4 mt-auto pt-1 sm:pt-2 w-full max-w-full overflow-hidden">
                {currentSlide.discount && (
                  <span
                    style={{ color: accentColor }}
                    className="text-xs xs:text-sm sm:text-xl md:text-2xl font-black font-mono tracking-tight drop-shadow-md shrink-0 whitespace-nowrap"
                  >
                    {currentSlide.discount}
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSlideClick) onSlideClick(currentSlide);
                  }}
                  style={{
                    backgroundColor: accentColor,
                  }}
                  className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 xs:px-3 sm:px-4 md:px-5 py-1.5 sm:py-2.5 rounded-xl text-[10px] xs:text-[11px] sm:text-xs md:text-sm font-bold text-stone-950 hover:brightness-110 active:scale-95 transition-all shadow-lg cursor-pointer max-w-[190px] xs:max-w-[220px] sm:max-w-xs shrink"
                  title={currentSlide.ctaText}
                >
                  <span className="text-center font-bold uppercase tracking-tight line-clamp-2 break-words leading-tight">
                    {currentSlide.ctaText}
                  </span>
                  <ArrowRight className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 shrink-0" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-1.5 sm:left-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2.5 rounded-full bg-black/60 text-white hover:bg-black/90 active:scale-90 transition-all opacity-80 group-hover:opacity-100 z-20 backdrop-blur-md border border-white/10 shadow-lg cursor-pointer"
        title="Previous slide"
        aria-label="Previous promotional slide"
      >
        <ChevronLeft className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-1.5 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2.5 rounded-full bg-black/60 text-white hover:bg-black/90 active:scale-90 transition-all opacity-80 group-hover:opacity-100 z-20 backdrop-blur-md border border-white/10 shadow-lg cursor-pointer"
        title="Next slide"
        aria-label="Next promotional slide"
      >
        <ChevronRight className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
      </button>

      {/* Pagination Indicators */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center items-center gap-1.5 z-20">
        {slides.map((slide, idx) => (
          <button
            key={slide.id || idx}
            onClick={(e) => {
              e.stopPropagation();
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            style={{
              backgroundColor: currentIndex === idx ? accentColor : undefined,
            }}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              currentIndex === idx
                ? 'w-6 sm:w-7 h-2 shadow-md'
                : 'w-2 h-2 bg-white/40 hover:bg-white/70'
            }`}
            title={`Slide ${idx + 1}: ${slide.title}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export const HomeCarousel = React.memo(HomeCarouselComponent);

