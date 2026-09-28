import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Check,
  Home,
  Briefcase,
  Compass,
  Navigation,
  X,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { DeliveryAddress } from '../../types';
import { DedicatedPageHeader } from '../common/DedicatedPageHeader';
import { ManualPinLocationFlow } from '../location/ManualPinLocationFlow';

interface SavedAddressesPageProps {
  onBack: () => void;
  onSelectAddress?: (address: DeliveryAddress) => void;
}

export const SavedAddressesPage: React.FC<SavedAddressesPageProps> = ({ onBack, onSelectAddress }) => {
  const { theme, categoryAccent, textColorPrimary, textColorMuted } = useTheme();
  const { user } = useAuth();
  const {
    savedAddresses,
    activeAddress,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
    detectCurrentLocation,
    isDetectingLocation,
  } = useLocation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isManualFlowOpen, setIsManualFlowOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [tag, setTag] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [pinCode, setPinCode] = useState('560038');
  const [landmark, setLandmark] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (isManualFlowOpen) {
    return (
      <ManualPinLocationFlow
        onBack={() => setIsManualFlowOpen(false)}
        onComplete={() => setIsManualFlowOpen(false)}
      />
    );
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleOpenAddForm = () => {
    setIsManualFlowOpen(true);
  };

  const handleOpenEditForm = (addr: DeliveryAddress) => {
    setEditingId(addr.id);
    setTag(addr.tag);
    setName(addr.name);
    setPhone(addr.phone);
    setStreet(addr.street);
    setArea(addr.area);
    setCity(addr.city);
    setPinCode(addr.pinCode);
    setLandmark(addr.landmark || '');
    setIsDefault(addr.isDefault || false);
    setIsFormOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!street.trim() || !area.trim() || !pinCode.trim()) {
      showToast('Please fill all required fields');
      return;
    }

    if (editingId) {
      updateAddress(editingId, {
        tag,
        name,
        phone,
        street,
        area,
        city,
        pinCode,
        landmark,
        isDefault,
      });
      showToast('Address updated successfully');
    } else {
      addAddress({
        tag,
        name,
        phone,
        street,
        area,
        city,
        pinCode,
        landmark,
        isDefault,
      });
      showToast('New address saved');
    }

    setIsFormOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savedAddresses.length <= 1) {
      showToast('At least one address must be kept');
      return;
    }
    removeAddress(id);
    showToast('Address removed');
  };

  const handleDetectGPS = async () => {
    const res = await detectCurrentLocation();
    showToast(res.message);
  };

  return (
    <div className="w-full space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <DedicatedPageHeader
        title="Saved Address"
        onBack={onBack}
        itemCount={savedAddresses.length}
        rightAction={
          !isFormOpen ? (
            <button
              onClick={handleOpenAddForm}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-400 text-stone-950 hover:brightness-105 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New</span>
            </button>
          ) : null
        }
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-stone-900 border border-amber-400/40 text-white text-xs font-bold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-3.5 h-3.5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* GPS Location Quick Button */}
      <div className="flex items-center justify-between p-3 rounded-2xl border border-dashed border-amber-400/40 bg-amber-400/5">
        <div className="flex items-center gap-2.5">
          <Navigation className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-amber-400 block">Use Current GPS Location</span>
            <span className="text-[10px] text-stone-400">Detect device coordinates automatically</span>
          </div>
        </div>
        <button
          onClick={handleDetectGPS}
          disabled={isDetectingLocation}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400/20 text-amber-400 hover:bg-amber-400/30 border border-amber-400/30 transition-all cursor-pointer"
        >
          {isDetectingLocation ? 'Detecting...' : 'Detect'}
        </button>
      </div>

      {/* Add / Edit Form Modal or Panel */}
      {isFormOpen && (
        <div
          className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all backdrop-blur-xl shadow-lg ${
            theme === 'LIGHT'
              ? 'bg-white border-stone-200 shadow-sm'
              : 'bg-stone-900/90 border-white/20 shadow-2xl'
          }`}
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-500/15">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${textColorMuted}`}>
              {editingId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
            </h3>
            <button
              onClick={() => setIsFormOpen(false)}
              className="p-1 rounded-lg text-stone-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-3 text-xs">
            {/* Tag Selection */}
            <div>
              <label className={`block text-[11px] font-bold uppercase mb-1 ${textColorMuted}`}>
                Address Label
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Home', 'Work', 'Other'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTag(t)}
                    className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      tag === t
                        ? 'bg-amber-400/20 text-amber-400 border-amber-400/50 shadow-xs'
                        : 'bg-stone-500/10 text-stone-400 border-stone-500/20 hover:bg-stone-500/15'
                    }`}
                  >
                    {t === 'Home' && <Home className="w-3.5 h-3.5" />}
                    {t === 'Work' && <Briefcase className="w-3.5 h-3.5" />}
                    {t === 'Other' && <Compass className="w-3.5 h-3.5" />}
                    <span>{t}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className={`block text-[11px] font-bold uppercase mb-1 ${textColorMuted}`}>
                  Contact Person Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-500/10 border border-stone-500/20 focus:outline-none focus:border-amber-400 text-stone-100"
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold uppercase mb-1 ${textColorMuted}`}>
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-500/10 border border-stone-500/20 focus:outline-none focus:border-amber-400 text-stone-100"
                />
              </div>
            </div>

            <div>
              <label className={`block text-[11px] font-bold uppercase mb-1 ${textColorMuted}`}>
                Flat / House No. / Building / Street
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Flat 402, Royal Palms Residency"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-500/10 border border-stone-500/20 focus:outline-none focus:border-amber-400 text-stone-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className={`block text-[11px] font-bold uppercase mb-1 ${textColorMuted}`}>
                  Area / Locality
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indiranagar"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-500/10 border border-stone-500/20 focus:outline-none focus:border-amber-400 text-stone-100"
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold uppercase mb-1 ${textColorMuted}`}>
                  City
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-500/10 border border-stone-500/20 focus:outline-none focus:border-amber-400 text-stone-100"
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold uppercase mb-1 ${textColorMuted}`}>
                  PIN Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-500/10 border border-stone-500/20 focus:outline-none focus:border-amber-400 text-stone-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label className={`block text-[11px] font-bold uppercase mb-1 ${textColorMuted}`}>
                Landmark (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Near Metro Station Pillar 42"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-500/10 border border-stone-500/20 focus:outline-none focus:border-amber-400 text-stone-100"
              />
            </div>

            {/* Set Default Toggle */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isDefault"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 rounded text-amber-400 accent-amber-400 cursor-pointer"
              />
              <label htmlFor="isDefault" className="text-xs text-stone-300 font-medium cursor-pointer">
                Make this my default delivery address
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-500/15">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-stone-500/20 text-stone-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-5 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all shadow-md cursor-pointer ${categoryAccent.bgClass}`}
              >
                {editingId ? 'Update Address' : 'Save Address'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address List */}
      <div className="space-y-3">
        {savedAddresses.map((addr) => {
          const isSelectedDefault = addr.isDefault || activeAddress.id === addr.id;

          return (
            <div
              key={addr.id}
              onClick={() => {
                setDefaultAddress(addr.id);
                if (onSelectAddress) {
                  onSelectAddress(addr);
                  onBack();
                }
              }}
              className={`p-4 rounded-2xl sm:rounded-3xl border transition-all cursor-pointer backdrop-blur-xl group relative ${
                isSelectedDefault
                  ? 'bg-amber-400/10 border-amber-400/40 shadow-sm'
                  : theme === 'LIGHT'
                  ? 'bg-white/80 border-stone-200 hover:border-stone-300'
                  : 'bg-stone-900/40 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      addr.tag === 'Home'
                        ? 'bg-blue-500/15 text-blue-400'
                        : addr.tag === 'Work'
                        ? 'bg-purple-500/15 text-purple-400'
                        : 'bg-emerald-500/15 text-emerald-400'
                    }`}
                  >
                    {addr.tag === 'Home' && <Home className="w-4 h-4" />}
                    {addr.tag === 'Work' && <Briefcase className="w-4 h-4" />}
                    {addr.tag === 'Other' && <Compass className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold ${textColorPrimary}`}>
                        {addr.tag} · {addr.name}
                      </span>
                      {isSelectedDefault && (
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" />
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">{addr.street}, {addr.area}</p>
                    <p className="text-[11px] text-stone-400">
                      {addr.city} - <span className="font-mono font-bold text-stone-300">{addr.pinCode}</span>
                    </p>
                    <p className="text-[11px] text-stone-400">Phone: {addr.phone}</p>
                  </div>
                </div>

                {/* Edit & Delete Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditForm(addr);
                    }}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-amber-400 hover:bg-stone-500/15 transition-all cursor-pointer"
                    title="Edit address"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(addr.id, e)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-stone-500/15 transition-all cursor-pointer"
                    title="Delete address"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
