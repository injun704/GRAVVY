import React, { useState } from 'react';
import {
  HelpCircle,
  Search,
  Truck,
  ShieldCheck,
  CreditCard,
  Sparkles,
  ChevronRight,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { DedicatedPageHeader } from '../common/DedicatedPageHeader';

interface HelpCenterPageProps {
  onBack: () => void;
  onNavigateSupport?: () => void;
}

export const HelpCenterPage: React.FC<HelpCenterPageProps> = ({ onBack, onNavigateSupport }) => {
  const { theme, categoryAccent, textColorPrimary, textColorMuted } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const HELP_TOPICS = [
    {
      icon: <Truck className="w-4 h-4 text-emerald-400" />,
      title: 'Order Tracking & 15-Min Delivery',
      desc: 'How hyper-local dark store routing works and live delivery agent updates.',
    },
    {
      icon: <CreditCard className="w-4 h-4 text-cyan-400" />,
      title: 'Payments, UPI & Refunds',
      desc: 'Instant UPI refunds, tokenized card payments, and COD verification.',
    },
    {
      icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
      title: 'Prescription & Pharmacy Protocols',
      desc: 'Guidelines on uploading doctor prescriptions for Schedule H medicines.',
    },
    {
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      title: 'UNI Dynamic Ambient Theme',
      desc: 'How the chromatic ambient glow adapts smoothly across app categories.',
    },
  ];

  const filteredTopics = HELP_TOPICS.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full space-y-4 pb-24 animate-in fade-in duration-200">
      <DedicatedPageHeader
        title="Help Center"
        onBack={onBack}
      />

      {/* Search Input Form */}
      <div
        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border transition-all ${
          theme === 'LIGHT'
            ? 'bg-white border-stone-200 focus-within:border-amber-400 shadow-xs'
            : 'bg-stone-900/60 border-white/15 focus-within:border-amber-400/50'
        }`}
      >
        <Search className="w-4 h-4 text-stone-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search help topics, refunds, delivery..."
          className={`w-full bg-transparent text-xs focus:outline-none placeholder:text-stone-400 font-medium ${textColorPrimary}`}
        />
      </div>

      {/* Help Topics Grid */}
      <div className="space-y-2.5">
        <h3 className={`text-xs font-bold uppercase tracking-wider px-1 ${textColorMuted}`}>
          Frequently Explored Guides
        </h3>

        <div className="space-y-2.5">
          {filteredTopics.map((topic, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 backdrop-blur-xl ${
                theme === 'LIGHT'
                  ? 'bg-white/80 border-stone-200'
                  : 'bg-stone-900/40 border-white/10'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-stone-500/15 flex items-center justify-center shrink-0 mt-0.5">
                  {topic.icon}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className={`text-xs font-bold ${textColorPrimary}`}>{topic.title}</h4>
                  <p className="text-xs text-stone-400 leading-relaxed">{topic.desc}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 shrink-0 mt-2" />
            </div>
          ))}
        </div>
      </div>

      {/* 24/7 Support Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-400/15 via-orange-400/10 to-transparent border border-amber-400/30 flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-amber-400 block">Still need assistance?</span>
          <span className="text-[11px] text-stone-300">Our customer team is active 24/7 for you.</span>
        </div>
        {onNavigateSupport && (
          <button
            onClick={onNavigateSupport}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer ${categoryAccent.bgClass}`}
          >
            Contact Support
          </button>
        )}
      </div>
    </div>
  );
};
