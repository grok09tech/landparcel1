import { ParcelCollection, ParcelFeature, SearchParams } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async getParcelsByRegion(regions: string[]): Promise<ParcelCollection> {
    const regionsParam = regions.length > 0 ? `?regions=${regions.join(',')}` : '';
    return this.request<ParcelCollection>(`/parcels${regionsParam}`);
  }

  async getParcels(bbox?: string, regions?: string[], limit = 1000): Promise<ParcelCollection> {
    const params = new URLSearchParams();
    if (bbox) params.append('bbox', bbox);
    if (regions && regions.length > 0) params.append('regions', regions.join(','));
    params.append('limit', limit.toString());

    return this.request<ParcelCollection>(`/parcels?${params}`);
  }

  async getParcel(parcelId: string): Promise<any> {
    return this.request(`/parcels/${parcelId}`);
  }

  async searchParcels(searchParams: SearchParams, regions?: string[]): Promise<ParcelCollection> {
    const params = new URLSearchParams();
    params.append('field', searchParams.field);
    params.append('value', searchParams.value);
    if (regions && regions.length > 0) params.append('regions', regions.join(','));

    return this.request<ParcelCollection>(`/parcels/search?${params}`);
  }

  async createParcel(parcelData: any): Promise<any> {
    return this.request('/parcels', {
      method: 'POST',
      body: JSON.stringify(parcelData),
    });
  }

  async healthCheck(): Promise<any> {
    return this.request('/health');
  }
}

export const apiService = new ApiService();