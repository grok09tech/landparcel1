import React from 'react';
import { MapPin, Check } from 'lucide-react';
import { RegionFilter } from '../../types';

interface RegionFilterProps {
  regions: RegionFilter[];
  onRegionToggle: (region: string) => void;
  onRegionFocus: (region: string) => void;
}

const RegionFilterComponent: React.FC<RegionFilterProps> = ({
  regions,
  onRegionToggle,
  onRegionFocus
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <MapPin className="h-5 w-5 mr-2 text-blue-600" />
        Tanzania Regions
      </h3>
      
      <div className="space-y-3">
        {regions.map((region) => (
          <div key={region.region} className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={region.enabled}
                  onChange={() => onRegionToggle(region.region)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                  region.enabled 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'border-gray-300 hover:border-blue-400'
                }`}>
                  {region.enabled && (
                    <Check className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
                  )}
                </div>
              </div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {region.region}
              </span>
            </label>
            
            <button
              onClick={() => onRegionFocus(region.region)}
              className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
            >
              Focus
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Select regions to filter parcels. Use "Focus" to center the map on a specific region.
        </p>
      </div>
    </div>
  );
};

export default RegionFilterComponent;