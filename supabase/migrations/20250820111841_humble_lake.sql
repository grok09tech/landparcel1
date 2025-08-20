/*
# Complete Tanzania Land Parcel System Schema

## New Tables
- `parcels` - Core land parcel data with spatial geometry
- `users` - User management with roles and permissions  
- `user_roles` - Role-based access control definitions
- `user_permissions` - Granular user permissions
- `plot_listings` - Available plots for sale
- `plot_inquiries` - Customer inquiries and reservations
- `shapefile_data` - Raw shapefile storage and metadata
- `spatial_layers` - Organized spatial data layers
- `api_keys` - External system integration keys

## Security
- Enable RLS on all tables
- Add comprehensive policies for different user roles
- Spatial indexes for performance

## Features
- Complete user management system
- Plot listing and inquiry system
- Shapefile data management
- External API integration
- Role-based access control
*/

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create parcels table (base table)
CREATE TABLE IF NOT EXISTS parcels (
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create spatial index for parcels
CREATE INDEX IF NOT EXISTS idx_parcels_geometry ON parcels USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_parcels_region ON parcels (region);
CREATE INDEX IF NOT EXISTS idx_parcels_parcel_id ON parcels (parcel_id);
CREATE INDEX IF NOT EXISTS idx_parcels_owner_name ON parcels (owner_name);

-- Create user roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'customer',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- Create indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users (is_active);

-- Create user permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID REFERENCES users(id)
);

-- Create indexes for user permissions
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions (user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission ON user_permissions (permission);

-- Create plot listings table
CREATE TABLE IF NOT EXISTS plot_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id INTEGER NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(15,2) NOT NULL,
    price_per_sqm DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'active',
    featured BOOLEAN DEFAULT FALSE,
    amenities JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    contact_person VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    listed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for plot listings
CREATE INDEX IF NOT EXISTS idx_plot_listings_parcel_id ON plot_listings (parcel_id);
CREATE INDEX IF NOT EXISTS idx_plot_listings_status ON plot_listings (status);
CREATE INDEX IF NOT EXISTS idx_plot_listings_featured ON plot_listings (featured);
CREATE INDEX IF NOT EXISTS idx_plot_listings_listed_by ON plot_listings (listed_by);

-- Create plot inquiries table
CREATE TABLE IF NOT EXISTS plot_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id INTEGER NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES plot_listings(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    message TEXT,
    inquiry_type VARCHAR(50) DEFAULT 'general',
    status VARCHAR(50) DEFAULT 'pending',
    source_website VARCHAR(255),
    referral_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    responded_by UUID REFERENCES users(id)
);

-- Create indexes for plot inquiries
CREATE INDEX IF NOT EXISTS idx_plot_inquiries_parcel_id ON plot_inquiries (parcel_id);
CREATE INDEX IF NOT EXISTS idx_plot_inquiries_listing_id ON plot_inquiries (listing_id);
CREATE INDEX IF NOT EXISTS idx_plot_inquiries_status ON plot_inquiries (status);
CREATE INDEX IF NOT EXISTS idx_plot_inquiries_created_at ON plot_inquiries (created_at);

-- Create shapefile data table
CREATE TABLE IF NOT EXISTS shapefile_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    file_size INTEGER,
    file_type VARCHAR(50),
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by UUID REFERENCES users(id),
    processed BOOLEAN DEFAULT FALSE,
    processing_status VARCHAR(50) DEFAULT 'pending',
    processing_log TEXT,
    metadata JSONB,
    geometry_type VARCHAR(50),
    coordinate_system VARCHAR(100),
    feature_count INTEGER
);

-- Create indexes for shapefile data
CREATE INDEX IF NOT EXISTS idx_shapefile_data_uploaded_by ON shapefile_data (uploaded_by);
CREATE INDEX IF NOT EXISTS idx_shapefile_data_processed ON shapefile_data (processed);
CREATE INDEX IF NOT EXISTS idx_shapefile_data_processing_status ON shapefile_data (processing_status);

-- Create spatial layers table
CREATE TABLE IF NOT EXISTS spatial_layers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    layer_type VARCHAR(50),
    source_shapefile UUID REFERENCES shapefile_data(id),
    geometry_column VARCHAR(100) DEFAULT 'geometry',
    properties_schema JSONB,
    style_config JSONB,
    is_public BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for spatial layers
CREATE INDEX IF NOT EXISTS idx_spatial_layers_created_by ON spatial_layers (created_by);
CREATE INDEX IF NOT EXISTS idx_spatial_layers_is_public ON spatial_layers (is_public);
CREATE INDEX IF NOT EXISTS idx_spatial_layers_source_shapefile ON spatial_layers (source_shapefile);

-- Create API keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    secret_key VARCHAR(255),
    website_domain VARCHAR(255),
    permissions JSONB DEFAULT '[]'::jsonb,
    rate_limit INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used TIMESTAMPTZ
);

-- Create indexes for API keys
CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON api_keys (api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys (is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_created_by ON api_keys (created_by);

-- Create shapefile imports table (legacy compatibility)
CREATE TABLE IF NOT EXISTS shapefile_imports (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255),
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    processed_date TIMESTAMPTZ,
    status VARCHAR(50),
    records_count INTEGER,
    error_log TEXT
);

-- Enable Row Level Security on all tables
ALTER TABLE parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plot_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE plot_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE shapefile_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE spatial_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for parcels (public read access)
CREATE POLICY "Public can read parcels" ON parcels
    FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can insert parcels" ON parcels
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update parcels" ON parcels
    FOR UPDATE TO authenticated USING (true);

-- Create RLS policies for users
CREATE POLICY "Users can read own data" ON users
    FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Create RLS policies for plot listings (public read for active listings)
CREATE POLICY "Public can read active listings" ON plot_listings
    FOR SELECT TO public USING (status = 'active');

CREATE POLICY "Authenticated users can manage listings" ON plot_listings
    FOR ALL TO authenticated USING (true);

-- Create RLS policies for plot inquiries
CREATE POLICY "Public can create inquiries" ON plot_inquiries
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Authenticated users can read inquiries" ON plot_inquiries
    FOR SELECT TO authenticated USING (true);

-- Create RLS policies for shapefile data
CREATE POLICY "Authenticated users can manage shapefiles" ON shapefile_data
    FOR ALL TO authenticated USING (true);

-- Create RLS policies for spatial layers
CREATE POLICY "Public can read public layers" ON spatial_layers
    FOR SELECT TO public USING (is_public = true);

CREATE POLICY "Authenticated users can manage layers" ON spatial_layers
    FOR ALL TO authenticated USING (true);

-- Create RLS policies for API keys (admin only)
CREATE POLICY "Only admins can manage API keys" ON api_keys
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Insert default user roles
INSERT INTO user_roles (name, description, permissions) VALUES
('admin', 'System Administrator', '["read", "write", "delete", "manage_users", "manage_api_keys"]'::jsonb),
('manager', 'Property Manager', '["read", "write", "manage_listings", "respond_inquiries"]'::jsonb),
('agent', 'Sales Agent', '["read", "create_listings", "respond_inquiries"]'::jsonb),
('customer', 'Customer', '["read", "create_inquiries"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_parcels_updated_at BEFORE UPDATE ON parcels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plot_listings_updated_at BEFORE UPDATE ON plot_listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spatial_layers_updated_at BEFORE UPDATE ON spatial_layers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();