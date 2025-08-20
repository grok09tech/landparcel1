export const formatArea = (areaSqm: number): string => {
  if (areaSqm >= 10000) {
    return `${(areaSqm / 10000).toFixed(2)} hectares`;
  } else if (areaSqm >= 1000) {
    return `${(areaSqm / 1000).toFixed(2)} km²`;
  } else {
    return `${areaSqm.toFixed(0)} m²`;
  }
};

export const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  } else {
    return `${meters.toFixed(0)} m`;
  }
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lng2-lng1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

export const calculatePolygonArea = (coordinates: number[][]): number => {
  let area = 0;
  const n = coordinates.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += coordinates[i][0] * coordinates[j][1];
    area -= coordinates[j][0] * coordinates[i][1];
  }
  
  return Math.abs(area / 2) * 111319.9 * 111319.9; // Convert to square meters
};

export const exportToGeoJSON = (data: any): string => {
  return JSON.stringify(data, null, 2);
};

export const exportToCSV = (parcels: any[]): string => {
  const headers = ['Parcel ID', 'Owner Name', 'Area (m²)', 'Address', 'Land Use', 'Zoning', 'Valuation'];
  const rows = parcels.map(parcel => [
    parcel.properties.parcel_id,
    parcel.properties.owner_name || '',
    parcel.properties.area_sqm || '',
    parcel.properties.address || '',
    parcel.properties.land_use || '',
    parcel.properties.zoning || '',
    parcel.properties.valuation || ''
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
};