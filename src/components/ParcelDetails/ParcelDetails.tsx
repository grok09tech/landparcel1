import React, { useState } from 'react';
import { X, MapPin, User, Home, Zap, DollarSign, Calendar, Download, Share2 } from 'lucide-react';
import { ParcelFeature, ExportOptions } from '../../types';
import { formatArea, formatDistance, formatCurrency } from '../../utils/geoUtils';
import Button from '../UI/Button';
import ExportModal from './ExportModal';

interface ParcelDetailsProps {
  parcel: ParcelFeature;
  onClose: () => void;
}

const ParcelDetails: React.FC<ParcelDetailsProps> = ({ parcel, onClose }) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const { properties } = parcel;

  const handleExport = (options: ExportOptions) => {
    // Export functionality would be implemented here
    console.log('Exporting with options:', options);
    setShowExportModal(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Parcel ${properties.parcel_id}`,
        text: `Property owned by ${properties.owner_name} - ${formatArea(properties.area_sqm || 0)}`,
        url: window.location.href
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(
        `Parcel ${properties.parcel_id} - ${properties.owner_name} - ${window.location.href}`
      );
    }
  };

  return (
    <>
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Parcel Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Basic Info */}
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 text-blue-600 mr-2" />
              <span className="font-medium">Region:</span>
              <span className="ml-1 text-blue-700 font-semibold">{properties.region}</span>
            </div>
            {properties.district && (
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 text-blue-600 mr-2" />
                <span className="font-medium">District:</span>
                <span className="ml-1 text-blue-700">{properties.district}</span>
              </div>
            )}
            {properties.ward && (
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 text-blue-600 mr-2" />
                <span className="font-medium">Ward:</span>
                <span className="ml-1 text-blue-700">{properties.ward}</span>
              </div>
            )}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Parcel Information</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 text-blue-600 mr-2" />
                <span className="font-medium">ID:</span>
                <span className="ml-1 text-blue-700 font-mono">{properties.parcel_id}</span>
              </div>
              <div className="flex items-center text-sm">
                <Zap className="h-4 w-4 text-blue-600 mr-2" />
                <span className="font-medium">Area:</span>
                <span className="ml-1 text-blue-700 font-semibold">
                  {formatArea(properties.area_sqm || 0)}
                </span>
              </div>
              {properties.perimeter_m && (
                <div className="flex items-center text-sm">
                  <Zap className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="font-medium">Perimeter:</span>
                  <span className="ml-1 text-blue-700">{formatDistance(properties.perimeter_m)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Owner Information */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-3">Owner Information</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <User className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">
                    {properties.owner_name || 'Not specified'}
                  </p>
                  {properties.owner_id && (
                    <p className="text-sm text-green-700 font-mono">{properties.owner_id}</p>
                  )}
                </div>
              </div>
              
              {properties.address && (
                <div className="flex items-start">
                  <Home className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                  <p className="text-sm text-green-700">{properties.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="font-semibold text-orange-900 mb-3">Property Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-orange-600 uppercase font-medium">Land Use</p>
                <p className="text-sm text-orange-800 font-medium">
                  {properties.land_use || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-xs text-orange-600 uppercase font-medium">Zoning</p>
                <p className="text-sm text-orange-800 font-medium">
                  {properties.zoning || 'Not specified'}
                </p>
              </div>
            </div>
          </div>

          {/* Valuation */}
          {properties.valuation && (
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">Property Valuation</h3>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-lg font-bold text-purple-800">
                  {formatCurrency(properties.valuation)}
                </span>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Record Information</h3>
            <div className="space-y-2">
              {properties.created_at && (
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="font-medium">Created:</span>
                  <span className="ml-1 text-gray-600">
                    {new Date(properties.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              {properties.updated_at && properties.updated_at !== properties.created_at && (
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="font-medium">Updated:</span>
                  <span className="ml-1 text-gray-600">
                    {new Date(properties.updated_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Button
            onClick={() => setShowExportModal(true)}
            className="w-full justify-center"
            variant="primary"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          
          <Button
            onClick={handleShare}
            className="w-full justify-center"
            variant="outline"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {showExportModal && (
        <ExportModal
          parcel={parcel}
          onExport={handleExport}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </>
  );
};

export default ParcelDetails;