import React from 'react';
import { Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export type CheckoutStepIndex = 1 | 2 | 3 | 4;

interface StepConfig {
  step: CheckoutStepIndex;
  label: string;
  shortLabel?: string;
  id: 'order-summary' | 'delivery-instructions' | 'payment' | 'orders' | 'confirmation';
}

const STEPS: StepConfig[] = [
  { step: 1, label: 'Order Summary', shortLabel: 'Summary', id: 'order-summary' },
  { step: 2, label: 'Instructions', shortLabel: 'Instructions', id: 'delivery-instructions' },
  { step: 3, label: 'Payment', shortLabel: 'Payment', id: 'payment' },
  { step: 4, label: 'My Orders', shortLabel: 'My Orders', id: 'orders' },
];

interface CheckoutProgressTrackerProps {
  currentStep: CheckoutStepIndex;
  onNavigateStep?: (stepId: 'order-summary' | 'delivery-instructions' | 'payment' | 'orders') => void;
}

export const CheckoutProgressTracker: React.FC<CheckoutProgressTrackerProps> = ({
  currentStep,
  onNavigateStep,
}) => {
  const { theme } = useTheme();

  return (
    <div
      aria-label="Checkout Progress"
      className={`w-full py-2.5 px-3 sm:px-4 rounded-2xl border backdrop-blur-xl transition-all ${
        theme === 'LIGHT'
          ? 'bg-white/90 border-stone-200/90 shadow-2xs'
          : theme === 'DARK'
          ? 'bg-stone-900/70 border-white/10'
          : 'bg-stone-950/50 border-white/15'
      }`}
    >
      <div className="relative flex items-center justify-between max-w-md mx-auto">
        {/* Connecting Lines Behind Circles */}
        <div className="absolute top-[13px] left-5 right-5 h-[2px] -translate-y-1/2 z-0 bg-stone-700/30">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 ease-out"
            style={{
              width:
                currentStep === 1
                  ? '0%'
                  : currentStep === 2
                  ? '33.33%'
                  : currentStep === 3
                  ? '66.66%'
                  : '100%',
            }}
          />
        </div>

        {/* Steps */}
        {STEPS.map((s) => {
          const isCompleted = s.step < currentStep || (currentStep === 4 && s.step === 4);
          const isCurrent = s.step === currentStep && currentStep !== 4;
          const isUpcoming = s.step > currentStep;
          const isClickable = Boolean(onNavigateStep && s.step <= currentStep && s.step < 4);

          return (
            <button
              key={s.step}
              type="button"
              disabled={!isClickable}
              onClick={() => {
                if (isClickable && onNavigateStep) {
                  onNavigateStep(s.id as any);
                }
              }}
              className={`relative z-10 flex flex-col items-center group focus:outline-none transition-transform ${
                isClickable ? 'cursor-pointer active:scale-95' : 'cursor-default'
              }`}
            >
              {/* Circle Indicator */}
              <div
                className={`w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-200 ${
                  isCompleted
                    ? 'bg-emerald-500 text-white shadow-xs shadow-emerald-500/30 ring-2 ring-emerald-500/20'
                    : isCurrent
                    ? 'bg-amber-400 text-stone-950 ring-3 ring-amber-400/35 shadow-xs font-black'
                    : theme === 'LIGHT'
                    ? 'bg-stone-200 text-stone-500 border border-stone-300'
                    : 'bg-stone-800 text-stone-400 border border-stone-700'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <span>{s.step}</span>
                )}
              </div>

              {/* Step Label */}
              <span
                className={`mt-1.5 text-[10px] sm:text-[11px] font-bold leading-none tracking-tight transition-colors whitespace-nowrap ${
                  isCompleted
                    ? 'text-emerald-400'
                    : isCurrent
                    ? theme === 'LIGHT'
                      ? 'text-stone-900 font-extrabold'
                      : 'text-amber-400 font-extrabold'
                    : theme === 'LIGHT'
                    ? 'text-stone-400 font-medium'
                    : 'text-stone-500 font-medium'
                }`}
              >
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.shortLabel || s.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
