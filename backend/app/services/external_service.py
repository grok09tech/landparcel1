from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Dict, Any, List
import uuid
from datetime import datetime

from app.models.listing import PlotListing, PlotInquiry
from app.models.parcel import Parcel

class ExternalApiService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_regions_summary(self) -> List[Dict[str, Any]]:
        """Get summary of available regions with plot counts"""
        query = self.db.query(
            Parcel.region,
            func.count(PlotListing.id).label('available_plots'),
            func.min(PlotListing.price).label('min_price'),
            func.max(PlotListing.price).label('max_price'),
            func.avg(PlotListing.price).label('avg_price'),
            func.sum(Parcel.area_sqm).label('total_area')
        ).join(
            PlotListing, Parcel.id == PlotListing.parcel_id
        ).filter(
            PlotListing.status == 'active'
        ).group_by(Parcel.region).all()
        
        regions = []
        for row in query:
            regions.append({
                'region': row.region,
                'available_plots': row.available_plots,
                'price_range': {
                    'min': float(row.min_price) if row.min_price else 0,
                    'max': float(row.max_price) if row.max_price else 0,
                    'average': float(row.avg_price) if row.avg_price else 0
                },
                'total_area_sqm': float(row.total_area) if row.total_area else 0
            })
        
        return regions
    
    def get_plot_statistics(self, region: str = None) -> Dict[str, Any]:
        """Get plot statistics for external integration"""
        query = self.db.query(PlotListing).join(Parcel).filter(PlotListing.status == 'active')
        
        if region:
            query = query.filter(Parcel.region == region)
        
        listings = query.all()
        
        if not listings:
            return {
                'total_plots': 0,
                'region': region,
                'statistics': {}
            }
        
        prices = [float(listing.price) for listing in listings]
        areas = [float(listing.parcel.area_sqm) for listing in listings if listing.parcel.area_sqm]
        
        # Land use distribution
        land_use_dist = {}
        for listing in listings:
            land_use = listing.parcel.land_use or 'Unknown'
            land_use_dist[land_use] = land_use_dist.get(land_use, 0) + 1
        
        # Featured plots count
        featured_count = sum(1 for listing in listings if listing.featured)
        
        return {
            'total_plots': len(listings),
            'region': region,
            'featured_plots': featured_count,
            'price_statistics': {
                'min_price': min(prices) if prices else 0,
                'max_price': max(prices) if prices else 0,
                'average_price': sum(prices) / len(prices) if prices else 0,
                'currency': 'TZS'
            },
            'area_statistics': {
                'min_area_sqm': min(areas) if areas else 0,
                'max_area_sqm': max(areas) if areas else 0,
                'average_area_sqm': sum(areas) / len(areas) if areas else 0,
                'total_area_sqm': sum(areas) if areas else 0
            },
            'land_use_distribution': land_use_dist,
            'last_updated': datetime.utcnow().isoformat()
        }
    
    def track_plot_view(self, listing_id: uuid.UUID, viewer_data: Dict[str, Any], api_key_name: str):
        """Track plot views from external websites"""
        # In a real implementation, you might want to store this in a separate analytics table
        # For now, we'll just return a success response
        
        listing = self.db.query(PlotListing).filter(PlotListing.id == listing_id).first()
        if not listing:
            raise ValueError("Listing not found")
        
        # You could store view analytics here
        view_record = {
            'listing_id': str(listing_id),
            'viewer_data': viewer_data,
            'api_source': api_key_name,
            'timestamp': datetime.utcnow().isoformat(),
            'listing_title': listing.title,
            'region': listing.parcel.region if listing.parcel else None
        }
        
        # In production, you might want to:
        # 1. Store in analytics table
        # 2. Update view counters
        # 3. Trigger marketing automation
        # 4. Send notifications to listing owners
        
        return {
            'success': True,
            'message': 'Plot view tracked successfully',
            'view_id': str(uuid.uuid4())  # Generate a tracking ID
        }
    
    def get_integration_guide(self) -> Dict[str, Any]:
        """Get integration guide for external websites"""
        return {
            'api_version': '1.0',
            'base_url': '/api/v1/external',
            'authentication': {
                'type': 'API Key',
                'header': 'X-API-Key',
                'description': 'Contact admin to get API key'
            },
            'endpoints': {
                'get_plots': {
                    'method': 'GET',
                    'path': '/plots',
                    'description': 'Get available plots with filtering',
                    'parameters': [
                        'region', 'min_price', 'max_price', 'min_area', 'max_area', 
                        'featured_only', 'limit', 'offset'
                    ]
                },
                'get_plot_details': {
                    'method': 'GET',
                    'path': '/plots/{listing_id}',
                    'description': 'Get detailed plot information'
                },
                'submit_inquiry': {
                    'method': 'POST',
                    'path': '/inquiries',
                    'description': 'Submit customer inquiry',
                    'required_headers': ['X-Source-Website']
                },
                'get_regions': {
                    'method': 'GET',
                    'path': '/regions',
                    'description': 'Get available regions with statistics'
                }
            },
            'rate_limits': {
                'default': '1000 requests per hour',
                'burst': '100 requests per minute'
            },
            'response_format': 'JSON',
            'support_contact': 'api-support@landparcel.com'
        }