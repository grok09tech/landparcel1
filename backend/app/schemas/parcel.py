from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal

class ParcelBase(BaseModel):
    parcel_id: str
    region: str
    district: Optional[str] = None
    ward: Optional[str] = None
    area_sqm: Optional[Decimal] = None
    perimeter_m: Optional[Decimal] = None
    owner_name: Optional[str] = None
    owner_id: Optional[str] = None
    address: Optional[str] = None
    land_use: Optional[str] = None
    zoning: Optional[str] = None
    valuation: Optional[Decimal] = None

class ParcelCreate(ParcelBase):
    geometry: Dict[str, Any]  # GeoJSON geometry

class ParcelUpdate(BaseModel):
    region: Optional[str] = None
    district: Optional[str] = None
    ward: Optional[str] = None
    owner_name: Optional[str] = None
    owner_id: Optional[str] = None
    address: Optional[str] = None
    land_use: Optional[str] = None
    zoning: Optional[str] = None
    valuation: Optional[Decimal] = None

class ParcelResponse(ParcelBase):
    id: int
    geometry: Dict[str, Any]
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ParcelFeature(BaseModel):
    type: str = "Feature"
    id: str
    geometry: Dict[str, Any]
    properties: Dict[str, Any]

class ParcelCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[ParcelFeature]
    total: int

class SearchParams(BaseModel):
    field: str
    value: str
    region: Optional[str] = None