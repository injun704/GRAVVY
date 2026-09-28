import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

const UniAmbientGlowComponent: React.FC = () => {
  const { theme, isUniAnimating } = useTheme();
  const [isAppVisible, setIsAppVisible] = useState(true);

  // Monitor visibility state to pause animations when tab/app is backgrounded
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsAppVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Strictly render only when UNI theme is active
  if (theme !== 'UNI') {
    return null;
  }

  const shouldAnimate = isUniAnimating && isAppVisible;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transform-gpu"
      style={{
        // Radial mask: Keep the center content area clear and dark for optimal readability,
        // while allowing the dense, saturated ambient glow to flourish along the viewport perimeter
        maskImage:
          'radial-gradient(ellipse 72% 68% at 50% 50%, transparent 28%, rgba(0, 0, 0, 0.5) 58%, black 100%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 72% 68% at 50% 50%, transparent 28%, rgba(0, 0, 0, 0.5) 58%, black 100%)',
      }}
    >
      {/* Dynamic Hue & Movement Modulation Wrapper */}
      <div className="w-full h-full relative transform-gpu">
        {/* Perimeter Top Edge Ambient Ribbon */}
        <div
          className={`absolute -top-10 left-0 right-0 h-28 sm:h-36 blur-[45px] sm:blur-[65px] opacity-75 mix-blend-screen pointer-events-none transform-gpu ${
            shouldAnimate ? 'gemini-ambient-layer-1' : ''
          }`}
          style={{
            background:
              'linear-gradient(90deg, rgba(147, 51, 234, 0.85) 0%, rgba(236, 72, 153, 0.85) 30%, rgba(6, 182, 212, 0.8) 65%, rgba(16, 185, 129, 0.8) 100%)',
          }}
        />

        {/* Perimeter Bottom Edge Ambient Ribbon */}
        <div
          className={`absolute -bottom-10 left-0 right-0 h-28 sm:h-36 blur-[45px] sm:blur-[65px] opacity-75 mix-blend-screen pointer-events-none transform-gpu ${
            shouldAnimate ? 'gemini-ambient-layer-3' : ''
          }`}
          style={{
            background:
              'linear-gradient(90deg, rgba(245, 158, 11, 0.8) 0%, rgba(239, 68, 68, 0.8) 35%, rgba(168, 85, 247, 0.85) 70%, rgba(59, 130, 246, 0.85) 100%)',
          }}
        />

        {/* Ambient Glow Orb 1 - Top & Top-Left (Deep Purple, Violet & Electric Blue) */}
        <div
          className={`absolute -top-[12vw] -left-[10vw] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full blur-[75px] sm:blur-[105px] opacity-85 mix-blend-screen transform-gpu ${
            shouldAnimate ? 'gemini-ambient-layer-1' : ''
          }`}
          style={{
            background:
              'radial-gradient(circle, rgba(147, 51, 234, 0.95) 0%, rgba(109, 40, 217, 0.8) 35%, rgba(37, 99, 235, 0.5) 70%, transparent 100%)',
          }}
        />

        {/* Ambient Glow Orb 2 - Top-Right & Upper-Right (Electric Blue, Cyan & Deep Teal) */}
        <div
          className={`absolute -top-[10vw] -right-[12vw] w-[56vw] h-[56vw] max-w-[660px] max-h-[660px] rounded-full blur-[75px] sm:blur-[100px] opacity-80 mix-blend-screen transform-gpu ${
            shouldAnimate ? 'gemini-ambient-layer-2' : ''
          }`}
          style={{
            background:
              'radial-gradient(circle, rgba(6, 182, 212, 0.95) 0%, rgba(14, 165, 233, 0.8) 35%, rgba(13, 148, 136, 0.5) 70%, transparent 100%)',
          }}
        />

        {/* Ambient Glow Orb 3 - Bottom-Right & Lower Edge (Emerald, Teal, Sunset Orange & Golden Amber) */}
        <div
          className={`absolute -bottom-[12vw] -right-[8vw] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full blur-[80px] sm:blur-[110px] opacity-80 mix-blend-screen transform-gpu ${
            shouldAnimate ? 'gemini-ambient-layer-3' : ''
          }`}
          style={{
            background:
              'radial-gradient(circle, rgba(16, 185, 129, 0.95) 0%, rgba(13, 148, 136, 0.8) 35%, rgba(245, 158, 11, 0.5) 70%, transparent 100%)',
          }}
        />

        {/* Ambient Glow Orb 4 - Bottom-Left & Lower-Left (Hot Pink, Magenta & Warm Amber) */}
        <div
          className={`absolute -bottom-[10vw] -left-[10vw] w-[58vw] h-[58vw] max-w-[680px] max-h-[680px] rounded-full blur-[75px] sm:blur-[105px] opacity-85 mix-blend-screen transform-gpu ${
            shouldAnimate ? 'gemini-ambient-layer-4' : ''
          }`}
          style={{
            background:
              'radial-gradient(circle, rgba(236, 72, 153, 0.95) 0%, rgba(192, 38, 211, 0.8) 35%, rgba(249, 115, 22, 0.5) 70%, transparent 100%)',
          }}
        />

        {/* Luminous Viewport Perimeter Border Frame */}
        <div
          className={`absolute inset-0 rounded-none border border-purple-500/30 pointer-events-none transition-all duration-700 transform-gpu ${
            shouldAnimate ? 'gemini-ambient-perimeter' : 'opacity-70'
          }`}
          style={{
            boxShadow:
              'inset 0 0 60px rgba(147, 51, 234, 0.25), inset 0 0 25px rgba(6, 182, 212, 0.2), inset 0 0 10px rgba(236, 72, 153, 0.2)',
          }}
        />
      </div>
    </div>
  );
};

export const UniAmbientGlow = React.memo(UniAmbientGlowComponent);
