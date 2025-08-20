from sqlalchemy import Column, Integer, String, Numeric, DateTime, Text, Index
from sqlalchemy.sql import func
from geoalchemy2 import Geometry
from app.core.database import Base

class Parcel(Base):
    __tablename__ = "parcels"
    
    id = Column(Integer, primary_key=True, index=True)
    parcel_id = Column(String(50), unique=True, nullable=False, index=True)
    geometry = Column(Geometry('POLYGON', srid=4326), nullable=False)
    region = Column(String(100), nullable=False, index=True)
    district = Column(String(100))
    ward = Column(String(100))
    area_sqm = Column(Numeric(15, 2))
    perimeter_m = Column(Numeric(10, 2))
    owner_name = Column(String(255), index=True)
    owner_id = Column(String(50))
    address = Column(Text)
    land_use = Column(String(100))
    zoning = Column(String(50))
    valuation = Column(Numeric(15, 2))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Create spatial index
Index('idx_parcels_geometry', Parcel.geometry, postgresql_using='gist')

class ShapefileImport(Base):
    __tablename__ = "shapefile_imports"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255))
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    processed_date = Column(DateTime(timezone=True))
    status = Column(String(50))
    records_count = Column(Integer)
    error_log = Column(Text)