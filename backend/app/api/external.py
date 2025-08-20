from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.core.database import get_db
from app.models.listing import ApiKey
from app.schemas.listing import PlotListingResponse, PlotInquiryCreate, PlotInquiryResponse
from app.services.listing_service import ListingService
from app.services.external_service import ExternalApiService

router = APIRouter(prefix="/external", tags=["external-api"])

def verify_api_key(
    x_api_key: str = Header(...),
    db: Session = Depends(get_db)
) -> ApiKey:
    """Verify API key for external access"""
    api_key = db.query(ApiKey).filter(
        ApiKey.api_key == x_api_key,
        ApiKey.is_active == True
    ).first()
    
    if not api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    # Update last used timestamp
    from datetime import datetime
    api_key.last_used = datetime.utcnow()
    db.commit()
    
    return api_key

@router.get("/plots", response_model=List[PlotListingResponse])
async def get_available_plots(
    region: Optional[str] = Query(None, description="Filter by region"),
    min_price: Optional[float] = Query(None, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, description="Maximum price filter"),
    min_area: Optional[float] = Query(None, description="Minimum area in sqm"),
    max_area: Optional[float] = Query(None, description="Maximum area in sqm"),
    featured_only: bool = Query(False, description="Show only featured plots"),
    limit: int = Query(20, le=50, description="Maximum number of results"),
    offset: int = Query(0, description="Pagination offset"),
    api_key: ApiKey = Depends(verify_api_key),
    db: Session = Depends(get_db)
):
    """
    Get available plots for external websites
    
    This endpoint allows external real estate websites to fetch available land plots
    with various filtering options. Requires valid API key.
    """
    service = ListingService(db)
    
    # Check API key permissions
    if "read" not in api_key.permissions:
        raise HTTPException(status_code=403, detail="API key does not have read permissions")
    
    return service.get_listings(
        region=region,
        status="active",
        featured=featured_only if featured_only else None,
        min_price=min_price,
        max_price=max_price,
        min_area=min_area,
        max_area=max_area,
        limit=limit,
        offset=offset
    )

@router.get("/plots/{listing_id}", response_model=PlotListingResponse)
async def get_plot_details(
    listing_id: uuid.UUID,
    api_key: ApiKey = Depends(verify_api_key),
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific plot
    
    Returns comprehensive plot information including parcel data,
    pricing, amenities, and contact information.
    """
    if "read" not in api_key.permissions:
        raise HTTPException(status_code=403, detail="API key does not have read permissions")
    
    service = ListingService(db)
    listing = service.get_listing_by_id(listing_id)
    
    if not listing:
        raise HTTPException(status_code=404, detail="Plot not found")
    
    if listing.status != "active":
        raise HTTPException(status_code=404, detail="Plot not available")
    
    return listing

@router.post("/inquiries", response_model=PlotInquiryResponse)
async def submit_plot_inquiry(
    inquiry_data: PlotInquiryCreate,
    source_website: str = Header(..., alias="X-Source-Website"),
    api_key: ApiKey = Depends(verify_api_key),
    db: Session = Depends(get_db)
):
    """
    Submit customer inquiry for a plot
    
    Allows external websites to submit customer inquiries directly
    to the land parcel system. The inquiry will be tracked and
    managed by the internal team.
    """
    if "create_inquiry" not in api_key.permissions:
        raise HTTPException(status_code=403, detail="API key does not have inquiry creation permissions")
    
    # Add source website and referral data
    inquiry_data.source_website = source_website
    inquiry_data.referral_data = {
        "api_key_name": api_key.key_name,
        "website_domain": api_key.website_domain
    }
    
    service = ListingService(db)
    return service.create_inquiry(inquiry_data)

@router.get("/regions")
async def get_available_regions(
    api_key: ApiKey = Depends(verify_api_key),
    db: Session = Depends(get_db)
):
    """
    Get list of available regions with plot counts
    
    Returns regions where plots are available for sale,
    along with basic statistics.
    """
    if "read" not in api_key.permissions:
        raise HTTPException(status_code=403, detail="API key does not have read permissions")
    
    service = ExternalApiService(db)
    return service.get_regions_summary()

@router.get("/stats")
async def get_plot_statistics(
    region: Optional[str] = Query(None),
    api_key: ApiKey = Depends(verify_api_key),
    db: Session = Depends(get_db)
):
    """
    Get plot statistics for integration
    
    Returns summary statistics about available plots,
    useful for displaying on external websites.
    """
    if "read" not in api_key.permissions:
        raise HTTPException(status_code=403, detail="API key does not have read permissions")
    
    service = ExternalApiService(db)
    return service.get_plot_statistics(region)

@router.post("/webhook/plot-viewed")
async def track_plot_view(
    listing_id: uuid.UUID,
    viewer_data: dict,
    api_key: ApiKey = Depends(verify_api_key),
    db: Session = Depends(get_db)
):
    """
    Track plot views from external websites
    
    Allows external websites to report when users view plot details,
    helping with analytics and lead tracking.
    """
    service = ExternalApiService(db)
    return service.track_plot_view(listing_id, viewer_data, api_key.key_name)