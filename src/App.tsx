import React, { useState, useCallback, useEffect } from 'react';
import { MapPin, Menu, X, User, LogOut, List } from 'lucide-react';
import BaseMap from './components/Map/BaseMap';
import SearchBar from './components/Search/SearchBar';
import RegionFilter from './components/Search/RegionFilter';
import ParcelDetails from './components/ParcelDetails/ParcelDetails';
import StatsPanel from './components/Stats/StatsPanel';
import PlotListings from './components/Listings/PlotListings';
import LoginModal from './components/Auth/LoginModal';
import InquiryModal from './components/Inquiry/InquiryModal';
import LoadingSpinner from './components/UI/LoadingSpinner';
import Button from './components/UI/Button';
import { ParcelCollection, ParcelFeature, SearchParams, RegionFilter as RegionFilterType } from './types';
import { apiService } from './services/api';
import { authService, User as AuthUser } from './services/authService';

// Region coordinates for map centering
const regionCoordinates = {
  "Dar es Salaam": { lat: -6.7924, lng: 39.2083, zoom: 13 },
  "Arusha": { lat: -3.3869, lng: 36.6830, zoom: 12 },
  "Bagamoyo": { lat: -6.4429, lng: 38.9019, zoom: 12 }
};

function App() {
  const [parcels, setParcels] = useState<ParcelCollection | null>(null);
  const [selectedParcel, setSelectedParcel] = useState<ParcelFeature | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showListings, setShowListings] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number; zoom: number } | undefined>();
  const [regions, setRegions] = useState<RegionFilterType[]>([
    { region: 'Dar es Salaam', enabled: true },
    { region: 'Arusha', enabled: true },
    { region: 'Bagamoyo', enabled: true }
  ]);

  // Load initial data
  useEffect(() => {
    // Check authentication status
    const user = authService.getUser();
    setCurrentUser(user);
    
    handleRegionFilter();
  }, []);

  const handleRegionFilter = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const enabledRegions = regions.filter(r => r.enabled).map(r => r.region);
      const data = await apiService.getParcelsByRegion(enabledRegions);
      setParcels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load parcels');
    } finally {
      setLoading(false);
    }
  }, [regions]);

  useEffect(() => {
    handleRegionFilter();
  }, [handleRegionFilter]);
  const handleBoundsChange = useCallback(async (bbox: string) => {
    const enabledRegions = regions.filter(r => r.enabled).map(r => r.region);
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getParcels(bbox, enabledRegions);
      setParcels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load parcels');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async (searchParams: SearchParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const enabledRegions = regions.filter(r => r.enabled).map(r => r.region);
      const data = await apiService.searchParcels(searchParams, enabledRegions);
      setParcels(data);
      setShowStats(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearchClear = useCallback(() => {
    handleRegionFilter();
  }, [handleRegionFilter]);

  const handleParcelClick = useCallback((parcel: ParcelFeature) => {
    setSelectedParcel(parcel);
    setSidebarOpen(true);
  }, []);

  const handleRegionToggle = useCallback((regionName: string) => {
    setRegions(prev => prev.map(r => 
      r.region === regionName ? { ...r, enabled: !r.enabled } : r
    ));
  }, []);

  const handleRegionFocus = useCallback((regionName: string) => {
    const coords = regionCoordinates[regionName as keyof typeof regionCoordinates];
    if (coords) {
      setMapCenter(coords);
    }
  }, []);
  const closeSidebar = () => {
    setSelectedParcel(null);
    setSidebarOpen(false);
    setShowStats(false);
  };

  const toggleStats = () => {
    setShowStats(!showStats);
    setShowListings(false);
    setSelectedParcel(null);
    setSidebarOpen(true);
  };

  const toggleListings = () => {
    setShowListings(!showListings);
    setShowStats(false);
    setSelectedParcel(null);
    setSidebarOpen(true);
  };

  const handleLogin = async (email: string, password: string) => {
    const authData = await authService.login({ email, password });
    setCurrentUser(authData.user);
  };

  const handleRegister = async (userData: any) => {
    await authService.register(userData);
    // Auto-login after registration
    const authData = await authService.login({ 
      email: userData.email, 
      password: userData.password 
    });
    setCurrentUser(authData.user);
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  const handlePlotSelect = (listing: any) => {
    // Focus map on the selected plot
    if (listing.parcel) {
      // You would need to get coordinates from the parcel geometry
      // For now, focus on the region
      const coords = regionCoordinates[listing.parcel.region as keyof typeof regionCoordinates];
      if (coords) {
        setMapCenter(coords);
      }
    }
    setSidebarOpen(false);
    setShowListings(false);
  };

  const handleInquire = (listing: any) => {
    setSelectedListing(listing);
    setShowInquiryModal(true);
  };

  const handleSubmitInquiry = async (inquiryData: any) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/listings/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inquiryData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to submit inquiry');
    }

    return response.json();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Title */}
            <div className="flex items-center">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Tanzania Land Parcel System
                  </h1>
                  <p className="text-sm text-gray-500">Dar es Salaam • Arusha • Bagamoyo</p>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex items-center space-x-4">
              <SearchBar 
                onSearch={handleSearch} 
                onClear={handleSearchClear}
                isLoading={loading} 
              />
            </div>

            {/* Mobile Menu and Stats Toggle */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={toggleListings}
                variant="outline"
                size="sm"
                className="hidden sm:flex"
              >
                <List className="w-4 h-4 mr-1" />
                Listings
              </Button>
              
              <Button
                onClick={toggleStats}
                variant="outline"
                size="sm"
                className="hidden sm:flex"
              >
                Statistics
              </Button>
              
              {currentUser ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 hidden md:inline">
                    {currentUser.first_name || currentUser.email}
                  </span>
                  <Button onClick={handleLogout} variant="ghost" size="sm">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setShowLoginModal(true)} variant="outline" size="sm">
                  <User className="w-4 h-4 mr-1" />
                  Sign In
                </Button>
              )}
              
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <SearchBar 
              onSearch={handleSearch} 
              onClear={handleSearchClear}
              isLoading={loading} 
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* Region Filter Sidebar */}
        <div className="hidden lg:block w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <RegionFilter
            regions={regions}
            onRegionToggle={handleRegionToggle}
            onRegionFocus={handleRegionFocus}
          />
        </div>
        {/* Map */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="text-sm text-gray-600 mt-2">Loading parcels...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute top-4 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-10 max-w-md">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {parcels && parcels.features.length === 0 && !loading && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg shadow-lg z-10">
              <p className="text-sm">No parcels found in this area. Try adjusting your search or zoom level.</p>
            </div>
          )}

          <BaseMap
            parcels={parcels}
            onParcelClick={handleParcelClick}
            onBoundsChange={handleBoundsChange}
            mapCenter={mapCenter}
            selectedRegions={regions.filter(r => r.enabled).map(r => r.region as TanzaniaRegion)}
            mapCenter={mapCenter}
            className="h-full"
          />

          {/* Results Counter */}
          {parcels && (
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 z-10">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-blue-600">{parcels.features.length}</span> parcels
                <span className="text-gray-400 ml-1">
                  ({regions.filter(r => r.enabled).map(r => r.region).join(', ')})
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className={`
          fixed md:relative top-0 right-0 h-full w-80 bg-white shadow-xl border-l border-gray-200 z-20
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          ${!sidebarOpen && !selectedParcel && !showStats && !showListings ? 'md:hidden' : ''}
        `}>
          {selectedParcel ? (
            <ParcelDetails 
              parcel={selectedParcel}
              onClose={closeSidebar}
            />
          ) : showListings ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Available Plots</h2>
                <button
                  onClick={closeSidebar}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <PlotListings
                  region={regions.find(r => r.enabled)?.region}
                  onPlotSelect={handlePlotSelect}
                  onInquire={handleInquire}
                />
              </div>
            </div>
          ) : showStats ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Statistics</h2>
                <button
                  onClick={closeSidebar}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <StatsPanel parcels={parcels} />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <MapPin className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Parcel</h3>
              <p className="text-gray-500 text-sm">
                Click on any parcel on the map to view its detailed information, or view statistics for the current area.
              </p>
              <div className="text-xs text-gray-400 mb-4">
                <p>Active Regions:</p>
                <p className="font-medium">
                  {regions.filter(r => r.enabled).map(r => r.region).join(', ')}
                </p>
              </div>
              <Button
                onClick={toggleStats}
                variant="outline"
                className="mt-4"
              >
                View Statistics
              </Button>
              <Button
                onClick={toggleListings}
                variant="primary"
                className="mt-2"
              >
                <List className="w-4 h-4 mr-1" />
                Browse Plots
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
            onClick={closeSidebar}
          />
        )}
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      <InquiryModal
        isOpen={showInquiryModal}
        onClose={() => setShowInquiryModal(false)}
        listing={selectedListing}
        onSubmit={handleSubmitInquiry}
      />
    </div>
  );
}

export default App;