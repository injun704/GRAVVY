import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { DedicatedPageHeader } from '../common/DedicatedPageHeader';

interface ContactUsPageProps {
  onBack: () => void;
}

export const ContactUsPage: React.FC<ContactUsPageProps> = ({ onBack }) => {
  const { theme, categoryAccent, textColorPrimary, textColorMuted } = useTheme();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setToastMessage('Your inquiry has been submitted. Our team will contact you within 2 business hours.');
    setSubject('');
    setMessage('');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="w-full space-y-4 pb-24 animate-in fade-in duration-200">
      <DedicatedPageHeader
        title="Contact Us"
        onBack={onBack}
      />

      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-stone-900 border border-amber-400/40 text-white text-xs font-bold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-3.5 h-3.5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Corporate Information */}
      <div
        className={`p-4 rounded-2xl sm:rounded-3xl border transition-all space-y-3 backdrop-blur-xl ${
          theme === 'LIGHT' ? 'bg-white/80 border-stone-200' : 'bg-stone-900/40 border-white/10'
        }`}
      >
        <div className="flex items-start gap-3 text-xs">
          <MapPin className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <span className={`font-bold block ${textColorPrimary}`}>GRAVVY Hyperlocal Logistics Private Limited</span>
            <span className="text-stone-400">Cyber City Tech Park, Tower B, Sector 24, Gurugram, NCR 122002</span>
          </div>
        </div>

        <div className="flex items-start gap-3 text-xs">
          <Phone className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <span className={`font-bold block ${textColorPrimary}`}>Customer Hotline (24/7)</span>
            <span className="text-stone-400">1800-GRAVVY-FAST / +91 1800-472-889</span>
          </div>
        </div>

        <div className="flex items-start gap-3 text-xs">
          <Mail className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
          <div>
            <span className={`font-bold block ${textColorPrimary}`}>Official Inquiries</span>
            <span className="text-stone-400">support@gravvy.delivery · partners@gravvy.delivery</span>
          </div>
        </div>
      </div>

      {/* Send Message Form */}
      <div
        className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all backdrop-blur-xl ${
          theme === 'LIGHT' ? 'bg-white/80 border-stone-200' : 'bg-stone-900/40 border-white/10'
        }`}
      >
        <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${textColorMuted}`}>
          Send Direct Inquiry
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className={`block text-[11px] font-bold uppercase mb-1 ${textColorMuted}`}>
              Inquiry Subject
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Order query, Partnership proposal, Feedback"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-500/10 border border-stone-500/20 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className={`block text-[11px] font-bold uppercase mb-1 ${textColorMuted}`}>
              Your Message
            </label>
            <textarea
              required
              rows={4}
              placeholder="Please provide order ID or details..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-500/10 border border-stone-500/20 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer ${categoryAccent.bgClass}`}
            >
              <Send className="w-3.5 h-3.5 text-stone-950" />
              <span className="text-stone-950 font-black">Submit Inquiry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
