"""
Enhanced seed script for the Tanzania Land Parcel System
Creates sample data including users, parcels, listings, and API keys
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import SessionLocal, engine
from app.models.parcel import Base
from geoalchemy2.shape import from_shape
from shapely.geometry import Polygon
import uuid
from passlib.context import CryptContext
from datetime import datetime

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_enhanced_sample_data():
    db = SessionLocal()
    
    try:
        print("Creating enhanced sample data...")
        
        # 1. Create sample users
        print("Creating sample users...")
        
        # Admin user
        admin_id = str(uuid.uuid4())
        db.execute(text("""
            INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, email_verified)
            VALUES (:id, :email, :password_hash, :first_name, :last_name, :role, :is_active, :email_verified)
            ON CONFLICT (email) DO NOTHING
        """), {
            "id": admin_id,
            "email": "admin@landparcel.com",
            "password_hash": get_password_hash("admin123"),
            "first_name": "System",
            "last_name": "Administrator",
            "role": "admin",
            "is_active": True,
            "email_verified": True
        })
        
        # Manager user
        manager_id = str(uuid.uuid4())
        db.execute(text("""
            INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, email_verified)
            VALUES (:id, :email, :password_hash, :first_name, :last_name, :role, :is_active, :email_verified)
            ON CONFLICT (email) DO NOTHING
        """), {
            "id": manager_id,
            "email": "manager@landparcel.com",
            "password_hash": get_password_hash("manager123"),
            "first_name": "John",
            "last_name": "Manager",
            "role": "manager",
            "is_active": True,
            "email_verified": True
        })
        
        # Agent user
        agent_id = str(uuid.uuid4())
        db.execute(text("""
            INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, email_verified)
            VALUES (:id, :email, :password_hash, :first_name, :last_name, :role, :is_active, :email_verified)
            ON CONFLICT (email) DO NOTHING
        """), {
            "id": agent_id,
            "email": "agent@landparcel.com",
            "password_hash": get_password_hash("agent123"),
            "first_name": "Sarah",
            "last_name": "Agent",
            "role": "agent",
            "is_active": True,
            "email_verified": True
        })
        
        # 2. Create sample parcels
        print("Creating sample parcels...")
        
        parcels_data = [
            # Dar es Salaam parcels
            {
                "parcel_id": "DSM001",
                "geometry": Polygon([
                    [39.2050, -6.7820], [39.2070, -6.7820], 
                    [39.2070, -6.7810], [39.2050, -6.7810], [39.2050, -6.7820]
                ]),
                "region": "Dar es Salaam",
                "district": "Kinondoni",
                "ward": "Msasani",
                "area_sqm": 2450,
                "perimeter_m": 198,
                "owner_name": "John Mwalimu",
                "owner_id": "TZ1234567890",
                "address": "Plot 123, Msasani Ward, Kinondoni",
                "land_use": "Residential",
                "zoning": "R1",
                "valuation": 125000
            },
            {
                "parcel_id": "DSM002",
                "geometry": Polygon([
                    [39.2070, -6.7820], [39.2090, -6.7820], 
                    [39.2090, -6.7805], [39.2070, -6.7805], [39.2070, -6.7820]
                ]),
                "region": "Dar es Salaam",
                "district": "Kinondoni",
                "ward": "Msasani",
                "area_sqm": 1875,
                "perimeter_m": 174,
                "owner_name": "Grace Kimaro",
                "owner_id": "TZ0987654321",
                "address": "Plot 124, Msasani Ward, Kinondoni",
                "land_use": "Commercial",
                "zoning": "C1",
                "valuation": 180000
            },
            {
                "parcel_id": "DSM003",
                "geometry": Polygon([
                    [39.2100, -6.7850], [39.2120, -6.7850], 
                    [39.2120, -6.7835], [39.2100, -6.7835], [39.2100, -6.7850]
                ]),
                "region": "Dar es Salaam",
                "district": "Ilala",
                "ward": "Kariakoo",
                "area_sqm": 1950,
                "perimeter_m": 176,
                "owner_name": "Mohamed Hassan",
                "owner_id": "TZ1122334455",
                "address": "Plot 125, Kariakoo Ward, Ilala",
                "land_use": "Mixed Use",
                "zoning": "MU1",
                "valuation": 165000
            },
            # Arusha parcels
            {
                "parcel_id": "ARU001",
                "geometry": Polygon([
                    [36.6820, -3.3670], [36.6840, -3.3670], 
                    [36.6840, -3.3655], [36.6820, -3.3655], [36.6820, -3.3670]
                ]),
                "region": "Arusha",
                "district": "Arusha City",
                "ward": "Kaloleni",
                "area_sqm": 3200,
                "perimeter_m": 226,
                "owner_name": "Peter Mollel",
                "owner_id": "TZ2233445566",
                "address": "Plot 201, Kaloleni Ward, Arusha City",
                "land_use": "Residential",
                "zoning": "R1",
                "valuation": 95000
            },
            {
                "parcel_id": "ARU002",
                "geometry": Polygon([
                    [36.6840, -3.3670], [36.6860, -3.3670], 
                    [36.6860, -3.3650], [36.6840, -3.3650], [36.6840, -3.3670]
                ]),
                "region": "Arusha",
                "district": "Arusha City",
                "ward": "Kaloleni",
                "area_sqm": 2800,
                "perimeter_m": 212,
                "owner_name": "Sarah Mushi",
                "owner_id": "TZ3344556677",
                "address": "Plot 202, Kaloleni Ward, Arusha City",
                "land_use": "Commercial",
                "zoning": "C1",
                "valuation": 120000
            },
            # Bagamoyo parcels
            {
                "parcel_id": "BAG001",
                "geometry": Polygon([
                    [38.9020, -6.4350], [38.9040, -6.4350], 
                    [38.9040, -6.4330], [38.9020, -6.4330], [38.9020, -6.4350]
                ]),
                "region": "Bagamoyo",
                "district": "Bagamoyo",
                "ward": "Bagamoyo",
                "area_sqm": 2600,
                "perimeter_m": 204,
                "owner_name": "Hassan Mwalimu",
                "owner_id": "TZ6677889900",
                "address": "Plot 301, Bagamoyo Ward",
                "land_use": "Residential",
                "zoning": "R1",
                "valuation": 85000
            },
            {
                "parcel_id": "BAG002",
                "geometry": Polygon([
                    [38.9040, -6.4350], [38.9065, -6.4350], 
                    [38.9065, -6.4325], [38.9040, -6.4325], [38.9040, -6.4350]
                ]),
                "region": "Bagamoyo",
                "district": "Bagamoyo",
                "ward": "Msata",
                "area_sqm": 3100,
                "perimeter_m": 222,
                "owner_name": "Fatuma Juma",
                "owner_id": "TZ7788990011",
                "address": "Plot 302, Msata Ward, Bagamoyo",
                "land_use": "Agricultural",
                "zoning": "A1",
                "valuation": 65000
            }
        ]
        
        parcel_ids = []
        for parcel_data in parcels_data:
            # Check if parcel already exists
            existing = db.execute(text("SELECT id FROM parcels WHERE parcel_id = :parcel_id"), 
                                {"parcel_id": parcel_data["parcel_id"]}).first()
            if existing:
                print(f"Parcel {parcel_data['parcel_id']} already exists, skipping...")
                parcel_ids.append(existing[0])
                continue
            
            # Insert parcel
            geometry_wkt = parcel_data["geometry"].wkt
            result = db.execute(text("""
                INSERT INTO parcels (parcel_id, geometry, region, district, ward, area_sqm, perimeter_m, 
                                   owner_name, owner_id, address, land_use, zoning, valuation)
                VALUES (:parcel_id, ST_GeomFromText(:geometry, 4326), :region, :district, :ward, 
                        :area_sqm, :perimeter_m, :owner_name, :owner_id, :address, :land_use, :zoning, :valuation)
                RETURNING id
            """), {
                "parcel_id": parcel_data["parcel_id"],
                "geometry": geometry_wkt,
                "region": parcel_data["region"],
                "district": parcel_data["district"],
                "ward": parcel_data["ward"],
                "area_sqm": parcel_data["area_sqm"],
                "perimeter_m": parcel_data["perimeter_m"],
                "owner_name": parcel_data["owner_name"],
                "owner_id": parcel_data["owner_id"],
                "address": parcel_data["address"],
                "land_use": parcel_data["land_use"],
                "zoning": parcel_data["zoning"],
                "valuation": parcel_data["valuation"]
            })
            parcel_id = result.first()[0]
            parcel_ids.append(parcel_id)
            print(f"Added parcel {parcel_data['parcel_id']}")
        
        # 3. Create sample plot listings
        print("Creating sample plot listings...")
        
        listings_data = [
            {
                "parcel_id": parcel_ids[0],  # DSM001
                "title": "Prime Residential Plot in Msasani",
                "description": "Beautiful residential plot in the heart of Msasani, perfect for building your dream home. Close to schools, hospitals, and shopping centers.",
                "price": 150000,
                "featured": True,
                "amenities": ["Water", "Electricity", "Road Access", "Security"],
                "contact_person": "John Manager",
                "contact_phone": "+255 123 456 789",
                "contact_email": "manager@landparcel.com",
                "listed_by": manager_id
            },
            {
                "parcel_id": parcel_ids[1],  # DSM002
                "title": "Commercial Plot - Kinondoni District",
                "description": "Excellent commercial plot suitable for office buildings, retail spaces, or mixed-use development. High visibility location.",
                "price": 220000,
                "featured": True,
                "amenities": ["Water", "Electricity", "Road Access", "Public Transport"],
                "contact_person": "Sarah Agent",
                "contact_phone": "+255 987 654 321",
                "contact_email": "agent@landparcel.com",
                "listed_by": agent_id
            },
            {
                "parcel_id": parcel_ids[3],  # ARU001
                "title": "Arusha Residential Plot with Mountain Views",
                "description": "Spacious residential plot in Arusha City with stunning views of Mount Meru. Ideal for luxury home construction.",
                "price": 110000,
                "featured": False,
                "amenities": ["Water", "Electricity", "Mountain Views", "Cool Climate"],
                "contact_person": "John Manager",
                "contact_phone": "+255 123 456 789",
                "contact_email": "manager@landparcel.com",
                "listed_by": manager_id
            },
            {
                "parcel_id": parcel_ids[5],  # BAG001
                "title": "Coastal Plot in Historic Bagamoyo",
                "description": "Unique opportunity to own land in the historic town of Bagamoyo. Perfect for tourism-related development.",
                "price": 95000,
                "featured": False,
                "amenities": ["Water", "Historical Significance", "Tourism Potential", "Beach Access"],
                "contact_person": "Sarah Agent",
                "contact_phone": "+255 987 654 321",
                "contact_email": "agent@landparcel.com",
                "listed_by": agent_id
            }
        ]
        
        for listing_data in listings_data:
            # Calculate price per sqm
            parcel_area = db.execute(text("SELECT area_sqm FROM parcels WHERE id = :id"), 
                                   {"id": listing_data["parcel_id"]}).first()
            price_per_sqm = listing_data["price"] / float(parcel_area[0]) if parcel_area and parcel_area[0] else None
            
            db.execute(text("""
                INSERT INTO plot_listings (parcel_id, title, description, price, price_per_sqm, featured, 
                                         amenities, contact_person, contact_phone, contact_email, listed_by)
                VALUES (:parcel_id, :title, :description, :price, :price_per_sqm, :featured, 
                        :amenities, :contact_person, :contact_phone, :contact_email, :listed_by)
            """), {
                "parcel_id": listing_data["parcel_id"],
                "title": listing_data["title"],
                "description": listing_data["description"],
                "price": listing_data["price"],
                "price_per_sqm": price_per_sqm,
                "featured": listing_data["featured"],
                "amenities": str(listing_data["amenities"]).replace("'", '"'),
                "contact_person": listing_data["contact_person"],
                "contact_phone": listing_data["contact_phone"],
                "contact_email": listing_data["contact_email"],
                "listed_by": listing_data["listed_by"]
            })
            print(f"Added listing: {listing_data['title']}")
        
        # 4. Create sample API keys
        print("Creating sample API keys...")
        
        api_keys_data = [
            {
                "key_name": "Real Estate Website",
                "api_key": "re_live_" + str(uuid.uuid4()).replace("-", ""),
                "website_domain": "realestate-tz.com",
                "permissions": ["read", "create_inquiry"],
                "created_by": admin_id
            },
            {
                "key_name": "Property Portal",
                "api_key": "pp_live_" + str(uuid.uuid4()).replace("-", ""),
                "website_domain": "propertyportal.co.tz",
                "permissions": ["read", "create_inquiry", "analytics"],
                "created_by": admin_id
            }
        ]
        
        for api_key_data in api_keys_data:
            db.execute(text("""
                INSERT INTO api_keys (key_name, api_key, website_domain, permissions, created_by)
                VALUES (:key_name, :api_key, :website_domain, :permissions, :created_by)
            """), {
                "key_name": api_key_data["key_name"],
                "api_key": api_key_data["api_key"],
                "website_domain": api_key_data["website_domain"],
                "permissions": str(api_key_data["permissions"]).replace("'", '"'),
                "created_by": api_key_data["created_by"]
            })
            print(f"Added API key: {api_key_data['key_name']} - {api_key_data['api_key']}")
        
        # 5. Create sample inquiries
        print("Creating sample inquiries...")
        
        inquiries_data = [
            {
                "parcel_id": parcel_ids[0],
                "customer_name": "Michael Johnson",
                "customer_email": "michael.johnson@email.com",
                "customer_phone": "+255 700 123 456",
                "message": "I'm interested in this residential plot. Can we schedule a viewing?",
                "inquiry_type": "viewing",
                "source_website": "realestate-tz.com"
            },
            {
                "parcel_id": parcel_ids[1],
                "customer_name": "Anna Smith",
                "customer_email": "anna.smith@business.com",
                "customer_phone": "+255 700 987 654",
                "message": "Looking for commercial space for my business. What are the zoning restrictions?",
                "inquiry_type": "purchase",
                "source_website": "propertyportal.co.tz"
            }
        ]
        
        for inquiry_data in inquiries_data:
            db.execute(text("""
                INSERT INTO plot_inquiries (parcel_id, customer_name, customer_email, customer_phone, 
                                          message, inquiry_type, source_website)
                VALUES (:parcel_id, :customer_name, :customer_email, :customer_phone, 
                        :message, :inquiry_type, :source_website)
            """), inquiry_data)
            print(f"Added inquiry from: {inquiry_data['customer_name']}")
        
        db.commit()
        print("\n✅ Enhanced sample data created successfully!")
        print("\n📊 Summary:")
        print("- 3 Users created (admin, manager, agent)")
        print("- 7 Parcels created across 3 regions")
        print("- 4 Plot listings created")
        print("- 2 API keys created for external integration")
        print("- 2 Sample inquiries created")
        print("\n🔐 Login Credentials:")
        print("Admin: admin@landparcel.com / admin123")
        print("Manager: manager@landparcel.com / manager123")
        print("Agent: agent@landparcel.com / agent123")
        
    except Exception as e:
        print(f"Error creating enhanced sample data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_enhanced_sample_data()