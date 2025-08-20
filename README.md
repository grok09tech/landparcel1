# Tanzania Land Parcel Mapping System

A comprehensive GIS web application for managing and visualizing land parcels in Tanzania with FastAPI backend and Supabase PostgreSQL database integration.

## Features

- **Interactive Mapping**: OpenStreetMap-based interface with parcel overlays
- **Regional Filtering**: Filter parcels by Tanzania regions (Dar es Salaam, Arusha, Bagamoyo)
- **Advanced Search**: Search by owner name, parcel ID, address, land use, or region
- **Detailed Parcel Information**: View comprehensive property details and measurements
- **Export Functionality**: Export parcel data in PDF, CSV, or GeoJSON formats
- **Statistics Dashboard**: Regional distribution and land use analytics
- **Responsive Design**: Optimized for desktop and mobile devices

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Leaflet.js** for interactive mapping
- **Supabase Client** for database integration

### Backend
- **FastAPI** with Python 3.9+
- **SQLAlchemy** with GeoAlchemy2 for spatial data
- **PostgreSQL** with PostGIS extension
- **Alembic** for database migrations

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- PostgreSQL with PostGIS extension
- Supabase account (optional, for hosted database)

### Backend Setup

1. **Create virtual environment**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Setup database**:
```sql
-- Create database
CREATE DATABASE land_parcels;

-- Connect to database
\c land_parcels;

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
```

4. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

5. **Run database migrations**:
```bash
alembic upgrade head
```

6. **Seed sample data**:
```bash
python scripts/seed_data.py
```

7. **Start the API server**:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your API and Supabase URLs
```

3. **Start development server**:
```bash
npm run dev
```

### Supabase Integration

1. **Create Supabase project** at [supabase.com](https://supabase.com)

2. **Enable PostGIS extension** in Supabase dashboard:
   - Go to Database → Extensions
   - Enable "postgis" extension

3. **Update environment variables** with Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

4. **Run migrations** against Supabase database:
```bash
cd backend
alembic upgrade head
python scripts/seed_data.py
```

## API Endpoints

### Parcels
- `GET /api/v1/parcels` - Get parcels by region or bounding box
- `GET /api/v1/parcels/{parcel_id}` - Get specific parcel details
- `GET /api/v1/parcels/search` - Search parcels by field
- `POST /api/v1/parcels` - Create new parcel

### Health Check
- `GET /health` - API health status

## Database Schema

### Parcels Table
```sql
CREATE TABLE parcels (
    id SERIAL PRIMARY KEY,
    parcel_id VARCHAR(50) UNIQUE NOT NULL,
    geometry GEOMETRY(POLYGON, 4326) NOT NULL,
    region VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    ward VARCHAR(100),
    area_sqm DECIMAL(15,2),
    perimeter_m DECIMAL(10,2),
    owner_name VARCHAR(255),
    owner_id VARCHAR(50),
    address TEXT,
    land_use VARCHAR(100),
    zoning VARCHAR(50),
    valuation DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## Sample Data

The system includes sample parcels for three Tanzania regions:

- **Dar es Salaam**: 4 parcels in Kinondoni, Ilala, and Temeke districts
- **Arusha**: 4 parcels in Arusha City and Arusha Rural districts  
- **Bagamoyo**: 4 parcels in Bagamoyo district

## Development

### Adding New Regions
1. Update sample data in `backend/scripts/seed_data.py`
2. Add region coordinates in `src/App.tsx`
3. Update region filter options

### Database Migrations
```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

### Testing
```bash
# Backend tests
cd backend
pytest

# Frontend tests
npm run test
```

## Deployment

### Production Environment Variables
```env
# Frontend
VITE_API_URL=https://your-api-domain.com/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Backend
DATABASE_URL=postgresql://user:password@host:5432/database
SECRET_KEY=your-production-secret-key
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Build Commands
```bash
# Frontend build
npm run build

# Backend with gunicorn
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.