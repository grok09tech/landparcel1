from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.core.database import get_db
from app.models.user import User
from app.models.listing import PlotListing, PlotInquiry
from app.schemas.listing import (
    PlotListingCreate, PlotListingUpdate, PlotListingResponse,
    PlotInquiryCreate, PlotInquiryResponse
)
from app.services.listing_service import ListingService
from app.api.auth import get_current_active_user, get_current_user

router = APIRouter(prefix="/listings", tags=["listings"])

@router.get("/", response_model=List[PlotListingResponse])
async def get_listings(
    region: Optional[str] = Query(None),
    status: str = Query("active"),
    featured: Optional[bool] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_area: Optional[float] = Query(None),
    max_area: Optional[float] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
    db: Session = Depends(get_db)
):
    """Get plot listings with filters"""
    service = ListingService(db)
    return service.get_listings(
        region=region,
        status=status,
        featured=featured,
        min_price=min_price,
        max_price=max_price,
        min_area=min_area,
        max_area=max_area,
        limit=limit,
        offset=offset
    )

@router.get("/featured", response_model=List[PlotListingResponse])
async def get_featured_listings(
    region: Optional[str] = Query(None),
    limit: int = Query(10, le=20),
    db: Session = Depends(get_db)
):
    """Get featured plot listings"""
    service = ListingService(db)
    return service.get_listings(
        region=region,
        status="active",
        featured=True,
        limit=limit
    )

@router.get("/{listing_id}", response_model=PlotListingResponse)
async def get_listing(listing_id: uuid.UUID, db: Session = Depends(get_db)):
    """Get specific listing details"""
    service = ListingService(db)
    listing = service.get_listing_by_id(listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing

@router.post("/", response_model=PlotListingResponse)
async def create_listing(
    listing_data: PlotListingCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create new plot listing"""
    if current_user.role not in ['admin', 'manager', 'agent']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create listings"
        )
    
    service = ListingService(db)
    return service.create_listing(listing_data, current_user.id)

@router.put("/{listing_id}", response_model=PlotListingResponse)
async def update_listing(
    listing_id: uuid.UUID,
    listing_update: PlotListingUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update plot listing"""
    service = ListingService(db)
    listing = service.get_listing_by_id(listing_id)
    
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Check permissions
    if (current_user.role not in ['admin', 'manager'] and 
        listing.listed_by != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this listing"
        )
    
    return service.update_listing(listing_id, listing_update)

@router.delete("/{listing_id}")
async def delete_listing(
    listing_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete plot listing"""
    service = ListingService(db)
    listing = service.get_listing_by_id(listing_id)
    
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Check permissions
    if (current_user.role not in ['admin', 'manager'] and 
        listing.listed_by != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this listing"
        )
    
    service.delete_listing(listing_id)
    return {"message": "Listing deleted successfully"}

# Inquiry endpoints
@router.post("/inquiries", response_model=PlotInquiryResponse)
async def create_inquiry(
    inquiry_data: PlotInquiryCreate,
    db: Session = Depends(get_db)
):
    """Create plot inquiry (public endpoint)"""
    service = ListingService(db)
    return service.create_inquiry(inquiry_data)

@router.get("/inquiries", response_model=List[PlotInquiryResponse])
async def get_inquiries(
    status: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get plot inquiries (for staff)"""
    if current_user.role not in ['admin', 'manager', 'agent']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view inquiries"
        )
    
    service = ListingService(db)
    return service.get_inquiries(status=status, limit=limit, offset=offset)

@router.put("/inquiries/{inquiry_id}/respond")
async def respond_to_inquiry(
    inquiry_id: uuid.UUID,
    response_message: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Respond to plot inquiry"""
    if current_user.role not in ['admin', 'manager', 'agent']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to respond to inquiries"
        )
    
    service = ListingService(db)
    return service.respond_to_inquiry(inquiry_id, current_user.id, response_message)