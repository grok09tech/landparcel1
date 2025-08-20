from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.services.parcel_service import ParcelService
from app.schemas.parcel import ParcelCollection, ParcelCreate, SearchParams

router = APIRouter(prefix="/parcels", tags=["parcels"])

@router.get("/", response_model=ParcelCollection)
async def get_parcels(
    regions: Optional[str] = Query(None, description="Comma-separated list of regions"),
    bbox: Optional[str] = Query(None, description="Bounding box: minX,minY,maxX,maxY"),
    limit: int = Query(1000, le=5000),
    db: Session = Depends(get_db)
):
    """Get parcels by regions or bounding box"""
    service = ParcelService(db)
    
    region_list = []
    if regions:
        region_list = [r.strip() for r in regions.split(',')]
    
    if bbox:
        try:
            coords = [float(x) for x in bbox.split(',')]
            if len(coords) != 4:
                raise ValueError("Invalid bbox format")
            return service.get_parcels_in_bbox(coords, region_list, limit)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid bbox format")
    
    return service.get_parcels_by_region(region_list, limit)

@router.get("/{parcel_id}")
async def get_parcel(parcel_id: str, db: Session = Depends(get_db)):
    """Get specific parcel details"""
    service = ParcelService(db)
    parcel = service.get_parcel_by_id(parcel_id)
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")
    return parcel

@router.get("/search/")
async def search_parcels(
    field: str = Query(..., description="Search field"),
    value: str = Query(..., description="Search value"),
    regions: Optional[str] = Query(None, description="Comma-separated list of regions"),
    db: Session = Depends(get_db)
):
    """Search parcels by field"""
    service = ParcelService(db)
    
    region_list = []
    if regions:
        region_list = [r.strip() for r in regions.split(',')]
    
    try:
        return service.search_parcels(field, value, region_list)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/", response_model=dict)
async def create_parcel(
    parcel: ParcelCreate,
    db: Session = Depends(get_db)
):
    """Create new parcel"""
    service = ParcelService(db)
    try:
        db_parcel = service.create_parcel(parcel)
        return {"message": "Parcel created successfully", "parcel_id": db_parcel.parcel_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))