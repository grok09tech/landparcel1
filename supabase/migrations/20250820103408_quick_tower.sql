/*
  # Enhanced Land Parcel System Schema

  1. New Tables
    - `users` - User management with roles and permissions
    - `user_roles` - Role-based access control
    - `user_permissions` - Granular permissions
    - `plot_listings` - Available plots for sale
    - `plot_inquiries` - Customer inquiries and reservations
    - `shapefile_data` - Raw shapefile storage
    - `spatial_layers` - Organized spatial data layers
    - `api_keys` - External system integration keys

  2. Enhanced Tables
    - Updated `parcels` table with additional fields
    - Added indexes for performance

  3. Security
    - Enable RLS on all tables
    - Add comprehensive policies for different user roles
*/

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Management Tables
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    email varchar(255) UNIQUE NOT NULL,
    password_hash varchar(255) NOT NULL,
    first_name varchar(100),
    last_name varchar(100),
    phone varchar(20),
    role varchar(50) DEFAULT 'customer',
    is_active boolean DEFAULT true,
    email_verified boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    last_login timestamptz
);

CREATE TABLE IF NOT EXISTS user_roles (
    id serial PRIMARY KEY,
    name varchar(50) UNIQUE NOT NULL,
    description text,
    permissions jsonb DEFAULT '[]',
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_permissions (
    id serial PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    permission varchar(100) NOT NULL,
    resource varchar(100),
    granted_at timestamptz DEFAULT now(),
    granted_by uuid REFERENCES users(id)
);

-- Enhanced Parcels Table
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS status varchar(50) DEFAULT 'available';
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS price_per_sqm decimal(10,2);
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS total_price decimal(15,2);
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS amenities jsonb DEFAULT '[]';
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]';
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS contact_info jsonb;
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS reserved_until timestamptz;
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS reserved_by uuid REFERENCES users(id);

-- Plot Listings Table
CREATE TABLE IF NOT EXISTS plot_listings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id integer REFERENCES parcels(id) ON DELETE CASCADE,
    title varchar(255) NOT NULL,
    description text,
    price decimal(15,2) NOT NULL,
    price_per_sqm decimal(10,2),
    status varchar(50) DEFAULT 'active',
    featured boolean DEFAULT false,
    amenities jsonb DEFAULT '[]',
    images jsonb DEFAULT '[]',
    contact_person varchar(255),
    contact_phone varchar(20),
    contact_email varchar(255),
    listed_by uuid REFERENCES users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Plot Inquiries Table
CREATE TABLE IF NOT EXISTS plot_inquiries (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id integer REFERENCES parcels(id) ON DELETE CASCADE,
    listing_id uuid REFERENCES plot_listings(id) ON DELETE CASCADE,
    customer_name varchar(255) NOT NULL,
    customer_email varchar(255) NOT NULL,
    customer_phone varchar(20),
    message text,
    inquiry_type varchar(50) DEFAULT 'general',
    status varchar(50) DEFAULT 'pending',
    source_website varchar(255),
    referral_data jsonb,
    created_at timestamptz DEFAULT now(),
    responded_at timestamptz,
    responded_by uuid REFERENCES users(id)
);

-- Shapefile Storage Tables
CREATE TABLE IF NOT EXISTS shapefile_data (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename varchar(255) NOT NULL,
    original_name varchar(255),
    file_size bigint,
    file_type varchar(50),
    upload_date timestamptz DEFAULT now(),
    uploaded_by uuid REFERENCES users(id),
    processed boolean DEFAULT false,
    processing_status varchar(50) DEFAULT 'pending',
    processing_log text,
    metadata jsonb,
    geometry_type varchar(50),
    coordinate_system varchar(100),
    feature_count integer
);

CREATE TABLE IF NOT EXISTS spatial_layers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name varchar(255) NOT NULL,
    description text,
    layer_type varchar(50),
    source_shapefile uuid REFERENCES shapefile_data(id),
    geometry_column varchar(100) DEFAULT 'geometry',
    properties_schema jsonb,
    style_config jsonb,
    is_public boolean DEFAULT false,
    created_by uuid REFERENCES users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- API Integration Tables
CREATE TABLE IF NOT EXISTS api_keys (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_name varchar(255) NOT NULL,
    api_key varchar(255) UNIQUE NOT NULL,
    secret_key varchar(255),
    website_domain varchar(255),
    permissions jsonb DEFAULT '[]',
    rate_limit integer DEFAULT 1000,
    is_active boolean DEFAULT true,
    created_by uuid REFERENCES users(id),
    created_at timestamptz DEFAULT now(),
    last_used timestamptz
);

-- Insert Default Roles
INSERT INTO user_roles (name, description, permissions) VALUES
('admin', 'System Administrator', '["read", "write", "delete", "manage_users", "manage_system"]'),
('manager', 'Property Manager', '["read", "write", "manage_listings", "view_inquiries"]'),
('agent', 'Sales Agent', '["read", "write_own", "manage_own_listings"]'),
('customer', 'Customer/Buyer', '["read", "create_inquiry"]'),
('api_user', 'External API User', '["read", "create_inquiry"]')
ON CONFLICT (name) DO NOTHING;

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_parcels_status ON parcels(status);
CREATE INDEX IF NOT EXISTS idx_parcels_price ON parcels(total_price);
CREATE INDEX IF NOT EXISTS idx_parcels_region_status ON parcels(region, status);
CREATE INDEX IF NOT EXISTS idx_plot_listings_status ON plot_listings(status);
CREATE INDEX IF NOT EXISTS idx_plot_listings_featured ON plot_listings(featured);
CREATE INDEX IF NOT EXISTS idx_plot_inquiries_status ON plot_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plot_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE plot_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE shapefile_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE spatial_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for Plot Listings
CREATE POLICY "Anyone can read active listings" ON plot_listings
    FOR SELECT USING (status = 'active');

CREATE POLICY "Managers can manage all listings" ON plot_listings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Agents can manage own listings" ON plot_listings
    FOR ALL USING (
        listed_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- RLS Policies for Plot Inquiries
CREATE POLICY "Users can read own inquiries" ON plot_inquiries
    FOR SELECT USING (
        customer_email = (SELECT email FROM users WHERE id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'manager', 'agent')
        )
    );

CREATE POLICY "Anyone can create inquiries" ON plot_inquiries
    FOR INSERT WITH CHECK (true);

-- RLS Policies for Shapefile Data
CREATE POLICY "Authenticated users can read shapefiles" ON shapefile_data
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Managers can manage shapefiles" ON shapefile_data
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Sample Data
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@landparcel.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/k/K', 'System', 'Administrator', 'admin'),
('manager@landparcel.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/k/K', 'Property', 'Manager', 'manager'),
('agent@landparcel.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/k/K', 'Sales', 'Agent', 'agent')
ON CONFLICT (email) DO NOTHING;

-- Update existing parcels with new fields
UPDATE parcels SET 
    status = 'available',
    price_per_sqm = CASE 
        WHEN region = 'Dar es Salaam' THEN 150.00
        WHEN region = 'Arusha' THEN 120.00
        WHEN region = 'Bagamoyo' THEN 100.00
        ELSE 100.00
    END,
    total_price = CASE 
        WHEN region = 'Dar es Salaam' THEN area_sqm * 150.00
        WHEN region = 'Arusha' THEN area_sqm * 120.00
        WHEN region = 'Bagamoyo' THEN area_sqm * 100.00
        ELSE area_sqm * 100.00
    END,
    description = 'Prime land parcel in ' || region || ' region, perfect for residential or commercial development.',
    amenities = '["Road Access", "Electricity", "Water Supply"]'::jsonb,
    contact_info = '{"phone": "+255 123 456 789", "email": "sales@landparcel.com"}'::jsonb
WHERE total_price IS NULL;

-- Create plot listings for existing parcels
INSERT INTO plot_listings (parcel_id, title, description, price, price_per_sqm, status, featured, amenities, contact_person, contact_phone, contact_email)
SELECT 
    id,
    'Premium Land Plot - ' || parcel_id,
    'Excellent ' || land_use || ' plot in ' || region || ', ' || district || '. ' || 
    CASE 
        WHEN area_sqm > 3000 THEN 'Large plot perfect for development projects.'
        WHEN area_sqm > 2000 THEN 'Medium-sized plot ideal for residential construction.'
        ELSE 'Compact plot suitable for single-family home.'
    END,
    total_price,
    price_per_sqm,
    'active',
    CASE WHEN area_sqm > 3000 THEN true ELSE false END,
    amenities,
    'Sales Team',
    '+255 123 456 789',
    'sales@landparcel.com'
FROM parcels 
WHERE NOT EXISTS (SELECT 1 FROM plot_listings WHERE parcel_id = parcels.id);