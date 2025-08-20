# Tanzania Land Parcel System - Complete Setup Guide

## Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Supabase account
- Git

## 1. Database Setup (Supabase)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully initialized
3. Go to Settings → API to get your keys:
   - `Project URL` (VITE_SUPABASE_URL)
   - `anon public` key (VITE_SUPABASE_ANON_KEY)
   - `service_role` key (SUPABASE_SERVICE_ROLE_KEY)

### Step 2: Enable PostGIS Extension
1. Go to Database → Extensions in your Supabase dashboard
2. Search for "postgis" and enable it
3. This enables spatial data support for your parcels

### Step 3: Get Database Connection String
1. Go to Settings → Database
2. Copy the connection string under "Connection string"
3. Replace `[YOUR-PASSWORD]` with your actual database password

## 2. Backend Setup

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Create Virtual Environment
```bash
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables
Create `backend/.env` file with your actual Supabase credentials:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SECRET_KEY=your_super_secret_key_change_in_production_min_32_chars
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Step 5: Run Database Migrations
The migrations are already created. Your Supabase database should already have the schema from the migration files.

### Step 6: Seed Sample Data
```bash
python scripts/seed_enhanced_data.py
```

This will create:
- 3 sample users (admin, manager, agent)
- 7 parcels across 3 regions (Dar es Salaam, Arusha, Bagamoyo)
- 4 plot listings
- 2 API keys for external integration
- 2 sample inquiries

### Step 7: Start Backend Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000

## 3. Frontend Setup

### Step 1: Navigate to Root Directory
```bash
cd ..  # Go back to root directory
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create `.env` file in root directory:
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 4: Start Frontend Development Server
```bash
npm run dev
```

Frontend will be available at: http://localhost:5173

## 4. Sample Data and Shapefile Integration

### Current Sample Data
The system includes sample parcels for three Tanzania regions:
- **Dar es Salaam**: 4 parcels (Kinondoni, Ilala, Temeke districts)
- **Arusha**: 4 parcels (Arusha City, Arusha Rural districts)
- **Bagamoyo**: 4 parcels (Bagamoyo district)

### Adding More Shapefile Data

#### Option 1: Using the Seed Script
Modify `backend/scripts/seed_enhanced_data.py` to add more parcels:

```python
# Add more parcels to the parcels_data array
{
    "parcel_id": "NEW001",
    "geometry": Polygon([
        [longitude1, latitude1], [longitude2, latitude2], 
        [longitude3, latitude3], [longitude4, latitude4], 
        [longitude1, latitude1]  # Close the polygon
    ]),
    "region": "Your Region",
    "district": "Your District",
    "ward": "Your Ward",
    "area_sqm": 2500,
    "perimeter_m": 200,
    "owner_name": "Owner Name",
    "owner_id": "TZ1234567890",
    "address": "Full Address",
    "land_use": "Residential",
    "zoning": "R1",
    "valuation": 100000
}
```

#### Option 2: Direct Database Insert
Use SQL to insert parcels directly:

```sql
INSERT INTO parcels (parcel_id, geometry, region, district, ward, area_sqm, perimeter_m, owner_name, owner_id, address, land_use, zoning, valuation)
VALUES (
    'CUSTOM001',
    ST_GeomFromText('POLYGON((39.2050 -6.7820, 39.2070 -6.7820, 39.2070 -6.7810, 39.2050 -6.7810, 39.2050 -6.7820))', 4326),
    'Dar es Salaam',
    'Kinondoni',
    'Msasani',
    2450,
    198,
    'John Doe',
    'TZ1234567890',
    'Plot 123, Msasani Ward',
    'Residential',
    'R1',
    125000
);
```

#### Option 3: Shapefile Upload (Future Enhancement)
The system has tables ready for shapefile processing:
- `shapefile_data` - stores uploaded shapefiles
- `spatial_layers` - organizes processed spatial data

## 5. Testing the System

### Step 1: Access the Application
1. Open http://localhost:5173 in your browser
2. You should see the Tanzania Land Parcel System interface

### Step 2: Test User Authentication
Login credentials (created by seed script):
- **Admin**: admin@landparcel.com / admin123
- **Manager**: manager@landparcel.com / manager123
- **Agent**: agent@landparcel.com / agent123

### Step 3: Test Core Features
1. **Map Interaction**: Click on parcels to view details
2. **Region Filtering**: Toggle regions in the sidebar
3. **Search**: Search by owner name, parcel ID, etc.
4. **Plot Listings**: View available plots for sale
5. **Inquiries**: Submit inquiries for plots

### Step 4: Test API Endpoints
Backend API documentation: http://localhost:8000/docs

Key endpoints:
- `GET /api/v1/parcels` - Get parcels
- `GET /api/v1/listings` - Get plot listings
- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/listings/inquiries` - Submit inquiries

## 6. Production Deployment

### Environment Variables for Production
Update your `.env` files with production values:
- Use HTTPS URLs
- Use strong secret keys
- Configure proper CORS origins
- Use production database credentials

### Build Commands
```bash
# Frontend build
npm run build

# Backend with gunicorn
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## 7. Troubleshooting

### Common Issues:
1. **CORS Errors**: Check ALLOWED_ORIGINS in backend/.env
2. **Database Connection**: Verify DATABASE_URL and Supabase credentials
3. **Missing PostGIS**: Enable postgis extension in Supabase
4. **Authentication Issues**: Check SECRET_KEY and token expiration

### Logs:
- Backend logs: Check terminal where uvicorn is running
- Frontend logs: Check browser developer console
- Database logs: Check Supabase dashboard logs

## 8. Next Steps

1. **Add More Sample Data**: Use the seed script or direct SQL inserts
2. **Customize Regions**: Add more Tanzania regions to the system
3. **Upload Shapefiles**: Implement shapefile upload functionality
4. **Configure External APIs**: Set up API keys for external integrations
5. **Deploy to Production**: Use services like Vercel (frontend) and Railway/Heroku (backend)

Your system is now ready to run! The database schema is complete, all interactions are valid, and the sample data will provide a good foundation for testing and development.