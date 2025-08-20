export interface Parcel {
  parcel_id: string;
  geometry: GeoJSON.Polygon;
  region: string;
  district?: string;
  ward?: string;
  area_sqm?: number;
  perimeter_m?: number;
  owner_name?: string;
  owner_id?: string;
  address?: string;
  land_use?: string;
  zoning?: string;
  valuation?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ParcelFeature extends GeoJSON.Feature {
  id: string;
  geometry: GeoJSON.Polygon;
  properties: Parcel;
}

export interface ParcelCollection extends GeoJSON.FeatureCollection {
  features: ParcelFeature[];
  total: number;
}

export interface SearchParams {
  field: 'owner_name' | 'parcel_id' | 'address' | 'land_use' | 'region';
  value: string;
}

export interface RegionFilter {
  region: string;
  enabled: boolean;
}

export interface MapBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface MeasurementResult {
  type: 'distance' | 'area';
  value: number;
  unit: string;
  coordinates: number[][];
}

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'geojson';
  includeGeometry: boolean;
  selectedOnly: boolean;
}