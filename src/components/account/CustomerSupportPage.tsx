import React, { useState } from 'react';
import {
  Headphones,
  Phone,
  MessageSquare,
  Mail,
  Send,
  CheckCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { DedicatedPageHeader } from '../common/DedicatedPageHeader';

interface CustomerSupportPageProps {
  onBack: () => void;
}

export const CustomerSupportPage: React.FC<CustomerSupportPageProps> = ({ onBack }) => {
  const { theme, categoryAccent, textColorPrimary, textColorMuted } = useTheme();

  const [chatMessages, setChatMessages] = useState<{ sender: 'agent' | 'user'; text: string; time: string }[]>([
    {
      sender: 'agent',
      text: 'Namaste! Welcome to GRAVVY Support. How can we assist with your delivery or order today?',
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    const newMsg = {
      sender: 'user' as const,
      text: userMsg,
      time: 'Just now',
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulated quick agent reply
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: `Thank you for reaching out regarding "${userMsg}". Your ticket #GRV-${Math.floor(1000 + Math.random() * 9000)} is prioritized with an executive.`,
          time: 'Just now',
        },
      ]);
    }, 1000);
  };

  return (
    <div className="w-full space-y-4 pb-24 animate-in fade-in duration-200">
      <DedicatedPageHeader
        title="Customer Support"
        onBack={onBack}
      />

      {/* Support Direct Contacts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div
          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
            theme === 'LIGHT' ? 'bg-white/80 border-stone-200' : 'bg-stone-900/40 border-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className={`text-xs font-bold block ${textColorPrimary}`}>Toll-Free Helpline</span>
              <span className="text-[11px] text-stone-400">1800-GRAVVY-FAST (24/7)</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            Active
          </span>
        </div>

        <div
          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
            theme === 'LIGHT' ? 'bg-white/80 border-stone-200' : 'bg-stone-900/40 border-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className={`text-xs font-bold block ${textColorPrimary}`}>Support Email</span>
              <span className="text-[11px] text-stone-400">support@gravvy.delivery</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
            Online
          </span>
        </div>
      </div>

      {/* Live Chat Box */}
      <div
        className={`p-4 rounded-2xl sm:rounded-3xl border transition-all flex flex-col space-y-3 backdrop-blur-xl ${
          theme === 'LIGHT' ? 'bg-white/90 border-stone-200' : 'bg-stone-900/60 border-white/15'
        }`}
      >
        <div className="flex items-center justify-between pb-2 border-b border-stone-500/15">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className={`text-xs font-bold ${textColorPrimary}`}>Live Assistant Chat</span>
          </div>
          <span className="text-[10px] text-stone-400">Avg response: &lt; 1 min</span>
        </div>

        {/* Chat History */}
        <div className="space-y-2.5 max-h-[35vh] overflow-y-auto pr-1 text-xs">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-amber-400 text-stone-950 font-medium rounded-br-xs'
                    : theme === 'LIGHT'
                    ? 'bg-stone-100 text-stone-800 rounded-bl-xs'
                    : 'bg-white/10 text-stone-100 rounded-bl-xs'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[9px] text-stone-400 mt-0.5 px-1">{msg.time}</span>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2 border-t border-stone-500/15">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your question here..."
            className={`flex-1 px-3.5 py-2 rounded-xl text-xs border focus:outline-none transition-all ${
              theme === 'LIGHT'
                ? 'bg-stone-50 border-stone-200 text-stone-900 focus:border-amber-400'
                : 'bg-stone-900 border-white/15 text-white focus:border-amber-400'
            }`}
          />
          <button
            type="submit"
            className={`p-2 rounded-xl text-stone-950 font-bold active:scale-95 transition-all cursor-pointer ${categoryAccent.bgClass}`}
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
