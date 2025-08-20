import { ParcelCollection, ParcelFeature } from '../types';

// Mock data for Tanzania regions - Dar es Salaam and Arusha
export const mockParcels: ParcelCollection = {
  type: "FeatureCollection",
  total: 12,
  features: [
    // Dar es Salaam Region - Kinondoni District
    {
      type: "Feature",
      id: "DSM001",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [39.2050, -6.7820],
          [39.2070, -6.7820],
          [39.2070, -6.7810],
          [39.2050, -6.7810],
          [39.2050, -6.7820]
        ]]
      },
      properties: {
        parcel_id: "DSM001",
        region: "Dar es Salaam",
        district: "Kinondoni",
        ward: "Msasani",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [39.2050, -6.7820],
            [39.2070, -6.7820],
            [39.2070, -6.7810],
            [39.2050, -6.7810],
            [39.2050, -6.7820]
          ]]
        },
        area_sqm: 2450,
        perimeter_m: 198,
        owner_name: "John Mwalimu",
        owner_id: "TZ1234567890",
        address: "Plot 123, Msasani Ward, Kinondoni",
        land_use: "Residential",
        zoning: "R1",
        valuation: 125000,
        created_at: "2024-01-15",
        updated_at: "2024-01-15"
      }
    },
    {
      type: "Feature",
      id: "DSM002",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [39.2070, -6.7820],
          [39.2090, -6.7820],
          [39.2090, -6.7805],
          [39.2070, -6.7805],
          [39.2070, -6.7820]
        ]]
      },
      properties: {
        parcel_id: "DSM002",
        region: "Dar es Salaam",
        district: "Kinondoni",
        ward: "Msasani",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [39.2070, -6.7820],
            [39.2090, -6.7820],
            [39.2090, -6.7805],
            [39.2070, -6.7805],
            [39.2070, -6.7820]
          ]]
        },
        area_sqm: 1875,
        perimeter_m: 174,
        owner_name: "Grace Kimaro",
        owner_id: "TZ0987654321",
        address: "Plot 124, Msasani Ward, Kinondoni",
        land_use: "Commercial",
        zoning: "C1",
        valuation: 180000,
        created_at: "2024-01-16",
        updated_at: "2024-01-16"
      }
    },
    {
      type: "Feature",
      id: "DSM003",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [39.2100, -6.7850],
          [39.2120, -6.7850],
          [39.2120, -6.7835],
          [39.2100, -6.7835],
          [39.2100, -6.7850]
        ]]
      },
      properties: {
        parcel_id: "DSM003",
        region: "Dar es Salaam",
        district: "Ilala",
        ward: "Kariakoo",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [39.2100, -6.7850],
            [39.2120, -6.7850],
            [39.2120, -6.7835],
            [39.2100, -6.7835],
            [39.2100, -6.7850]
          ]]
        },
        area_sqm: 1950,
        perimeter_m: 176,
        owner_name: "Mohamed Hassan",
        owner_id: "TZ1122334455",
        address: "Plot 125, Kariakoo Ward, Ilala",
        land_use: "Mixed Use",
        zoning: "MU1",
        valuation: 165000,
        created_at: "2024-01-17",
        updated_at: "2024-01-17"
      }
    },
    {
      type: "Feature",
      id: "DSM004",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [39.2080, -6.7900],
          [39.2100, -6.7900],
          [39.2100, -6.7885],
          [39.2080, -6.7885],
          [39.2080, -6.7900]
        ]]
      },
      properties: {
        parcel_id: "DSM004",
        region: "Dar es Salaam",
        district: "Temeke",
        ward: "Chang'ombe",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [39.2080, -6.7900],
            [39.2100, -6.7900],
            [39.2100, -6.7885],
            [39.2080, -6.7885],
            [39.2080, -6.7900]
          ]]
        },
        area_sqm: 2200,
        perimeter_m: 188,
        owner_name: "Elizabeth Ndoto",
        owner_id: "TZ5566778899",
        address: "Plot 126, Chang'ombe Ward, Temeke",
        land_use: "Residential",
        zoning: "R2",
        valuation: 145000,
        created_at: "2024-01-18",
        updated_at: "2024-01-18"
      }
    },
    // Arusha Region - Arusha City
    {
      type: "Feature",
      id: "ARU001",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [36.6820, -3.3670],
          [36.6840, -3.3670],
          [36.6840, -3.3655],
          [36.6820, -3.3655],
          [36.6820, -3.3670]
        ]]
      },
      properties: {
        parcel_id: "ARU001",
        region: "Arusha",
        district: "Arusha City",
        ward: "Kaloleni",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [36.6820, -3.3670],
            [36.6840, -3.3670],
            [36.6840, -3.3655],
            [36.6820, -3.3655],
            [36.6820, -3.3670]
          ]]
        },
        area_sqm: 3200,
        perimeter_m: 226,
        owner_name: "Peter Mollel",
        owner_id: "TZ2233445566",
        address: "Plot 201, Kaloleni Ward, Arusha City",
        land_use: "Residential",
        zoning: "R1",
        valuation: 95000,
        created_at: "2024-01-19",
        updated_at: "2024-01-19"
      }
    },
    {
      type: "Feature",
      id: "ARU002",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [36.6840, -3.3670],
          [36.6860, -3.3670],
          [36.6860, -3.3650],
          [36.6840, -3.3650],
          [36.6840, -3.3670]
        ]]
      },
      properties: {
        parcel_id: "ARU002",
        region: "Arusha",
        district: "Arusha City",
        ward: "Kaloleni",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [36.6840, -3.3670],
            [36.6860, -3.3670],
            [36.6860, -3.3650],
            [36.6840, -3.3650],
            [36.6840, -3.3670]
          ]]
        },
        area_sqm: 2800,
        perimeter_m: 212,
        owner_name: "Sarah Mushi",
        owner_id: "TZ3344556677",
        address: "Plot 202, Kaloleni Ward, Arusha City",
        land_use: "Commercial",
        zoning: "C1",
        valuation: 120000,
        created_at: "2024-01-20",
        updated_at: "2024-01-20"
      }
    },
    {
      type: "Feature",
      id: "ARU003",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [36.6800, -3.3700],
          [36.6825, -3.3700],
          [36.6825, -3.3680],
          [36.6800, -3.3680],
          [36.6800, -3.3700]
        ]]
      },
      properties: {
        parcel_id: "ARU003",
        region: "Arusha",
        district: "Arusha Rural",
        ward: "Olasiti",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [36.6800, -3.3700],
            [36.6825, -3.3700],
            [36.6825, -3.3680],
            [36.6800, -3.3680],
            [36.6800, -3.3700]
          ]]
        },
        area_sqm: 4500,
        perimeter_m: 268,
        owner_name: "James Laizer",
        owner_id: "TZ4455667788",
        address: "Plot 203, Olasiti Ward, Arusha Rural",
        land_use: "Agricultural",
        zoning: "A1",
        valuation: 75000,
        created_at: "2024-01-21",
        updated_at: "2024-01-21"
      }
    },
    {
      type: "Feature",
      id: "ARU004",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [36.6870, -3.3720],
          [36.6895, -3.3720],
          [36.6895, -3.3700],
          [36.6870, -3.3700],
          [36.6870, -3.3720]
        ]]
      },
      properties: {
        parcel_id: "ARU004",
        region: "Arusha",
        district: "Arusha City",
        ward: "Sekei",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [36.6870, -3.3720],
            [36.6895, -3.3720],
            [36.6895, -3.3700],
            [36.6870, -3.3700],
            [36.6870, -3.3720]
          ]]
        },
        area_sqm: 3800,
        perimeter_m: 246,
        owner_name: "Mary Kisamo",
        owner_id: "TZ5566778800",
        address: "Plot 204, Sekei Ward, Arusha City",
        land_use: "Mixed Use",
        zoning: "MU1",
        valuation: 110000,
        created_at: "2024-01-22",
        updated_at: "2024-01-22"
      }
    },
    // Bagamoyo Region (Coast Region)
    {
      type: "Feature",
      id: "BAG001",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [38.9020, -6.4350],
          [38.9040, -6.4350],
          [38.9040, -6.4330],
          [38.9020, -6.4330],
          [38.9020, -6.4350]
        ]]
      },
      properties: {
        parcel_id: "BAG001",
        region: "Bagamoyo",
        district: "Bagamoyo",
        ward: "Bagamoyo",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [38.9020, -6.4350],
            [38.9040, -6.4350],
            [38.9040, -6.4330],
            [38.9020, -6.4330],
            [38.9020, -6.4350]
          ]]
        },
        area_sqm: 2600,
        perimeter_m: 204,
        owner_name: "Hassan Mwalimu",
        owner_id: "TZ6677889900",
        address: "Plot 301, Bagamoyo Ward",
        land_use: "Residential",
        zoning: "R1",
        valuation: 85000,
        created_at: "2024-01-23",
        updated_at: "2024-01-23"
      }
    },
    {
      type: "Feature",
      id: "BAG002",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [38.9040, -6.4350],
          [38.9065, -6.4350],
          [38.9065, -6.4325],
          [38.9040, -6.4325],
          [38.9040, -6.4350]
        ]]
      },
      properties: {
        parcel_id: "BAG002",
        region: "Bagamoyo",
        district: "Bagamoyo",
        ward: "Msata",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [38.9040, -6.4350],
            [38.9065, -6.4350],
            [38.9065, -6.4325],
            [38.9040, -6.4325],
            [38.9040, -6.4350]
          ]]
        },
        area_sqm: 3100,
        perimeter_m: 222,
        owner_name: "Fatuma Juma",
        owner_id: "TZ7788990011",
        address: "Plot 302, Msata Ward, Bagamoyo",
        land_use: "Agricultural",
        zoning: "A1",
        valuation: 65000,
        created_at: "2024-01-24",
        updated_at: "2024-01-24"
      }
    },
    {
      type: "Feature",
      id: "BAG003",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [38.9000, -6.4380],
          [38.9025, -6.4380],
          [38.9025, -6.4360],
          [38.9000, -6.4360],
          [38.9000, -6.4380]
        ]]
      },
      properties: {
        parcel_id: "BAG003",
        region: "Bagamoyo",
        district: "Bagamoyo",
        ward: "Kaole",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [38.9000, -6.4380],
            [38.9025, -6.4380],
            [38.9025, -6.4360],
            [38.9000, -6.4360],
            [38.9000, -6.4380]
          ]]
        },
        area_sqm: 2900,
        perimeter_m: 215,
        owner_name: "Ibrahim Selemani",
        owner_id: "TZ8899001122",
        address: "Plot 303, Kaole Ward, Bagamoyo",
        land_use: "Commercial",
        zoning: "C1",
        valuation: 95000,
        created_at: "2024-01-25",
        updated_at: "2024-01-25"
      }
    },
    {
      type: "Feature",
      id: "BAG004",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [38.9070, -6.4400],
          [38.9095, -6.4400],
          [38.9095, -6.4375],
          [38.9070, -6.4375],
          [38.9070, -6.4400]
        ]]
      },
      properties: {
        parcel_id: "BAG004",
        region: "Bagamoyo",
        district: "Bagamoyo",
        ward: "Dunda",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [38.9070, -6.4400],
            [38.9095, -6.4400],
            [38.9095, -6.4375],
            [38.9070, -6.4375],
            [38.9070, -6.4400]
          ]]
        },
        area_sqm: 3400,
        perimeter_m: 233,
        owner_name: "Amina Rajabu",
        owner_id: "TZ9900112233",
        address: "Plot 304, Dunda Ward, Bagamoyo",
        land_use: "Mixed Use",
        zoning: "MU1",
        valuation: 88000,
        created_at: "2024-01-26",
        updated_at: "2024-01-26"
      }
    }
  ]
};

// Region coordinates for map centering
export const regionCoordinates = {
  "Dar es Salaam": { lat: -6.7924, lng: 39.2083, zoom: 13 },
  "Arusha": { lat: -3.3869, lng: 36.6830, zoom: 12 },
  "Bagamoyo": { lat: -6.4429, lng: 38.9019, zoom: 12 }
};

export class MockApiService {
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  async getParcels(bbox?: string, limit = 1000): Promise<ParcelCollection> {
    await this.delay(800);
    return mockParcels;
  }

  async getParcelsByRegion(regions: string[]): Promise<ParcelCollection> {
    await this.delay(600);
    
    if (regions.length === 0) {
      return mockParcels;
    }

    const filtered = mockParcels.features.filter(parcel => 
      regions.includes(parcel.properties.region)
    );

    return {
      type: "FeatureCollection",
      features: filtered,
      total: filtered.length
    };
  }

  async getParcel(parcelId: string): Promise<ParcelFeature | null> {
    await this.delay(500);
    const parcel = mockParcels.features.find(p => p.id === parcelId);
    return parcel || null;
  }

  async searchParcels(searchParams: { field: string; value: string }): Promise<ParcelCollection> {
    await this.delay(600);
    const filtered = mockParcels.features.filter(parcel => {
      const fieldValue = parcel.properties[searchParams.field as keyof typeof parcel.properties];
      return fieldValue?.toString().toLowerCase().includes(searchParams.value.toLowerCase());
    });

    return {
      type: "FeatureCollection",
      features: filtered,
      total: filtered.length
    };
  }
}

export const mockApiService = new MockApiService();