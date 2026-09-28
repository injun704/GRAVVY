import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { DeliveryAddress } from '../types';

interface LocationContextType {
  activeAddress: DeliveryAddress;
  savedAddresses: DeliveryAddress[];
  setActiveAddress: (addr: DeliveryAddress) => void;
  addAddress: (addr: Omit<DeliveryAddress, 'id'>) => void;
  updateAddress: (id: string, addrData: Partial<DeliveryAddress>) => void;
  setDefaultAddress: (id: string) => void;
  removeAddress: (id: string) => void;
  detectCurrentLocation: () => Promise<{ success: boolean; message: string }>;
  isDetectingLocation: boolean;
  verifyPinCode: (pin: string) => { serviceable: boolean; estimatedMinutes: number; city: string };
}

const DEFAULT_LOCATION: DeliveryAddress = {
  id: 'addr-default',
  tag: 'Home',
  name: '',
  phone: '',
  street: 'Delivery Location',
  area: 'Select Location',
  city: 'India',
  pinCode: '',
  isDefault: true,
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>(() => {
    try {
      const saved = localStorage.getItem('gravvy_addresses');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [activeAddress, setActiveAddress] = useState<DeliveryAddress>(
    savedAddresses.find((a) => a.isDefault) || savedAddresses[0] || DEFAULT_LOCATION
  );
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('gravvy_addresses', JSON.stringify(savedAddresses));
    } catch {}
  }, [savedAddresses]);

  const addAddress = (addrData: Omit<DeliveryAddress, 'id'>) => {
    const newAddr: DeliveryAddress = {
      ...addrData,
      id: `addr-${Date.now()}`,
    };
    setSavedAddresses((prev) => {
      const updated = prev.map((a) => (newAddr.isDefault ? { ...a, isDefault: false } : a));
      return [...updated, newAddr];
    });
    if (newAddr.isDefault) {
      setActiveAddress(newAddr);
    }

    // Persist to Firestore for authenticated user
    if (auth.currentUser) {
      try {
        setDoc(doc(db, 'users', auth.currentUser.uid, 'addresses', newAddr.id), {
          ...newAddr,
          createdAt: new Date().toISOString(),
        }).catch(() => {});
      } catch {}
    }
  };

  const updateAddress = (id: string, addrData: Partial<DeliveryAddress>) => {
    setSavedAddresses((prev) => {
      return prev.map((addr) => {
        if (addr.id === id) {
          const updated = { ...addr, ...addrData };
          if (updated.isDefault) {
            setActiveAddress(updated);
          }
          if (auth.currentUser) {
            try {
              setDoc(doc(db, 'users', auth.currentUser.uid, 'addresses', id), updated, {
                merge: true,
              }).catch(() => {});
            } catch {}
          }
          return updated;
        }
        return addrData.isDefault ? { ...addr, isDefault: false } : addr;
      });
    });
  };

  const setDefaultAddress = (id: string) => {
    setSavedAddresses((prev) => {
      const updated = prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }));
      const found = updated.find((a) => a.id === id);
      if (found) {
        setActiveAddress(found);
      }
      return updated;
    });
  };

  const removeAddress = (id: string) => {
    setSavedAddresses((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      if (activeAddress.id === id && updated.length > 0) {
        setActiveAddress(updated[0]);
      }
      return updated;
    });

    if (auth.currentUser) {
      try {
        deleteDoc(doc(db, 'users', auth.currentUser.uid, 'addresses', id)).catch(() => {});
      } catch {}
    }
  };

  // Device GPS Location Detection with real Google Reverse Geocoding
  const detectCurrentLocation = async (): Promise<{ success: boolean; message: string }> => {
    setIsDetectingLocation(true);
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

    if (!navigator.geolocation) {
      setIsDetectingLocation(false);
      return {
        success: false,
        message: 'Geolocation is not supported by your browser or device.',
      };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          try {
            if (apiKey) {
              const res = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
              );
              const data = await res.json();

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

                const mainLocality = parsedLocality || parsedCity || parsedDistrict || 'Current GPS Location';
                const mainCity = parsedCity || parsedDistrict || parsedState || 'India';

                const gpsAddr: DeliveryAddress = {
                  id: `addr-gps-${Date.now()}`,
                  tag: 'Other',
                  name: activeAddress.name || '',
                  phone: activeAddress.phone || '',
                  street: firstResult.formatted_address || `${mainLocality}, ${mainCity}`,
                  area: mainLocality,
                  city: mainCity,
                  pinCode: parsedPinCode,
                  latitude: lat,
                  longitude: lng,
                  district: parsedDistrict,
                  state: parsedState,
                  country: 'India',
                  placeId: firstResult.place_id,
                  isDefault: true,
                };

                setActiveAddress(gpsAddr);
                setIsDetectingLocation(false);
                resolve({
                  success: true,
                  message: `Location set to ${mainLocality}, ${mainCity}`,
                });
                return;
              }
            }

            // Fallback for GPS coordinates without geocoding key
            const rawGpsAddr: DeliveryAddress = {
              id: `addr-gps-${Date.now()}`,
              tag: 'Other',
              name: activeAddress.name || '',
              phone: activeAddress.phone || '',
              street: `GPS Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
              area: 'Device Position',
              city: 'Detected GPS Location',
              pinCode: '',
              latitude: lat,
              longitude: lng,
              isDefault: true,
            };
            setActiveAddress(rawGpsAddr);
            setIsDetectingLocation(false);
            resolve({
              success: true,
              message: `Location updated to GPS coordinates (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
            });
          } catch (err) {
            setIsDetectingLocation(false);
            resolve({
              success: false,
              message: 'Failed to reverse geocode device location. Please try PIN code entry.',
            });
          }
        },
        (error) => {
          setIsDetectingLocation(false);
          resolve({
            success: false,
            message: 'Device location permission denied or unavailable. Please enter your PIN code.',
          });
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    });
  };

  const verifyPinCode = (pin: string) => {
    const clean = pin.trim();
    if (!/^\d{6}$/.test(clean)) {
      return { serviceable: false, estimatedMinutes: 0, city: '' };
    }
    return {
      serviceable: true,
      estimatedMinutes: 20,
      city: activeAddress.city || 'India',
    };
  };

  return (
    <LocationContext.Provider
      value={{
        activeAddress,
        savedAddresses,
        setActiveAddress,
        addAddress,
        updateAddress,
        setDefaultAddress,
        removeAddress,
        detectCurrentLocation,
        isDetectingLocation,
        verifyPinCode,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
