from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
import uuid

class PlotListingBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: Decimal
    price_per_sqm: Optional[Decimal] = None
    status: str = 'active'
    featured: bool = False
    amenities: List[str] = []
    images: List[str] = []
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None

class PlotListingCreate(PlotListingBase):
    parcel_id: int

class PlotListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    price_per_sqm: Optional[Decimal] = None
    status: Optional[str] = None
    featured: Optional[bool] = None
    amenities: Optional[List[str]] = None
    images: Optional[List[str]] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None

class PlotListingResponse(PlotListingBase):
    id: uuid.UUID
    parcel_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    parcel: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

class PlotInquiryBase(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_phone: Optional[str] = None
    message: Optional[str] = None
    inquiry_type: str = 'general'
    source_website: Optional[str] = None
    referral_data: Optional[Dict[str, Any]] = None

class PlotInquiryCreate(PlotInquiryBase):
    parcel_id: int
    listing_id: Optional[uuid.UUID] = None

class PlotInquiryResponse(PlotInquiryBase):
    id: uuid.UUID
    parcel_id: int
    listing_id: Optional[uuid.UUID] = None
    status: str
    created_at: datetime
    responded_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ShapefileUpload(BaseModel):
    filename: str
    original_name: str
    file_size: int
    file_type: str
    metadata: Optional[Dict[str, Any]] = None

class ShapefileResponse(BaseModel):
    id: uuid.UUID
    filename: str
    original_name: str
    file_size: int
    upload_date: datetime
    processed: bool
    processing_status: str
    geometry_type: Optional[str] = None
    feature_count: Optional[int] = None
    
    class Config:
        from_attributes = True

class SpatialLayerCreate(BaseModel):
    name: str
    description: Optional[str] = None
    layer_type: str
    source_shapefile: uuid.UUID
    properties_schema: Optional[Dict[str, Any]] = None
    style_config: Optional[Dict[str, Any]] = None
    is_public: bool = False

class SpatialLayerResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str] = None
    layer_type: str
    is_public: bool
    created_at: datetime
    
    class Config:
        from_attributes = True