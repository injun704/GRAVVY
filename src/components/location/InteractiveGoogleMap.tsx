import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapPin, ShieldCheck } from 'lucide-react';
import { DeliveryAddress } from '../../types';

interface InteractiveGoogleMapProps {
  activeAddress: DeliveryAddress;
  serviceable: boolean;
}

export const InteractiveGoogleMap: React.FC<InteractiveGoogleMapProps> = ({
  activeAddress,
  serviceable,
}) => {
  const apiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(() => {
    if (activeAddress.latitude && activeAddress.longitude) {
      return { lat: activeAddress.latitude, lng: activeAddress.longitude };
    }
    return null;
  });

  useEffect(() => {
    if (activeAddress.latitude && activeAddress.longitude) {
      setPosition({ lat: activeAddress.latitude, lng: activeAddress.longitude });
    } else if (activeAddress.pinCode) {
      // Dynamically geocode activeAddress via server proxy
      fetch(`/api/geocode?pin=${encodeURIComponent(activeAddress.pinCode)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'OK' && data.results?.[0]?.geometry?.location) {
            setPosition({
              lat: data.results[0].geometry.location.lat,
              lng: data.results[0].geometry.location.lng,
            });
          }
        })
        .catch(() => { });
    }
  }, [activeAddress]);

  if (!position) {
    return (
      <div className="relative w-full h-44 sm:h-48 bg-stone-900 border border-stone-800 flex items-center justify-center text-center p-4">
        <div className="space-y-1">
          <MapPin className="w-6 h-6 text-amber-400 mx-auto animate-pulse" />
          <p className="text-xs font-bold text-stone-300">
            {activeAddress.area ? `${activeAddress.area}, ${activeAddress.city}` : 'Delivery Location'}
          </p>
          <p className="text-[10.5px] text-stone-400 font-mono">
            {activeAddress.pinCode ? `PIN: ${activeAddress.pinCode}` : 'Select a PIN Code'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-44 sm:h-48 bg-stone-900 overflow-hidden">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={position}
          center={position}
          defaultZoom={15}
          zoom={15}
          mapId="DEMO_MAP_ID"
          gestureHandling="cooperative"
          disableDefaultUI={true}
          className="w-full h-full"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        >
          <AdvancedMarker position={position} title={activeAddress.tag || 'Delivery Location'}>
            <Pin background="#f59e0b" glyphColor="#0c0a09" borderColor="#d97706" />
          </AdvancedMarker>
        </Map>
      </APIProvider>

      {/* Serviceability Badge on Map */}
      <div className="absolute top-2 left-2 z-10 pointer-events-none">
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm flex items-center gap-1 ${serviceable ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'
            }`}
        >
          <ShieldCheck className="w-3 h-3" />
          {serviceable ? 'Serviced Zone' : 'Outside Express Zone'}
        </span>
      </div>

      {/* Address Tag Badge */}
      <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
        <div className="px-2.5 py-1 rounded-full bg-stone-900/90 text-white text-[10px] font-bold shadow-lg flex items-center gap-1 border border-white/20 backdrop-blur-md">
          <MapPin className="w-3 h-3 text-amber-400" />
          <span>{activeAddress.tag || 'Location'}</span>
        </div>
      </div>
    </div>
  );
};
