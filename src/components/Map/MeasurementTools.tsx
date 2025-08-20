import React, { useState } from 'react';
import { Ruler, Square, X } from 'lucide-react';
import Button from '../UI/Button';

interface MeasurementToolsProps {
  onMeasure: (type: 'distance' | 'area') => void;
  onClear: () => void;
  isActive: boolean;
  currentMeasurement?: {
    type: 'distance' | 'area';
    value: number;
    unit: string;
  } | null;
}

const MeasurementTools: React.FC<MeasurementToolsProps> = ({
  onMeasure,
  onClear,
  isActive,
  currentMeasurement
}) => {
  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Measurement Tools</h3>
      
      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMeasure('distance')}
          className="w-full justify-start"
        >
          <Ruler className="w-4 h-4 mr-2" />
          Distance
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMeasure('area')}
          className="w-full justify-start"
        >
          <Square className="w-4 h-4 mr-2" />
          Area
        </Button>

        {currentMeasurement && (
          <div className="mt-3 p-2 bg-blue-50 rounded border">
            <p className="text-xs text-gray-600 capitalize">{currentMeasurement.type}:</p>
            <p className="text-sm font-semibold text-blue-700">
              {currentMeasurement.value.toFixed(2)} {currentMeasurement.unit}
            </p>
          </div>
        )}

        {(isActive || currentMeasurement) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="w-full justify-start text-red-600 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

export default MeasurementTools;