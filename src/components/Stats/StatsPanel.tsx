import React from 'react';
import { BarChart3, MapPin, Users, TrendingUp } from 'lucide-react';
import { ParcelCollection } from '../../types';
import { formatArea, formatCurrency } from '../../utils/geoUtils';

interface StatsPanelProps {
  parcels: ParcelCollection | null;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ parcels }) => {
  const stats = React.useMemo(() => {
    if (!parcels || parcels.features.length === 0) {
      return {
        totalParcels: 0,
        totalArea: 0,
        totalValue: 0,
        averageArea: 0,
        landUseDistribution: {}
      };
    }

    const features = parcels.features;
    const totalParcels = features.length;
    const totalArea = features.reduce((sum, f) => sum + (f.properties.area_sqm || 0), 0);
    const totalValue = features.reduce((sum, f) => sum + (f.properties.valuation || 0), 0);
    const averageArea = totalArea / totalParcels;
    
    const landUseDistribution = features.reduce((acc, f) => {
      const landUse = f.properties.land_use || 'Unknown';
      acc[landUse] = (acc[landUse] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const regionDistribution = features.reduce((acc, f) => {
      const region = f.properties.region || 'Unknown';
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return {
      totalParcels,
      totalArea,
      totalValue,
      averageArea,
      landUseDistribution,
      regionDistribution
    };
  }, [parcels]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
        Statistics Overview
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Total Parcels</span>
          </div>
          <p className="text-xl font-bold text-blue-900 mt-1">{stats.totalParcels}</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Total Area</span>
          </div>
          <p className="text-lg font-bold text-green-900 mt-1">{formatArea(stats.totalArea)}</p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <Users className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Avg. Area</span>
          </div>
          <p className="text-lg font-bold text-purple-900 mt-1">{formatArea(stats.averageArea)}</p>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <BarChart3 className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Total Value</span>
          </div>
          <p className="text-sm font-bold text-orange-900 mt-1">
            {stats.totalValue > 0 ? formatCurrency(stats.totalValue) : 'N/A'}
          </p>
        </div>
      </div>
      
      {Object.keys(stats.regionDistribution).length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Region Distribution</h4>
          <div className="space-y-2">
            {Object.entries(stats.regionDistribution).map(([region, count]) => (
              <div key={region} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{region}</span>
                <div className="flex items-center">
                  <div className="w-16 h-2 bg-gray-200 rounded-full mr-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        region === 'Dar es Salaam' ? 'bg-green-500' :
                        region === 'Arusha' ? 'bg-orange-500' :
                        region === 'Bagamoyo' ? 'bg-purple-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${(count / stats.totalParcels) * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-900 font-medium">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(stats.landUseDistribution).length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Land Use Distribution</h4>
          <div className="space-y-2">
            {Object.entries(stats.landUseDistribution).map(([landUse, count]) => (
              <div key={landUse} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{landUse}</span>
                <div className="flex items-center">
                  <div className="w-16 h-2 bg-gray-200 rounded-full mr-2 overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${(count / stats.totalParcels) * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-900 font-medium">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPanel;