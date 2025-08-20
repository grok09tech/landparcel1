from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from typing import Optional, List
import uuid
from datetime import datetime

from app.models.listing import PlotListing, PlotInquiry
from app.models.parcel import Parcel
from app.schemas.listing import PlotListingCreate, PlotListingUpdate, PlotInquiryCreate

class ListingService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_listings(
        self,
        region: Optional[str] = None,
        status: str = "active",
        featured: Optional[bool] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        min_area: Optional[float] = None,
        max_area: Optional[float] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[PlotListing]:
        """Get plot listings with filters"""
        query = self.db.query(PlotListing).join(Parcel)
        
        # Apply filters
        if status:
            query = query.filter(PlotListing.status == status)
        
        if region:
            query = query.filter(Parcel.region == region)
        
        if featured is not None:
            query = query.filter(PlotListing.featured == featured)
        
        if min_price:
            query = query.filter(PlotListing.price >= min_price)
        
        if max_price:
            query = query.filter(PlotListing.price <= max_price)
        
        if min_area:
            query = query.filter(Parcel.area_sqm >= min_area)
        
        if max_area:
            query = query.filter(Parcel.area_sqm <= max_area)
        
        # Order by featured first, then by creation date
        query = query.order_by(desc(PlotListing.featured), desc(PlotListing.created_at))
        
        return query.offset(offset).limit(limit).all()
    
    def get_listing_by_id(self, listing_id: uuid.UUID) -> Optional[PlotListing]:
        """Get listing by ID"""
        return self.db.query(PlotListing).filter(PlotListing.id == listing_id).first()
    
    def create_listing(self, listing_data: PlotListingCreate, listed_by: uuid.UUID) -> PlotListing:
        """Create new plot listing"""
        # Verify parcel exists
        parcel = self.db.query(Parcel).filter(Parcel.id == listing_data.parcel_id).first()
        if not parcel:
            raise ValueError("Parcel not found")
        
        # Calculate price per sqm if not provided
        price_per_sqm = listing_data.price_per_sqm
        if not price_per_sqm and parcel.area_sqm:
            price_per_sqm = float(listing_data.price) / float(parcel.area_sqm)
        
        db_listing = PlotListing(
            parcel_id=listing_data.parcel_id,
            title=listing_data.title,
            description=listing_data.description,
            price=listing_data.price,
            price_per_sqm=price_per_sqm,
            status=listing_data.status,
            featured=listing_data.featured,
            amenities=listing_data.amenities,
            images=listing_data.images,
            contact_person=listing_data.contact_person,
            contact_phone=listing_data.contact_phone,
            contact_email=listing_data.contact_email,
            listed_by=listed_by
        )
        
        self.db.add(db_listing)
        self.db.commit()
        self.db.refresh(db_listing)
        
        return db_listing
    
    def update_listing(self, listing_id: uuid.UUID, listing_update: PlotListingUpdate) -> PlotListing:
        """Update plot listing"""
        listing = self.get_listing_by_id(listing_id)
        if not listing:
            raise ValueError("Listing not found")
        
        update_data = listing_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(listing, field, value)
        
        self.db.commit()
        self.db.refresh(listing)
        
        return listing
    
    def delete_listing(self, listing_id: uuid.UUID) -> bool:
        """Delete plot listing"""
        listing = self.get_listing_by_id(listing_id)
        if not listing:
            return False
        
        self.db.delete(listing)
        self.db.commit()
        
        return True
    
    def create_inquiry(self, inquiry_data: PlotInquiryCreate) -> PlotInquiry:
        """Create plot inquiry"""
        # Verify parcel exists
        parcel = self.db.query(Parcel).filter(Parcel.id == inquiry_data.parcel_id).first()
        if not parcel:
            raise ValueError("Parcel not found")
        
        # Verify listing exists if provided
        if inquiry_data.listing_id:
            listing = self.get_listing_by_id(inquiry_data.listing_id)
            if not listing:
                raise ValueError("Listing not found")
        
        db_inquiry = PlotInquiry(
            parcel_id=inquiry_data.parcel_id,
            listing_id=inquiry_data.listing_id,
            customer_name=inquiry_data.customer_name,
            customer_email=inquiry_data.customer_email,
            customer_phone=inquiry_data.customer_phone,
            message=inquiry_data.message,
            inquiry_type=inquiry_data.inquiry_type,
            source_website=inquiry_data.source_website,
            referral_data=inquiry_data.referral_data
        )
        
        self.db.add(db_inquiry)
        self.db.commit()
        self.db.refresh(db_inquiry)
        
        return db_inquiry
    
    def get_inquiries(
        self,
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[PlotInquiry]:
        """Get plot inquiries"""
        query = self.db.query(PlotInquiry)
        
        if status:
            query = query.filter(PlotInquiry.status == status)
        
        query = query.order_by(desc(PlotInquiry.created_at))
        
        return query.offset(offset).limit(limit).all()
    
    def respond_to_inquiry(self, inquiry_id: uuid.UUID, responded_by: uuid.UUID, response_message: str):
        """Respond to plot inquiry"""
        inquiry = self.db.query(PlotInquiry).filter(PlotInquiry.id == inquiry_id).first()
        if not inquiry:
            raise ValueError("Inquiry not found")
        
        inquiry.status = "responded"
        inquiry.responded_at = datetime.utcnow()
        inquiry.responded_by = responded_by
        
        self.db.commit()
        self.db.refresh(inquiry)
        
        # Here you would typically send an email response to the customer
        # For now, we'll just return the updated inquiry
        
        return inquiry