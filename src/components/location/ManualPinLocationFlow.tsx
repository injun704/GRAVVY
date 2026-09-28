import React, { useState, useRef, useCallback } from 'react';
import {
  MapPin,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Home,
  Briefcase,
  Building,
  ShieldCheck,
  Check,
  Compass,
  AlertTriangle,
} from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { useTheme } from '../../context/ThemeContext';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { DedicatedPageHeader } from '../common/DedicatedPageHeader';

interface ManualPinLocationFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

type FlowStep = 'pin' | 'loading' | 'map' | 'details';

export const ManualPinLocationFlow: React.FC<ManualPinLocationFlowProps> = ({
  onBack,
  onComplete,
}) => {
  const { theme, categoryAccent, textColorPrimary, textColorMuted } = useTheme();
  const { addAddress } = useLocation();
  const { user } = useAuth();

  const apiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const [step, setStep] = useState<FlowStep>('pin');
  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Real Google Maps Geocoding & Marker state
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(null);
  const [formattedAddress, setFormattedAddress] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [stateName, setStateName] = useState('');
  const [placeId, setPlaceId] = useState<string | undefined>(undefined);

  // Detected PIN code during reverse geocoding
  const [detectedPinCode, setDetectedPinCode] = useState<string | null>(null);
  const [isPinMismatch, setIsPinMismatch] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Final address form state
  const [tag, setTag] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [house, setHouse] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [formError, setFormError] = useState<string | null>(null);

  const reverseGeocodeTimer = useRef<NodeJS.Timeout | null>(null);

  // Handle PIN input change with strict 6-digit numeric filter
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPinCode(raw);
    setPinError(null);
  };

  const isPinValid = pinCode.length === 6 && /^\d{6}$/.test(pinCode);

  // Perform Google Maps Geocoding lookup for the PIN Code via server-side proxy
  const handleFindLocation = async () => {
    if (!isPinValid) {
      setPinError('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    setPinError(null);
    setStep('loading');

    try {
      // Call server proxy route to bypass browser CORS
      const response = await fetch(`/api/geocode?pin=${encodeURIComponent(pinCode)}`);
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const firstResult = data.results[0];
        const lat = firstResult.geometry.location.lat;
        const lng = firstResult.geometry.location.lng;

        let parsedLocality = '';
        let parsedCity = '';
        let parsedDistrict = '';
        let parsedState = '';

        if (firstResult.address_components) {
          for (const comp of firstResult.address_components) {
            const types = comp.types;
            if (
              types.includes('sublocality') ||
              types.includes('sublocality_level_1') ||
              types.includes('neighborhood')
            ) {
              parsedLocality = comp.long_name;
            } else if (types.includes('locality')) {
              parsedCity = comp.long_name;
            } else if (types.includes('administrative_area_level_2')) {
              parsedDistrict = comp.long_name;
            } else if (types.includes('administrative_area_level_1')) {
              parsedState = comp.long_name;
            }
          }
        }

        const mainLocality = parsedLocality || parsedCity || parsedDistrict || 'Area ' + pinCode;
        const mainCity = parsedCity || parsedDistrict || parsedState || 'India';

        setMarkerPos({ lat, lng });
        setFormattedAddress(firstResult.formatted_address || `${mainLocality}, ${mainCity}`);
        setLocality(mainLocality);
        setCity(mainCity);
        setDistrict(parsedDistrict);
        setStateName(parsedState);
        setArea(mainLocality);
        setPlaceId(firstResult.place_id);
        setDetectedPinCode(pinCode);
        setIsPinMismatch(false);

        setStep('map');
      } else {
        // Stop and show "Location not found" error — NO random/hardcoded fallback!
        setStep('pin');
        setPinError(
          'Location not found for this PIN code. Please check the PIN code and try again.'
        );
      }
    } catch (err) {
      setStep('pin');
      setPinError('Failed to query location for this PIN code. Please check your connection.');
    }
  };

  // Reverse geocode when map marker is moved via server proxy
  const reverseGeocodeCoords = useCallback(
    async (lat: number, lng: number) => {
      setIsReverseGeocoding(true);
      try {
        const response = await fetch(`/api/geocode?latlng=${lat},${lng}`);
        const data = await response.json();

        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const firstResult = data.results[0];

          let parsedLocality = '';
          let parsedCity = '';
          let parsedDistrict = '';
          let parsedState = '';
          let parsedPinCode = '';

          if (firstResult.address_components) {
            for (const comp of firstResult.address_components) {
              const types = comp.types;
              if (
                types.includes('sublocality') ||
                types.includes('sublocality_level_1') ||
                types.includes('neighborhood')
              ) {
                parsedLocality = comp.long_name;
              } else if (types.includes('locality')) {
                parsedCity = comp.long_name;
              } else if (types.includes('administrative_area_level_2')) {
                parsedDistrict = comp.long_name;
              } else if (types.includes('administrative_area_level_1')) {
                parsedState = comp.long_name;
              } else if (types.includes('postal_code')) {
                parsedPinCode = comp.long_name;
              }
            }
          }

          if (parsedLocality) setLocality(parsedLocality);
          if (parsedLocality) setArea(parsedLocality);
          if (parsedCity) setCity(parsedCity);
          if (parsedDistrict) setDistrict(parsedDistrict);
          if (parsedState) setStateName(parsedState);
          if (firstResult.place_id) setPlaceId(firstResult.place_id);
          if (firstResult.formatted_address) setFormattedAddress(firstResult.formatted_address);

          if (parsedPinCode) {
            setDetectedPinCode(parsedPinCode);
            if (parsedPinCode !== pinCode) {
              setIsPinMismatch(true);
            } else {
              setIsPinMismatch(false);
            }
          }
        }
      } catch (err) {
        // Keep prior geocoded address
      } finally {
        setIsReverseGeocoding(false);
      }
    },
    [pinCode]
  );

  // Debounced marker drag end
  const handleMarkerDragEnd = (e: { latLng?: { lat: () => number; lng: () => number } | null }) => {
    if (e.latLng) {
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      setMarkerPos({ lat: newLat, lng: newLng });

      if (reverseGeocodeTimer.current) clearTimeout(reverseGeocodeTimer.current);
      reverseGeocodeTimer.current = setTimeout(() => {
        reverseGeocodeCoords(newLat, newLng);
      }, 350);
    }
  };

  // Confirm map location and proceed to house details form
  const handleConfirmMapLocation = () => {
    if (!street.trim()) {
      setStreet(formattedAddress || `${locality}, ${city}`);
    }
    setStep('details');
  };

  // Save address to LocationContext & Firestore
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!house.trim()) {
      setFormError('Please enter your House / Flat / Building No.');
      return;
    }
    if (!area.trim() || !city.trim()) {
      setFormError('Please complete Area and City details.');
      return;
    }

    const fullStreet = `${house.trim()}, ${street.trim() || area.trim()}`;

    addAddress({
      tag,
      name: name.trim() || user?.name || 'Customer',
      phone: phone.trim() || user?.phone || '',
      street: fullStreet,
      area: area.trim(),
      city: city.trim(),
      pinCode: detectedPinCode || pinCode.trim(),
      landmark: landmark.trim() || undefined,
      latitude: markerPos?.lat,
      longitude: markerPos?.lng,
      district,
      state: stateName,
      country: 'India',
      placeId,
      isDefault: true,
    });

    onComplete();
  };

  return (
    <div className="w-full space-y-3 pb-24 animate-in fade-in duration-200 max-w-xl mx-auto">
      {/* Header Step Navigation */}
      <DedicatedPageHeader
        title={
          step === 'pin'
            ? 'Enter PIN Code'
            : step === 'loading'
              ? 'Locating PIN'
              : step === 'map'
                ? 'Confirm Pin Location'
                : 'Address Details'
        }
        onBack={() => {
          if (step === 'details') setStep('map');
          else if (step === 'map') setStep('pin');
          else if (step === 'loading') setStep('pin');
          else onBack();
        }}
        subtitle={
          step === 'pin'
            ? 'Step 1 of 3 · Enter 6-digit Indian PIN code'
            : step === 'loading'
              ? 'Geocoding via Google Maps Platform'
              : step === 'map'
                ? 'Step 2 of 3 · Adjust marker over your home'
                : 'Step 3 of 3 · House & contact details'
        }
      />

      {/* STEP 1: PIN CODE ENTRY */}
      {step === 'pin' && (
        <div className="space-y-3">
          <div
            className={`p-4 rounded-2xl border transition-all space-y-3 shadow-xs ${theme === 'LIGHT'
                ? 'bg-white border-stone-200'
                : theme === 'DARK'
                  ? 'bg-stone-900 border-white/10'
                  : 'bg-stone-950 border-white/15'
              }`}
          >
            <div className="flex items-center gap-2.5 border-b border-stone-500/10 pb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-500 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className={`text-sm font-black ${textColorPrimary}`}>Enter Postal PIN Code</h2>
                <p className={`text-xs ${textColorMuted}`}>
                  Find your location using 6-digit Indian PIN code
                </p>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-500">
                6-Digit Postal PIN Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={pinCode}
                  onChange={handlePinChange}
                  placeholder="e.g. 732215"
                  autoFocus
                  className={`w-full py-3 px-4 rounded-xl text-base font-mono font-black tracking-widest border transition-all outline-hidden ${theme === 'LIGHT'
                      ? 'bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-500'
                      : 'bg-stone-900 border-stone-700 text-stone-100 focus:border-amber-400'
                    }`}
                />
                {pinCode.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPinCode('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-200 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {pinError && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-start gap-2 pt-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{pinError}</span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-stone-500/5 border border-stone-500/10 text-xs text-stone-400 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-stone-300 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Google Maps Geocoding</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                PIN code resolves your exact delivery district and opens Google Maps for pinpointing your home address.
              </p>
            </div>
          </div>

          {/* Primary Action Button: FIND LOCATION */}
          <button
            type="button"
            onClick={handleFindLocation}
            disabled={!isPinValid}
            className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-between shadow-md active:scale-95 cursor-pointer ${isPinValid
                ? `${categoryAccent.bgClass} text-stone-950 hover:brightness-105`
                : 'bg-stone-700/50 text-stone-500 cursor-not-allowed opacity-60'
              }`}
          >
            <span className="font-bold">FIND LOCATION</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] opacity-80">Geocode PIN Code</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* STEP 2: LOADING GOOGLE MAPS LOOKUP */}
      {step === 'loading' && (
        <div
          className={`p-8 rounded-2xl border text-center space-y-4 shadow-xs ${theme === 'LIGHT'
              ? 'bg-white border-stone-200'
              : theme === 'DARK'
                ? 'bg-stone-900 border-white/10'
                : 'bg-stone-950 border-white/15'
            }`}
        >
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-amber-400/20 animate-ping" />
            <div className="w-12 h-12 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className={`text-sm font-black ${textColorPrimary}`}>
              Resolving PIN Code {pinCode}
            </h3>
            <p className={`text-xs ${textColorMuted}`}>
              Retrieving geographic coordinates from Google Maps...
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-mono font-bold border border-amber-400/20">
            <Compass className="w-3.5 h-3.5 animate-spin" />
            <span>Country Restriction: IN</span>
          </div>
        </div>
      )}

      {/* STEP 3: INTERACTIVE GOOGLE MAP ADJUSTMENT */}
      {step === 'map' && markerPos && (
        <div className="space-y-3">
          <div
            className={`rounded-2xl border overflow-hidden transition-all shadow-xs relative ${theme === 'LIGHT'
                ? 'bg-white border-stone-200'
                : theme === 'DARK'
                  ? 'bg-stone-900 border-white/10'
                  : 'bg-stone-950 border-white/15'
              }`}
          >
            {/* Map Header Instructions Banner */}
            <div className="p-2.5 bg-stone-900 text-stone-100 text-xs font-bold flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Drag map marker to your exact house</span>
              </div>
              <span className="text-[10px] font-mono text-amber-300">PIN: {pinCode}</span>
            </div>

            {/* Google Map */}
            <div className="relative w-full h-64 bg-stone-900 overflow-hidden">
              <APIProvider apiKey={apiKey}>
                <Map
                  defaultCenter={markerPos}
                  center={markerPos}
                  defaultZoom={16}
                  zoom={16}
                  mapId="DEMO_MAP_ID"
                  gestureHandling="cooperative"
                  disableDefaultUI={true}
                  className="w-full h-full"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                >
                  <AdvancedMarker
                    position={markerPos}
                    draggable={true}
                    onDragEnd={handleMarkerDragEnd}
                    title="Drag to adjust delivery location"
                  >
                    <Pin background="#f59e0b" glyphColor="#0c0a09" borderColor="#d97706" />
                  </AdvancedMarker>
                </Map>
              </APIProvider>

              {/* Reverse geocoding status indicator */}
              {isReverseGeocoding && (
                <div className="absolute top-2 left-2 z-10 px-2.5 py-1 rounded-full bg-stone-900/90 text-amber-400 text-[10px] font-bold shadow-md flex items-center gap-1.5 backdrop-blur-md border border-white/10">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Reverse geocoding position...</span>
                </div>
              )}
            </div>

            {/* PIN Code Mismatch Warning Banner */}
            {isPinMismatch && detectedPinCode && (
              <div className="p-2.5 bg-amber-500/15 border-t border-amber-500/30 text-amber-300 text-xs font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Selected location is outside PIN {pinCode} (PIN {detectedPinCode}).</span>
                </div>
                <div className="flex items-center gap-1 text-[10.5px]">
                  <button
                    type="button"
                    onClick={() => {
                      setPinCode(detectedPinCode);
                      setIsPinMismatch(false);
                    }}
                    className="px-2 py-0.5 rounded bg-amber-400 text-stone-950 font-bold hover:brightness-105 cursor-pointer"
                  >
                    Update to {detectedPinCode}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPinMismatch(false)}
                    className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 hover:text-white cursor-pointer"
                  >
                    Keep
                  </button>
                </div>
              </div>
            )}

            {/* Resolved Location Summary */}
            <div className="p-3 border-t border-stone-500/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {locality || city || 'Resolved Location'}, {city}
                </span>
                <span className="text-[10px] font-mono text-stone-400">
                  {markerPos.lat.toFixed(4)}, {markerPos.lng.toFixed(4)}
                </span>
              </div>
              <p className={`text-xs leading-snug font-medium truncate ${textColorPrimary}`}>
                {formattedAddress || `${locality}, ${city} ${pinCode}`}
              </p>
            </div>
          </div>

          {/* Confirm Location Button */}
          <button
            type="button"
            onClick={handleConfirmMapLocation}
            className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-between shadow-md active:scale-95 cursor-pointer ${categoryAccent.bgClass} text-stone-950 hover:brightness-105`}
          >
            <span>CONFIRM LOCATION</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] opacity-80">Proceed to Address Details</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* STEP 4: ADDRESS DETAILS FORM */}
      {step === 'details' && (
        <form onSubmit={handleSaveAddress} className="space-y-3">
          <div
            className={`p-4 rounded-2xl border transition-all space-y-3 shadow-xs ${theme === 'LIGHT'
                ? 'bg-white border-stone-200'
                : theme === 'DARK'
                  ? 'bg-stone-900 border-white/10'
                  : 'bg-stone-950 border-white/15'
              }`}
          >
            <div className="flex items-center justify-between border-b border-stone-500/10 pb-2.5">
              <h3 className={`text-xs font-black uppercase tracking-wider ${textColorPrimary}`}>
                Complete Delivery Address
              </h3>
              <span className="text-[10px] font-mono text-amber-500 font-bold">
                PIN: {detectedPinCode || pinCode}
              </span>
            </div>

            {formError && (
              <p className="text-xs text-rose-500 font-bold flex items-center gap-1 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{formError}</span>
              </p>
            )}

            {/* Address Tag Selector (Home / Work / Other) */}
            <div className="space-y-1">
              <label className={`block text-[11px] font-bold ${textColorMuted}`}>
                Save Address As
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Home', 'Work', 'Other'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTag(t)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${tag === t
                        ? 'bg-amber-400 text-stone-950 border-amber-400 shadow-xs'
                        : theme === 'LIGHT'
                          ? 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                          : 'bg-stone-900 text-stone-300 border-white/10 hover:bg-stone-800'
                      }`}
                  >
                    {t === 'Home' && <Home className="w-3.5 h-3.5" />}
                    {t === 'Work' && <Briefcase className="w-3.5 h-3.5" />}
                    {t === 'Other' && <Building className="w-3.5 h-3.5" />}
                    <span>{t}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* House / Flat / Building No */}
            <div className="space-y-1">
              <label className={`block text-[11px] font-bold ${textColorMuted}`}>
                House / Flat / Building No. <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={house}
                onChange={(e) => setHouse(e.target.value)}
                placeholder="e.g. Flat 402, Building A"
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition-all outline-hidden ${theme === 'LIGHT'
                    ? 'bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-500'
                    : 'bg-stone-900 border-stone-700 text-stone-100 focus:border-amber-400'
                  }`}
              />
            </div>

            {/* Street / Road */}
            <div className="space-y-1">
              <label className={`block text-[11px] font-bold ${textColorMuted}`}>
                Street / Road Name
              </label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="e.g. Main Street"
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition-all outline-hidden ${theme === 'LIGHT'
                    ? 'bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-500'
                    : 'bg-stone-900 border-stone-700 text-stone-100 focus:border-amber-400'
                  }`}
              />
            </div>

            {/* Area & City (Pre-filled from Google Maps) */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className={`block text-[11px] font-bold ${textColorMuted}`}>
                  Area / Locality
                </label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition-all outline-hidden ${theme === 'LIGHT'
                      ? 'bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-500'
                      : 'bg-stone-900 border-stone-700 text-stone-100 focus:border-amber-400'
                    }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`block text-[11px] font-bold ${textColorMuted}`}>City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition-all outline-hidden ${theme === 'LIGHT'
                      ? 'bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-500'
                      : 'bg-stone-900 border-stone-700 text-stone-100 focus:border-amber-400'
                    }`}
                />
              </div>
            </div>

            {/* Landmark */}
            <div className="space-y-1">
              <label className={`block text-[11px] font-bold ${textColorMuted}`}>
                Landmark (Optional)
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near Bus Stand"
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition-all outline-hidden ${theme === 'LIGHT'
                    ? 'bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-500'
                    : 'bg-stone-900 border-stone-700 text-stone-100 focus:border-amber-400'
                  }`}
              />
            </div>

            {/* Name & Phone */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-500/10">
              <div className="space-y-1">
                <label className={`block text-[11px] font-bold ${textColorMuted}`}>
                  Contact Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition-all outline-hidden ${theme === 'LIGHT'
                      ? 'bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-500'
                      : 'bg-stone-900 border-stone-700 text-stone-100 focus:border-amber-400'
                    }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`block text-[11px] font-bold ${textColorMuted}`}>
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition-all outline-hidden ${theme === 'LIGHT'
                      ? 'bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-500'
                      : 'bg-stone-900 border-stone-700 text-stone-100 focus:border-amber-400'
                    }`}
                />
              </div>
            </div>
          </div>

          {/* Submit Save Address Button */}
          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-between shadow-md active:scale-95 cursor-pointer ${categoryAccent.bgClass} text-stone-950 hover:brightness-105`}
          >
            <span>SAVE ADDRESS & SET ACTIVE</span>
            <div className="flex items-center gap-1">
              <Check className="w-4 h-4" />
            </div>
          </button>
        </form>
      )}
    </div>
  );
};