/// <reference types="google.maps" />
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, useMapsLibrary } from '@vis.gl/react-google-maps';
import { MapPin, Search, Navigation, Check } from 'lucide-react';

interface GoogleLocationPickerMapProps {
  initialStreet?: string;
  onSelectLocation?: (locationData: {
    street: string;
    city: string;
    area: string;
    lat: number;
    lng: number;
  }) => void;
}

const MAP_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const LocationPickerInner: React.FC<GoogleLocationPickerMapProps> = ({
  initialStreet,
  onSelectLocation,
}) => {
  const geocodingLib = useMapsLibrary('geocoding');
  const placesLib = useMapsLibrary('places');

  const [position, setPosition] = useState<google.maps.LatLngLiteral>({
    lat: 12.9716, // Default Bangalore center
    lng: 77.5946,
  });

  const [selectedAddress, setSelectedAddress] = useState(initialStreet || 'Central Area, Bangalore');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Reverse geocode when position changes
  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      if (!geocodingLib) return;
      try {
        const geocoder = new geocodingLib.Geocoder();
        const response = await geocoder.geocode({ location: { lat, lng } });
        if (response.results && response.results[0]) {
          const result = response.results[0];
          const formattedAddress = result.formatted_address;
          setSelectedAddress(formattedAddress);

          let city = 'Bengaluru';
          let area = 'Central Area';

          result.address_components?.forEach((comp: google.maps.GeocoderAddressComponent) => {
            if (comp.types.includes('locality')) city = comp.long_name;
            if (comp.types.includes('sublocality') || comp.types.includes('neighborhood')) {
              area = comp.long_name;
            }
          });

          if (onSelectLocation) {
            onSelectLocation({
              street: formattedAddress,
              city,
              area,
              lat,
              lng,
            });
          }
        }
      } catch (err) {
        console.warn('Geocoding notice:', err);
      }
    },
    [geocodingLib, onSelectLocation]
  );

  const handleDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setPosition({ lat, lng });
      reverseGeocode(lat, lng);
    }
  };

  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !geocodingLib) return;

    try {
      setIsSearching(true);
      const geocoder = new geocodingLib.Geocoder();
      const response = await geocoder.geocode({ address: searchQuery });
      if (response.results && response.results[0]) {
        const location = response.results[0].geometry.location;
        const newLat = location.lat();
        const newLng = location.lng();
        setPosition({ lat: newLat, lng: newLng });
        reverseGeocode(newLat, newLng);
      }
    } catch (err) {
      console.warn('Address search notice:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setPosition({ lat, lng });
          reverseGeocode(lat, lng);
        },
        () => { }
      );
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Search Input Bar */}
      <form onSubmit={handleSearchAddress} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search address or landmark on Google Maps..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-900 border border-stone-700/60 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-400"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="px-3 py-2 rounded-xl bg-amber-400 text-stone-950 font-bold text-xs hover:bg-amber-300 transition-all cursor-pointer"
        >
          {isSearching ? 'Finding...' : 'Search'}
        </button>
      </form>

      {/* Map Display */}
      <div className="h-56 w-full rounded-2xl overflow-hidden border border-stone-500/20 relative shadow-inner">
        <Map
          center={position}
          zoom={15}
          gestureHandling="cooperative"
          disableDefaultUI={false}
          mapId="DEMO_MAP_ID"
          className="w-full h-full"
        >
          <AdvancedMarker
            position={position}
            draggable={true}
            onDragEnd={handleDragEnd}
            title="Drag marker to adjust location"
          >
            <div className="p-2 rounded-full bg-amber-400 text-stone-950 font-black shadow-2xl border-2 border-stone-900 transform hover:scale-110 transition-all cursor-grab active:cursor-grabbing">
              <MapPin className="w-5 h-5 fill-amber-400 stroke-stone-950 stroke-[2.5]" />
            </div>
          </AdvancedMarker>
        </Map>

        {/* Current Location Button */}
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="absolute bottom-2.5 right-2.5 p-2 rounded-xl bg-stone-950/90 text-amber-400 border border-amber-400/40 hover:bg-amber-400 hover:text-stone-950 transition-all shadow-lg flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          title="Detect Current GPS Location"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>My Location</span>
        </button>
      </div>

      {/* Pin Address Preview */}
      <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-500/20 flex items-center justify-between text-xs gap-2">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] text-amber-400 uppercase font-bold block">Selected Pinned Location</span>
          <p className="text-white text-xs truncate font-medium">{selectedAddress}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsConfirmed(true)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${isConfirmed
            ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400'
            : 'bg-amber-400 text-stone-950 hover:bg-amber-300'
            }`}
        >
          {isConfirmed ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Location Pinned</span>
            </>
          ) : (
            <span>Confirm Pin</span>
          )}
        </button>
      </div>
    </div>
  );
};

export const GoogleLocationPickerMap: React.FC<GoogleLocationPickerMapProps> = (props) => {
  return (
    <APIProvider apiKey={MAP_KEY}>
      <LocationPickerInner {...props} />
    </APIProvider>
  );
};

