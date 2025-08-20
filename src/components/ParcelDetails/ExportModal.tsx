import React, { useState } from 'react';
import { X, Download, FileText, Table, Map } from 'lucide-react';
import { ParcelFeature, ExportOptions } from '../../types';
import { exportToGeoJSON, exportToCSV } from '../../utils/geoUtils';
import Button from '../UI/Button';

interface ExportModalProps {
  parcel: ParcelFeature;
  onExport: (options: ExportOptions) => void;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ parcel, onExport, onClose }) => {
  const [format, setFormat] = useState<'pdf' | 'csv' | 'geojson'>('pdf');
  const [includeGeometry, setIncludeGeometry] = useState(true);

  const handleExport = () => {
    const options: ExportOptions = {
      format,
      includeGeometry,
      selectedOnly: true
    };

    // Perform the actual export
    if (format === 'csv') {
      const csvData = exportToCSV([parcel]);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `parcel_${parcel.properties.parcel_id}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'geojson') {
      const geoJsonData = exportToGeoJSON(parcel);
      const blob = new Blob([geoJsonData], { type: 'application/geo+json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `parcel_${parcel.properties.parcel_id}.geojson`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // PDF export would require additional library like jsPDF
      alert('PDF export functionality would be implemented with a PDF generation library');
    }

    onExport(options);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Export Parcel Data</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setFormat('pdf')}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  format === 'pdf' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <FileText className="h-5 w-5 mx-auto mb-1" />
                <span className="text-xs">PDF</span>
              </button>
              <button
                onClick={() => setFormat('csv')}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  format === 'csv' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Table className="h-5 w-5 mx-auto mb-1" />
                <span className="text-xs">CSV</span>
              </button>
              <button
                onClick={() => setFormat('geojson')}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  format === 'geojson' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Map className="h-5 w-5 mx-auto mb-1" />
                <span className="text-xs">GeoJSON</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeGeometry}
                onChange={(e) => setIncludeGeometry(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Include geometry data</span>
            </label>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Export Preview:</h4>
            <div className="text-xs text-gray-600">
              <p>Parcel ID: {parcel.properties.parcel_id}</p>
              <p>Owner: {parcel.properties.owner_name}</p>
              <p>Format: {format.toUpperCase()}</p>
              <p>Geometry: {includeGeometry ? 'Included' : 'Excluded'}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 flex space-x-3">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleExport} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;