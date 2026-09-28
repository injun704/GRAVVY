/// <reference types="google.maps" />
import React, { useState, useEffect, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { Navigation, Store, MapPin, Bike, Clock, ShieldCheck } from 'lucide-react';
import { DeliveryAddress } from '../../types';

interface GoogleDeliveryTrackerMapProps {
  deliveryAddress: DeliveryAddress;
  status: string;
  etaMinutes?: number;
  deliveryAgentName?: string;
}

const MAP_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Component to handle polyline rendering between Hub and Customer Address
const RoutePolyline: React.FC<{
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
}> = ({ origin, destination }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || typeof google === 'undefined') return;

    const line = new google.maps.Polyline({
      path: [origin, destination],
      geodesic: true,
      strokeColor: '#f59e0b', // Amber theme accent
      strokeOpacity: 0.85,
      strokeWeight: 4,
      map: map,
    });

    return () => {
      line.setMap(null);
    };
  }, [map, origin, destination]);

  return null;
};

export const GoogleDeliveryTrackerMap: React.FC<GoogleDeliveryTrackerMapProps> = ({
  deliveryAddress,
  status,
  etaMinutes = 20,
  deliveryAgentName = 'Arjun Das',
}) => {
  // Default coordinates (e.g. Bangalore center fallback)
  const destCoords = useMemo(() => {
    // Generates a stable deterministic lat/lng from address string or fallback
    const hash = (deliveryAddress.street || 'Default').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const latOffset = ((hash % 100) - 50) / 2000;
    const lngOffset = (((hash * 3) % 100) - 50) / 2000;
    return {
      lat: 12.9716 + latOffset,
      lng: 77.5946 + lngOffset,
    };
  }, [deliveryAddress]);

  const hubCoords = useMemo(() => {
    return {
      lat: destCoords.lat - 0.015,
      lng: destCoords.lng - 0.012,
    };
  }, [destCoords]);

  // Live rider position animation along route
  const [riderProgress, setRiderProgress] = useState(0.45);
  const [selectedMarker, setSelectedMarker] = useState<'hub' | 'rider' | 'dest' | null>('rider');

  useEffect(() => {
    const interval = setInterval(() => {
      setRiderProgress((prev) => (prev >= 0.9 ? 0.3 : prev + 0.02));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const riderCoords = useMemo(() => {
    return {
      lat: hubCoords.lat + (destCoords.lat - hubCoords.lat) * riderProgress,
      lng: hubCoords.lng + (destCoords.lng - hubCoords.lng) * riderProgress,
    };
  }, [hubCoords, destCoords, riderProgress]);

  const mapCenter = useMemo(() => {
    return {
      lat: (hubCoords.lat + destCoords.lat) / 2,
      lng: (hubCoords.lng + destCoords.lng) / 2,
    };
  }, [hubCoords, destCoords]);

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-stone-500/20 shadow-md bg-stone-900 relative">
      <div className="h-64 sm:h-72 w-full relative">
        <APIProvider apiKey={MAP_KEY}>
          <Map
            defaultCenter={mapCenter}
            defaultZoom={13}
            gestureHandling="cooperative"
            disableDefaultUI={false}
            mapId="DEMO_MAP_ID"
            className="w-full h-full"
          >
            {/* Draw route path */}
            <RoutePolyline origin={hubCoords} destination={destCoords} />

            {/* Store / Fulfillment Hub Marker */}
            <AdvancedMarker
              position={hubCoords}
              onClick={() => setSelectedMarker('hub')}
              title="GRAVVY Express Store Hub"
            >
              <div className="p-2 rounded-full bg-stone-900 border-2 border-amber-400 text-amber-400 shadow-lg cursor-pointer transform hover:scale-110 transition-all">
                <Store className="w-4 h-4" />
              </div>
            </AdvancedMarker>

            {/* Live Delivery Agent Marker */}
            <AdvancedMarker
              position={riderCoords}
              onClick={() => setSelectedMarker('rider')}
              title={`${deliveryAgentName} (Rider)`}
            >
              <div className="relative cursor-pointer group">
                <div className="absolute -inset-1 bg-amber-400/40 rounded-full blur-xs animate-ping" />
                <div className="relative p-2 rounded-full bg-amber-400 text-stone-950 font-bold shadow-xl border-2 border-stone-900 transform group-hover:scale-110 transition-all flex items-center justify-center">
                  <Bike className="w-4 h-4" />
                </div>
              </div>
            </AdvancedMarker>

            {/* Destination / Customer Address Marker */}
            <AdvancedMarker
              position={destCoords}
              onClick={() => setSelectedMarker('dest')}
              title="Delivery Destination"
            >
              <div className="p-2 rounded-full bg-emerald-500 text-stone-950 font-bold shadow-lg border-2 border-white cursor-pointer transform hover:scale-110 transition-all">
                <MapPin className="w-4 h-4" />
              </div>
            </AdvancedMarker>

            {/* Info Window for Rider */}
            {selectedMarker === 'rider' && (
              <InfoWindow
                position={riderCoords}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div className="p-1 text-xs text-stone-900 space-y-0.5">
                  <div className="font-bold flex items-center gap-1 text-amber-600">
                    <Bike className="w-3.5 h-3.5" />
                    <span>{deliveryAgentName}</span>
                  </div>
                  <p className="text-[11px] text-stone-600">En route to your location</p>
                  <p className="text-[10px] font-mono text-stone-500">ETA ~{etaMinutes} mins</p>
                </div>
              </InfoWindow>
            )}

            {/* Info Window for Hub */}
            {selectedMarker === 'hub' && (
              <InfoWindow
                position={hubCoords}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div className="p-1 text-xs text-stone-900">
                  <div className="font-bold flex items-center gap-1 text-stone-800">
                    <Store className="w-3.5 h-3.5" />
                    <span>GRAVVY Express Hub</span>
                  </div>
                  <p className="text-[11px] text-stone-600">Order dispatched from local center</p>
                </div>
              </InfoWindow>
            )}

            {/* Info Window for Destination */}
            {selectedMarker === 'dest' && (
              <InfoWindow
                position={destCoords}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div className="p-1 text-xs text-stone-900">
                  <div className="font-bold flex items-center gap-1 text-emerald-600">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Delivery Address</span>
                  </div>
                  <p className="text-[11px] text-stone-600 truncate max-w-xs">{deliveryAddress.street}</p>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        {/* Live Badge Overlay */}
        <div className="absolute top-2.5 left-2.5 px-3 py-1.5 rounded-xl bg-stone-950/80 backdrop-blur-md border border-stone-700/50 flex items-center gap-2 shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold text-white tracking-wide">Live Google Maps Tracking</span>
        </div>

        {/* Floating Rider Summary Bar */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2.5 rounded-xl bg-stone-950/90 backdrop-blur-md border border-white/10 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{deliveryAgentName}</p>
              <p className="text-[10px] text-stone-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Express Delivery Partner
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Est. Arrival</span>
            <span className="text-xs font-mono font-black text-amber-400 flex items-center gap-1 justify-end">
              <Clock className="w-3 h-3" /> {etaMinutes} Mins
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};