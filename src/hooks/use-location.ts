import { useState, useCallback } from 'react';

interface LocationState {
  lat: number | null;
  lng: number | null;
  city: string | null;
  loading: boolean;
  error: string | null;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({ lat: null, lng: null, city: null, loading: false, error: null });

  const getLocation = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    if (!navigator.geolocation) {
      setState({ lat: null, lng: null, city: null, loading: false, error: 'Geolocation not supported' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let city: string | null = null;
        try {
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
          const data = await res.json();
          city = data.city || data.locality || 'Unknown';
        } catch {
          city = 'Unknown';
        }
        setState({ lat, lng, city, loading: false, error: null });
      },
      (err) => {
        setState({ lat: null, lng: null, city: null, loading: false, error: err.message });
      }
    );
  }, []);

  return { ...state, getLocation };
}
