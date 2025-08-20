"""
Seed script to populate the database with sample Tanzania parcel data
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.parcel import Base, Parcel
from geoalchemy2.shape import from_shape
from shapely.geometry import Polygon

# Create tables
Base.metadata.create_all(bind=engine)

def create_sample_parcels():
    db = SessionLocal()
    
    try:
        # Sample parcels for Dar es Salaam
        dar_parcels = [
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
            }
        ]
        
        # Sample parcels for Arusha
        arusha_parcels = [
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
            }
        ]
        
        # Sample parcels for Bagamoyo
        bagamoyo_parcels = [
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
        
        all_parcels = dar_parcels + arusha_parcels + bagamoyo_parcels
        
        for parcel_data in all_parcels:
            # Check if parcel already exists
            existing = db.query(Parcel).filter(Parcel.parcel_id == parcel_data["parcel_id"]).first()
            if existing:
                print(f"Parcel {parcel_data['parcel_id']} already exists, skipping...")
                continue
            
            # Create parcel
            geometry = parcel_data.pop("geometry")
            parcel = Parcel(
                **parcel_data,
                geometry=from_shape(geometry, srid=4326)
            )
            
            db.add(parcel)
            print(f"Added parcel {parcel.parcel_id}")
        
        db.commit()
        print("Sample data seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_parcels()