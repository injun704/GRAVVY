import React, { useState } from 'react';
import { MapPin, Navigation, Plus, Check, X, Building, Home, MapPinOff } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useTheme } from '../../context/ThemeContext';
import { DeliveryAddress } from '../../types';
import { GoogleLocationPickerMap } from '../maps/GoogleLocationPickerMap';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const { activeAddress, savedAddresses, setActiveAddress, addAddress, detectCurrentLocation, isDetectingLocation, verifyPinCode } = useLocation();
  const { theme, categoryAccent, textColorPrimary, textColorSecondary, textColorMuted } = useTheme();

  const [pinInput, setPinInput] = useState('');
  const [pinStatus, setPinStatus] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newTag, setNewTag] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [newStreet, setNewStreet] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newCity, setNewCity] = useState('Bengaluru');
  const [newPin, setNewPin] = useState('560038');

  if (!isOpen) return null;

  const handleDetectGPS = async () => {
    const res = await detectCurrentLocation();
    if (res.success) {
      onClose();
    } else {
      setPinStatus(res.message);
    }
  };

  const handleVerifyPin = () => {
    const res = verifyPinCode(pinInput);
    if (res.serviceable) {
      const pinAddress: DeliveryAddress = {
        id: `addr-pin-${Date.now()}`,
        tag: 'Other',
        name: activeAddress.name || 'Alex Sharma',
        phone: activeAddress.phone || '+91 98765 43210',
        street: `PIN Code Area ${pinInput}`,
        area: `${res.city} Delivery Hub`,
        city: res.city,
        pinCode: pinInput,
      };
      addAddress(pinAddress);
      setActiveAddress(pinAddress);
      setPinStatus(`Delivery available! Estimated arrival: ${res.estimatedMinutes} mins.`);
      setTimeout(() => onClose(), 800);
    } else {
      setPinStatus('Invalid PIN code. Please enter a valid 6-digit postal code.');
    }
  };

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet || !newArea || !newPin) return;
    addAddress({
      tag: newTag,
      name: activeAddress.name || 'Alex Sharma',
      phone: activeAddress.phone || '+91 98765 43210',
      street: newStreet,
      area: newArea,
      city: newCity,
      pinCode: newPin,
      isDefault: true,
    });
    setShowAddForm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl relative max-h-[90vh] overflow-y-auto ${
          theme === 'LIGHT'
            ? 'bg-white border-stone-200'
            : theme === 'DARK'
            ? 'bg-neutral-900 border-neutral-800'
            : 'bg-stone-900 border-white/20'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-200 rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className={`text-xl font-bold font-display ${textColorPrimary}`}>
          Choose Delivery Location
        </h3>
        <p className="text-xs text-stone-400 mt-1 mb-5">
          Select an address to see food, grocery, and pharmacy delivery estimates
        </p>

        {/* GPS Button */}
        <button
          onClick={handleDetectGPS}
          disabled={isDetectingLocation}
          className={`w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl font-semibold text-sm transition-all border ${
            theme === 'LIGHT'
              ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900'
              : 'bg-amber-400/10 hover:bg-amber-400/20 border-amber-400/30 text-amber-300'
          }`}
        >
          <Navigation className={`w-4 h-4 ${isDetectingLocation ? 'animate-spin' : ''}`} />
          {isDetectingLocation ? 'Detecting current GPS coordinates...' : 'Use Current GPS Location'}
        </button>

        {/* PIN Code Verification */}
        <div className="mt-4 pt-4 border-t border-stone-500/15">
          <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${textColorMuted}`}>
            Or Check by PIN Code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 560038 or 110001"
              className={`flex-1 px-3.5 py-2 rounded-xl text-sm border focus:outline-none ${
                theme === 'LIGHT'
                  ? 'bg-stone-50 border-stone-200 text-stone-900'
                  : 'bg-black/30 border-white/15 text-white'
              }`}
            />
            <button
              onClick={handleVerifyPin}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${categoryAccent.bgClass}`}
            >
              Verify
            </button>
          </div>
          {pinStatus && (
            <p className="mt-1.5 text-xs text-amber-500 font-medium">{pinStatus}</p>
          )}
        </div>

        {/* Saved Addresses List */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${textColorMuted}`}>
              Saved Delivery Addresses
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`flex items-center gap-1 text-xs font-semibold ${categoryAccent.textClass}`}
            >
              <Plus className="w-3.5 h-3.5" /> Add New
            </button>
          </div>

          <div className="space-y-2.5">
            {savedAddresses.map((addr) => {
              const isSelected = activeAddress.id === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => {
                    setActiveAddress(addr);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? theme === 'LIGHT'
                        ? 'border-amber-500 bg-amber-50/60 shadow-sm'
                        : 'border-amber-400 bg-amber-400/10'
                      : theme === 'LIGHT'
                      ? 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                      : 'border-white/10 hover:border-white/20 bg-white/5'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-stone-500/10 shrink-0 text-stone-400">
                    {addr.tag === 'Home' ? (
                      <Home className="w-4 h-4 text-amber-500" />
                    ) : addr.tag === 'Work' ? (
                      <Building className="w-4 h-4 text-sky-500" />
                    ) : (
                      <MapPin className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md bg-stone-500/20 ${textColorPrimary}`}>
                        {addr.tag}
                      </span>
                      {isSelected && (
                        <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>
                    <p className={`text-xs font-medium mt-1 truncate ${textColorPrimary}`}>
                      {addr.street}
                    </p>
                    <p className="text-[11px] text-stone-400">
                      {addr.area}, {addr.city} - {addr.pinCode}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add New Address Form Modal Drawer */}
        {showAddForm && (
          <form onSubmit={handleSaveNewAddress} className="mt-5 p-4 rounded-2xl bg-black/20 border border-stone-500/20 space-y-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${textColorPrimary}`}>
              Pin Location on Google Maps
            </h4>

            {/* Google Maps Location Picker */}
            <GoogleLocationPickerMap
              initialStreet={newStreet}
              onSelectLocation={(loc) => {
                setNewStreet(loc.street);
                setNewCity(loc.city);
                setNewArea(loc.area);
              }}
            />

            <div className="flex gap-2 pt-1">
              {(['Home', 'Work', 'Other'] as const).map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => setNewTag(tag)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                    newTag === tag
                      ? categoryAccent.bgClass
                      : 'border-stone-500/20 text-stone-400'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <input
              type="text"
              required
              placeholder="Flat / House / Street"
              value={newStreet}
              onChange={(e) => setNewStreet(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg text-xs bg-stone-500/10 border border-stone-500/20 text-white focus:outline-none"
            />
            <input
              type="text"
              required
              placeholder="Area / Colony / Landmark"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg text-xs bg-stone-500/10 border border-stone-500/20 text-white focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="City"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg text-xs bg-stone-500/10 border border-stone-500/20 text-white focus:outline-none"
              />
              <input
                type="text"
                required
                maxLength={6}
                placeholder="6-Digit PIN Code"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg text-xs bg-stone-500/10 border border-stone-500/20 text-white focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-stone-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-1.5 rounded-lg text-xs font-bold ${categoryAccent.bgClass}`}
              >
                Save & Set Active
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
