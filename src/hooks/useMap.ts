import { useRef, useEffect, useState } from 'react';
import L from 'leaflet';

export const useMap = (containerId: string) => {
  const mapRef = useRef<L.Map | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container || mapRef.current) return;

    const map = L.map(container, {
      center: [-6.7924, 39.2083], // Dar es Salaam
      zoom: 14,
      zoomControl: true,
      attributionControl: true
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;
    setIsReady(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [containerId]);

  return { map: mapRef.current, isReady };
};