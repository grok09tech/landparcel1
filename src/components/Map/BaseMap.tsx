import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ParcelCollection, ParcelFeature, TanzaniaRegion } from '../../types';
import { MapPin, Maximize2, Minimize2 } from 'lucide-react';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface BaseMapProps {
  parcels: ParcelCollection | null;
  onParcelClick: (parcel: ParcelFeature) => void;
  onBoundsChange: (bounds: string) => void;
  mapCenter?: { lat: number; lng: number; zoom: number };
  selectedRegions: TanzaniaRegion[];
  className?: string;
}

const REGION_COLORS = {
  'Dar es Salaam': '#10B981', // Green
  'Arusha': '#F59E0B',        // Orange
  'Bagamoyo': '#8B5CF6'       // Purple
};

const REGION_CENTERS = {
  'Dar es Salaam': [-6.7924, 39.2083] as [number, number],
  'Arusha': [-3.3869, 36.6830] as [number, number],
  'Bagamoyo': [-6.4429, 38.9072] as [number, number]
};

const BaseMap: React.FC<BaseMapProps> = ({
  parcels,
  onParcelClick,
  onBoundsChange,
  mapCenter,
  selectedRegions,
  className = "h-full w-full"
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const parcelLayerRef = useRef<L.GeoJSON | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map centered on Tanzania
    const map = L.map(mapContainerRef.current, {
      center: [-6.369028, 34.888822], // Tanzania center
      zoom: 6,
      zoomControl: true,
      attributionControl: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;

    // Handle map bounds change
    const handleBoundsChange = () => {
      const bounds = map.getBounds();
      const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
      onBoundsChange(bbox);
    };

    map.on('moveend', handleBoundsChange);
    map.on('zoomend', handleBoundsChange);
    
    // Initial bounds
    setTimeout(handleBoundsChange, 100);

    return () => {
      map.remove();
    };
  }, [onBoundsChange]);

  // Handle map center changes
  useEffect(() => {
    if (!mapRef.current || !mapCenter) return;
    
    mapRef.current.setView([mapCenter.lat, mapCenter.lng], mapCenter.zoom, { animate: true });
  }, [mapCenter]);

  // Update parcels when data changes
  useEffect(() => {
    if (!mapRef.current || !parcels) return;

    // Remove existing parcel layer
    if (parcelLayerRef.current) {
      mapRef.current.removeLayer(parcelLayerRef.current);
    }

    // Filter parcels by selected regions
    const filteredFeatures = parcels.features.filter(feature => 
      selectedRegions.includes(feature.properties.region as TanzaniaRegion)
    );

    if (filteredFeatures.length === 0) return;

    // Create filtered collection
    const filteredCollection = {
      ...parcels,
      features: filteredFeatures
    };

    // Add new parcel layer
    const parcelLayer = L.geoJSON(filteredCollection, {
      style: (feature) => {
        const region = feature?.properties?.region as TanzaniaRegion;
        const color = REGION_COLORS[region] || '#3B82F6';
        
        return {
          color: color,
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.4,
          fillColor: color,
        };
      },
      onEachFeature: (feature, layer) => {
        const parcelFeature = feature as ParcelFeature;
        
        // Click handler
        layer.on('click', () => {
          onParcelClick(parcelFeature);
        });

        // Hover effects
        layer.on('mouseover', function(e) {
          const layer = e.target;
          layer.setStyle({
            weight: 3,
            fillOpacity: 0.6,
          });

          // Show tooltip
          const props = parcelFeature.properties;
          const tooltip = `
            <div class="p-2 bg-white rounded shadow-lg border">
              <div class="font-semibold text-gray-900">${props.parcel_id}</div>
              <div class="text-sm text-gray-600">${props.region}</div>
              <div class="text-sm text-gray-600">Owner: ${props.owner_name}</div>
              <div class="text-sm text-gray-600">Area: ${props.area_sqm?.toLocaleString()} m²</div>
            </div>
          `;
          
          layer.bindTooltip(tooltip, {
            permanent: false,
            direction: 'top',
            className: 'custom-tooltip'
          }).openTooltip();
        });

        layer.on('mouseout', function(e) {
          const layer = e.target;
          const region = parcelFeature.properties.region as TanzaniaRegion;
          const color = REGION_COLORS[region] || '#3B82F6';
          
          layer.setStyle({
            weight: 2,
            fillOpacity: 0.4,
          });
          
          layer.closeTooltip();
        });
      },
    });

    parcelLayer.addTo(mapRef.current);
    parcelLayerRef.current = parcelLayer;

    // Auto-fit bounds to show selected regions
    if (filteredFeatures.length > 0) {
      const bounds = parcelLayer.getBounds();
      mapRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [parcels, onParcelClick, selectedRegions]);

  const focusOnRegion = (region: TanzaniaRegion) => {
    if (!mapRef.current) return;
    
    const center = REGION_CENTERS[region];
    mapRef.current.setView(center, 12, { animate: true });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`${className} relative`}>
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={toggleFullscreen}
          className="bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow border"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5 text-gray-700" />
          ) : (
            <Maximize2 className="w-5 h-5 text-gray-700" />
          )}
        </button>
      </div>

      {/* Region Focus Buttons */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {selectedRegions.map(region => (
          <button
            key={region}
            onClick={() => focusOnRegion(region)}
            className="bg-white px-3 py-2 rounded-lg shadow-md hover:shadow-lg transition-all border text-sm font-medium flex items-center gap-2"
            style={{ borderLeftColor: REGION_COLORS[region], borderLeftWidth: '4px' }}
          >
            <MapPin className="w-4 h-4" style={{ color: REGION_COLORS[region] }} />
            {region}
          </button>
        ))}
      </div>

      {/* Map Container */}
      <div 
        ref={mapContainerRef} 
        className={`h-full w-full rounded-lg shadow-md ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
        }`} 
      />

      {/* Custom tooltip styles */}
      <style jsx>{`
        .custom-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        .custom-tooltip .leaflet-tooltip-content {
          margin: 0 !important;
          padding: 0 !important;
        }
      `}</style>
    </div>
  );
};

export default BaseMap;