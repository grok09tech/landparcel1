from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class PlotListing(Base):
    __tablename__ = "plot_listings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    parcel_id = Column(Integer, ForeignKey('parcels.id', ondelete='CASCADE'), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    price = Column(Numeric(15, 2), nullable=False)
    price_per_sqm = Column(Numeric(10, 2))
    status = Column(String(50), default='active', index=True)
    featured = Column(Boolean, default=False, index=True)
    amenities = Column(JSON, default=[])
    images = Column(JSON, default=[])
    contact_person = Column(String(255))
    contact_phone = Column(String(20))
    contact_email = Column(String(255))
    listed_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    parcel = relationship("Parcel", backref="listings")
    listed_by_user = relationship("User", back_populates="listings")
    inquiries = relationship("PlotInquiry", back_populates="listing")

class PlotInquiry(Base):
    __tablename__ = "plot_inquiries"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    parcel_id = Column(Integer, ForeignKey('parcels.id', ondelete='CASCADE'), nullable=False)
    listing_id = Column(UUID(as_uuid=True), ForeignKey('plot_listings.id', ondelete='CASCADE'))
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    customer_phone = Column(String(20))
    message = Column(Text)
    inquiry_type = Column(String(50), default='general')
    status = Column(String(50), default='pending', index=True)
    source_website = Column(String(255))
    referral_data = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    responded_at = Column(DateTime(timezone=True))
    responded_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    
    # Relationships
    parcel = relationship("Parcel", backref="inquiries")
    listing = relationship("PlotListing", back_populates="inquiries")
    responder = relationship("User", back_populates="inquiries_responded")

class ShapefileData(Base):
    __tablename__ = "shapefile_data"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String(255), nullable=False)
    original_name = Column(String(255))
    file_size = Column(Integer)
    file_type = Column(String(50))
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    processed = Column(Boolean, default=False)
    processing_status = Column(String(50), default='pending')
    processing_log = Column(Text)
    metadata = Column(JSON)
    geometry_type = Column(String(50))
    coordinate_system = Column(String(100))
    feature_count = Column(Integer)
    
    # Relationships
    spatial_layers = relationship("SpatialLayer", back_populates="source_shapefile_data")

class SpatialLayer(Base):
    __tablename__ = "spatial_layers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    layer_type = Column(String(50))
    source_shapefile = Column(UUID(as_uuid=True), ForeignKey('shapefile_data.id'))
    geometry_column = Column(String(100), default='geometry')
    properties_schema = Column(JSON)
    style_config = Column(JSON)
    is_public = Column(Boolean, default=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    source_shapefile_data = relationship("ShapefileData", back_populates="spatial_layers")