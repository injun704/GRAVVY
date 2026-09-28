import React from 'react';
import { ShieldCheck, FileText, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { DedicatedPageHeader } from '../common/DedicatedPageHeader';

interface LegalPageProps {
  type: 'privacy' | 'terms' | 'about';
  onBack: () => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ type, onBack }) => {
  const { theme, textColorPrimary, textColorMuted } = useTheme();

  const title =
    type === 'privacy'
      ? 'Privacy Policy'
      : type === 'terms'
      ? 'Terms & Conditions'
      : 'About GRAVVY';

  return (
    <div className="w-full space-y-4 pb-24 animate-in fade-in duration-200">
      <DedicatedPageHeader
        title={title}
        onBack={onBack}
      />

      <div
        className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all space-y-4 backdrop-blur-xl ${
          theme === 'LIGHT' ? 'bg-white/80 border-stone-200' : 'bg-stone-900/40 border-white/10'
        }`}
      >
        {type === 'privacy' && (
          <div className="space-y-3 text-xs text-stone-300 leading-relaxed">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Data Protection & Encryption Standard</span>
            </div>
            <p>
              GRAVVY prioritizes user data privacy. All customer profile information, delivery addresses,
              and order history are protected with 256-bit AES database encryption.
            </p>
            <h4 className={`text-xs font-bold ${textColorPrimary}`}>1. Payment Data Security</h4>
            <p>
              We comply with RBI tokenization directives and PCI-DSS requirements. GRAVVY does NOT store raw
              credit or debit card CVVs or complete account numbers.
            </p>
            <h4 className={`text-xs font-bold ${textColorPrimary}`}>2. Location Tracking</h4>
            <p>
              Precise GPS coordinates are requested strictly during checkout to route your delivery rider to
              the exact building drop point. Location data is never sold to third parties.
            </p>
          </div>
        )}

        {type === 'terms' && (
          <div className="space-y-3 text-xs text-stone-300 leading-relaxed">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <FileText className="w-4 h-4" />
              <span>User Agreement & Service Protocols</span>
            </div>
            <p>
              By accessing GRAVVY or placing multi-category food, grocery, or pharmacy orders, you agree
              to our service terms and fulfillment terms.
            </p>
            <h4 className={`text-xs font-bold ${textColorPrimary}`}>1. Order Fulfillment & ETA</h4>
            <p>
              Delivery estimates (15-25 minutes) are computed dynamically from dark store proximity, prep
              time, and real-time traffic conditions.
            </p>
            <h4 className={`text-xs font-bold ${textColorPrimary}`}>2. Refunds & Replacements</h4>
            <p>
              In the unlikely event of item damage, expiry issues, or transit delays, customers can request
              an immediate replacement or UPI refund.
            </p>
          </div>
        )}

        {type === 'about' && (
          <div className="space-y-3 text-xs text-stone-300 leading-relaxed">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>GRAVVY Hyperlocal Multi-Category Platform</span>
            </div>
            <p>
              <strong>GRAVVY</strong> is built with React 19, TypeScript, Tailwind CSS, Supabase, and Android Capacitor.
            </p>
            <p>
              Features the signature <strong>Dynamic UNI Theme</strong> with vibrant chromatic ambient perimeter glow,
              smart typo-tolerant search across Food, Grocery, and Medicine, focused 2-image product galleries,
              and seamless e-commerce purchase flows.
            </p>
            <div className="pt-2 border-t border-stone-500/15 flex items-center justify-between text-[11px] font-mono text-stone-400">
              <span>App Version: 2.2.0-PROD</span>
              <span>Build: 2026.09 (Flipkart-Style Dedicated Routing)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
