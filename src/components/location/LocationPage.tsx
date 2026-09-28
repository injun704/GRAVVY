import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  ChevronRight,
  Plus,
  Check,
  ShieldCheck,
  Clock,
  Home,
  Building,
  Briefcase,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLocation } from '../../context/LocationContext';
import { DedicatedPageHeader } from '../common/DedicatedPageHeader';
import { InteractiveGoogleMap } from './InteractiveGoogleMap';
import { ManualPinLocationFlow } from './ManualPinLocationFlow';
import { DeliveryAddress } from '../../types';

interface LocationPageProps {
  onBack: () => void;
  onNavigateToAddresses: () => void;
}

export const LocationPage: React.FC<LocationPageProps> = ({
  onBack,
  onNavigateToAddresses,
}) => {
  const { theme, categoryAccent, textColorPrimary, textColorMuted } = useTheme();
  const {
    activeAddress,
    savedAddresses,
    setActiveAddress,
    detectCurrentLocation,
    isDetectingLocation,
    verifyPinCode,
  } = useLocation();

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
  const [isManualFlowOpen, setIsManualFlowOpen] = useState(false);

  if (isManualFlowOpen) {
    return (
      <ManualPinLocationFlow
        onBack={() => setIsManualFlowOpen(false)}
        onComplete={() => setIsManualFlowOpen(false)}
      />
    );
  }

  // Verify active address serviceability
  const serviceInfo = verifyPinCode(activeAddress.pinCode || '');

  // Handle GPS location detection
  const handleFindYourLocation = async () => {
    setStatusMessage(null);
    const result = await detectCurrentLocation();
    if (result.success) {
      setStatusType('success');
      setStatusMessage(result.message);
    } else {
      setStatusType('error');
      setStatusMessage(result.message);
    }
  };

  // Compute map embed URL based on active address
  const mapQuery = encodeURIComponent(
    `${activeAddress.street}, ${activeAddress.area}, ${activeAddress.city} ${activeAddress.pinCode}`
  );
  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="w-full space-y-3 pb-24 animate-in fade-in duration-200 max-w-xl mx-auto">
      {/* 1. Dedicated Header with Seamless Transparent Pattern */}
      <DedicatedPageHeader
        title="Location"
        onBack={onBack}
        subtitle="Delivery address & serviceability"
      />

      {/* 2. Compact Google Maps Area */}
      <div
        className={`rounded-2xl border overflow-hidden transition-all shadow-xs relative ${
          theme === 'LIGHT'
            ? 'bg-white border-stone-200'
            : theme === 'DARK'
            ? 'bg-stone-900 border-white/10'
            : 'bg-stone-950 border-white/15'
        }`}
      >
        <InteractiveGoogleMap
          activeAddress={activeAddress}
          serviceable={serviceInfo.serviceable}
        />

        {/* Selected Address Info Summary Below Map */}
        <div className="p-3 border-t border-stone-500/10 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {activeAddress.tag} · {activeAddress.name}
            </span>
            <span className="text-[10.5px] font-mono text-stone-400">
              PIN: {activeAddress.pinCode}
            </span>
          </div>
          <p className={`text-xs leading-snug font-medium ${textColorPrimary}`}>
            {activeAddress.street}, {activeAddress.area}, {activeAddress.city}
          </p>
          <div className="flex items-center gap-2 pt-0.5 text-[11px] text-stone-400">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>Estimated Delivery: 15–20 Mins</span>
          </div>
        </div>
      </div>

      {/* Status Notification Message if any */}
      {statusMessage && (
        <div
          className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 border transition-all ${
            statusType === 'success'
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : statusType === 'error'
              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
              : 'bg-amber-400/15 text-amber-300 border-amber-400/30'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{statusMessage}</span>
        </div>
      )}

      {/* 3. Primary Compact Actions: "Find your location" & "Manually add my location" */}
      <div className="space-y-2">
        {/* Action 1: "Find your location" (Device GPS) */}
        <button
          type="button"
          onClick={handleFindYourLocation}
          disabled={isDetectingLocation}
          className={`w-full py-2.5 px-3.5 rounded-2xl border font-bold text-xs transition-all flex items-center justify-between shadow-2xs active:scale-95 cursor-pointer ${
            theme === 'LIGHT'
              ? 'bg-amber-50 hover:bg-amber-100/80 border-amber-300/80 text-amber-950'
              : 'bg-amber-400/10 hover:bg-amber-400/20 border-amber-400/30 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shrink-0">
              <Navigation className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
            </div>
            <div className="text-left min-w-0">
              <span className="block text-xs font-black">Find your location</span>
              <span className="block text-[10.5px] opacity-80 truncate">
                {isDetectingLocation ? 'Detecting current device coordinates...' : 'Auto-detect using device GPS'}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-500 shrink-0" />
        </button>

        {/* Action 2: "Manually add my location" (Opens dedicated PIN -> Google Maps flow) */}
        <button
          type="button"
          onClick={() => setIsManualFlowOpen(true)}
          className={`w-full py-2.5 px-3.5 rounded-2xl border font-bold text-xs transition-all flex items-center justify-between shadow-2xs active:scale-95 cursor-pointer ${
            theme === 'LIGHT'
              ? 'bg-white hover:bg-stone-100 border-stone-200 text-stone-800'
              : 'bg-stone-900/80 hover:bg-stone-800 border-white/10 text-stone-200'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center shrink-0">
              <Plus className="w-3.5 h-3.5" />
            </div>
            <div className="text-left min-w-0">
              <span className="block text-xs font-black">Manually add my location</span>
              <span className="block text-[10.5px] text-stone-400 truncate">
                Manage saved addresses or add a new delivery address
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
        </button>
      </div>

      {/* 4. Compact Saved Delivery Addresses List */}
      <div
        className={`p-3 rounded-2xl border transition-all space-y-2.5 ${
          theme === 'LIGHT'
            ? 'bg-white/90 border-stone-200 shadow-2xs'
            : theme === 'DARK'
            ? 'bg-stone-900/60 border-white/10'
            : 'bg-stone-950/40 border-white/15'
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone-500/10 pb-1.5">
          <h3 className={`text-[11px] font-bold uppercase tracking-wider ${textColorMuted}`}>
            Saved Addresses ({savedAddresses.length})
          </h3>
          <button
            type="button"
            onClick={onNavigateToAddresses}
            className="text-[11px] font-bold text-amber-500 hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>Manage</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2">
          {savedAddresses.map((addr) => {
            const isSelected = activeAddress.id === addr.id;
            return (
              <div
                key={addr.id}
                onClick={() => setActiveAddress(addr)}
                className={`p-2.5 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 bg-amber-400/10 text-amber-300 shadow-xs ring-1 ring-amber-400/30'
                    : 'border-stone-500/15 bg-stone-500/5 text-stone-300 hover:border-stone-500/30'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected
                      ? 'bg-amber-400 text-stone-950 font-bold'
                      : 'bg-stone-500/20 text-stone-400'
                  }`}
                >
                  {addr.tag === 'Home' ? (
                    <Home className="w-3.5 h-3.5" />
                  ) : addr.tag === 'Work' ? (
                    <Briefcase className="w-3.5 h-3.5" />
                  ) : (
                    <Building className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      {addr.tag}
                      {addr.isDefault && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-500 border border-amber-400/30">
                          Default
                        </span>
                      )}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-stone-400 truncate leading-snug mt-0.5">
                    {addr.street}, {addr.area}, {addr.city} - {addr.pinCode}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
