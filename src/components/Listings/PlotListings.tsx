import React, { useState, useEffect } from 'react';
import { MapPin, DollarSign, Maximize2, Star, Phone, Mail, Eye } from 'lucide-react';
import { formatArea, formatCurrency } from '../../utils/geoUtils';
import Button from '../UI/Button';
import LoadingSpinner from '../UI/LoadingSpinner';

interface PlotListing {
  id: string;
  title: string;
  description?: string;
  price: number;
  price_per_sqm?: number;
  status: string;
  featured: boolean;
  amenities: string[];
  images: string[];
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  parcel: {
    parcel_id: string;
    region: string;
    district?: string;
    area_sqm?: number;
    land_use?: string;
  };
  created_at: string;
}

interface PlotListingsProps {
  region?: string;
  onPlotSelect: (listing: PlotListing) => void;
  onInquire: (listing: PlotListing) => void;
}

const PlotListings: React.FC<PlotListingsProps> = ({ region, onPlotSelect, onInquire }) => {
  const [listings, setListings] = useState<PlotListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    featured: false,
    minPrice: '',
    maxPrice: '',
    landUse: ''
  });

  useEffect(() => {
    fetchListings();
  }, [region, filter]);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (region) params.append('region', region);
      if (filter.featured) params.append('featured', 'true');
      if (filter.minPrice) params.append('min_price', filter.minPrice);
      if (filter.maxPrice) params.append('max_price', filter.maxPrice);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/listings?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }

      const data = await response.json();
      setListings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">Error loading listings</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Plots</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filter.featured}
                onChange={(e) => handleFilterChange('featured', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Featured only</span>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
            <input
              type="number"
              value={filter.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
            <input
              type="number"
              value={filter.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              placeholder="1000000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <Button onClick={fetchListings} size="sm" className="mt-6">
              Apply Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {/* Image placeholder */}
            <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 relative">
              {listing.featured && (
                <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </div>
              )}
              <div className="absolute bottom-3 right-3 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-medium">
                {listing.parcel.region}
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {listing.title}
                </h3>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {listing.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{listing.parcel.parcel_id} • {listing.parcel.district}</span>
                </div>
                
                {listing.parcel.area_sqm && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Maximize2 className="w-4 h-4 mr-2" />
                    <span>{formatArea(listing.parcel.area_sqm)}</span>
                  </div>
                )}

                <div className="flex items-center text-lg font-bold text-blue-600">
                  <DollarSign className="w-5 h-5 mr-1" />
                  <span>{formatCurrency(listing.price)}</span>
                </div>

                {listing.price_per_sqm && (
                  <div className="text-sm text-gray-500">
                    {formatCurrency(listing.price_per_sqm)}/m²
                  </div>
                )}
              </div>

              {/* Amenities */}
              {listing.amenities.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {listing.amenities.slice(0, 3).map((amenity, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {amenity}
                      </span>
                    ))}
                    {listing.amenities.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{listing.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              {listing.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {listing.description}
                </p>
              )}

              {/* Contact Info */}
              {(listing.contact_phone || listing.contact_email) && (
                <div className="border-t pt-3 mb-4">
                  <p className="text-xs text-gray-500 mb-2">Contact: {listing.contact_person}</p>
                  <div className="flex items-center space-x-4 text-xs">
                    {listing.contact_phone && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-3 h-3 mr-1" />
                        <span>{listing.contact_phone}</span>
                      </div>
                    )}
                    {listing.contact_email && (
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-3 h-3 mr-1" />
                        <span>{listing.contact_email}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  onClick={() => onPlotSelect(listing)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View on Map
                </Button>
                <Button
                  onClick={() => onInquire(listing)}
                  size="sm"
                  className="flex-1"
                >
                  Inquire
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {listings.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No plots found</h3>
          <p className="text-gray-500">
            Try adjusting your filters or check back later for new listings.
          </p>
        </div>
      )}
    </div>
  );
};

export default PlotListings;