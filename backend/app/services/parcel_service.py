from sqlalchemy.orm import Session
from sqlalchemy import text, and_, or_
from typing import List, Optional, Dict, Any
from app.models.parcel import Parcel
from app.schemas.parcel import ParcelCreate, ParcelUpdate, ParcelCollection, ParcelFeature
import json
from shapely.geometry import shape
from geoalchemy2.shape import from_shape

class ParcelService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_parcels_by_region(self, regions: List[str], limit: int = 1000) -> ParcelCollection:
        """Get parcels by regions"""
        query = self.db.query(Parcel)
        
        if regions:
            query = query.filter(Parcel.region.in_(regions))
        
        parcels = query.limit(limit).all()
        
        features = []
        for parcel in parcels:
            # Get geometry as GeoJSON
            geom_query = text("""
                SELECT ST_AsGeoJSON(geometry) as geometry 
                FROM parcels 
                WHERE id = :parcel_id
            """)
            result = self.db.execute(geom_query, {"parcel_id": parcel.id}).first()
            
            geometry = json.loads(result.geometry) if result else None
            
            features.append(ParcelFeature(
                id=parcel.parcel_id,
                geometry=geometry,
                properties={
                    "parcel_id": parcel.parcel_id,
                    "region": parcel.region,
                    "district": parcel.district,
                    "ward": parcel.ward,
                    "area_sqm": float(parcel.area_sqm) if parcel.area_sqm else None,
                    "perimeter_m": float(parcel.perimeter_m) if parcel.perimeter_m else None,
                    "owner_name": parcel.owner_name,
                    "owner_id": parcel.owner_id,
                    "address": parcel.address,
                    "land_use": parcel.land_use,
                    "zoning": parcel.zoning,
                    "valuation": float(parcel.valuation) if parcel.valuation else None,
                    "created_at": parcel.created_at.isoformat() if parcel.created_at else None,
                    "updated_at": parcel.updated_at.isoformat() if parcel.updated_at else None
                }
            ))
        
        return ParcelCollection(
            features=features,
            total=len(features)
        )
    
    def get_parcels_in_bbox(self, bbox: List[float], regions: List[str] = None, limit: int = 1000) -> ParcelCollection:
        """Get parcels within bounding box"""
        minx, miny, maxx, maxy = bbox
        
        query = text("""
            SELECT 
                id,
                parcel_id,
                ST_AsGeoJSON(geometry) as geometry,
                region,
                district,
                ward,
                area_sqm,
                perimeter_m,
                owner_name,
                owner_id,
                address,
                land_use,
                zoning,
                valuation,
                created_at,
                updated_at
            FROM parcels 
            WHERE ST_Intersects(
                geometry, 
                ST_MakeEnvelope(:minx, :miny, :maxx, :maxy, 4326)
            )
            AND (:regions IS NULL OR region = ANY(:regions))
            LIMIT :limit
        """)
        
        result = self.db.execute(query, {
            "minx": minx, "miny": miny, "maxx": maxx, "maxy": maxy, 
            "regions": regions, "limit": limit
        })
        
        features = []
        for row in result:
            features.append(ParcelFeature(
                id=row.parcel_id,
                geometry=json.loads(row.geometry),
                properties={
                    "parcel_id": row.parcel_id,
                    "region": row.region,
                    "district": row.district,
                    "ward": row.ward,
                    "area_sqm": float(row.area_sqm) if row.area_sqm else None,
                    "perimeter_m": float(row.perimeter_m) if row.perimeter_m else None,
                    "owner_name": row.owner_name,
                    "owner_id": row.owner_id,
                    "address": row.address,
                    "land_use": row.land_use,
                    "zoning": row.zoning,
                    "valuation": float(row.valuation) if row.valuation else None,
                    "created_at": row.created_at.isoformat() if row.created_at else None,
                    "updated_at": row.updated_at.isoformat() if row.updated_at else None
                }
            ))
        
        return ParcelCollection(
            features=features,
            total=len(features)
        )
    
    def get_parcel_by_id(self, parcel_id: str) -> Optional[Dict[str, Any]]:
        """Get single parcel by ID with detailed measurements"""
        query = text("""
            SELECT 
                id,
                parcel_id,
                ST_AsGeoJSON(geometry) as geometry,
                region,
                district,
                ward,
                area_sqm,
                perimeter_m,
                owner_name,
                owner_id,
                address,
                land_use,
                zoning,
                valuation,
                created_at,
                updated_at,
                ST_Area(geometry::geography) as calculated_area,
                ST_Perimeter(geometry::geography) as calculated_perimeter
            FROM parcels 
            WHERE parcel_id = :parcel_id
        """)
        
        result = self.db.execute(query, {"parcel_id": parcel_id}).first()
        
        if not result:
            return None
            
        return {
            "parcel_id": result.parcel_id,
            "geometry": json.loads(result.geometry),
            "region": result.region,
            "district": result.district,
            "ward": result.ward,
            "area_sqm": float(result.area_sqm) if result.area_sqm else None,
            "perimeter_m": float(result.perimeter_m) if result.perimeter_m else None,
            "owner_name": result.owner_name,
            "owner_id": result.owner_id,
            "address": result.address,
            "land_use": result.land_use,
            "zoning": result.zoning,
            "valuation": float(result.valuation) if result.valuation else None,
            "created_at": result.created_at.isoformat() if result.created_at else None,
            "updated_at": result.updated_at.isoformat() if result.updated_at else None,
            "measurements": {
                "area_sqm": float(result.calculated_area),
                "area_acres": float(result.calculated_area) * 0.000247105,
                "area_hectares": float(result.calculated_area) * 0.0001,
                "perimeter_m": float(result.calculated_perimeter)
            }
        }
    
    def search_parcels(self, field: str, value: str, regions: List[str] = None) -> ParcelCollection:
        """Search parcels by field"""
        allowed_fields = ["owner_name", "parcel_id", "address", "land_use", "region"]
        if field not in allowed_fields:
            raise ValueError(f"Invalid search field: {field}")
        
        query = text(f"""
            SELECT 
                id,
                parcel_id,
                ST_AsGeoJSON(geometry) as geometry,
                region,
                district,
                ward,
                area_sqm,
                perimeter_m,
                owner_name,
                owner_id,
                address,
                land_use,
                zoning,
                valuation,
                created_at,
                updated_at
            FROM parcels 
            WHERE {field} ILIKE :value
            AND (:regions IS NULL OR region = ANY(:regions))
            LIMIT 100
        """)
        
        result = self.db.execute(query, {"value": f"%{value}%", "regions": regions})
        
        features = []
        for row in result:
            features.append(ParcelFeature(
                id=row.parcel_id,
                geometry=json.loads(row.geometry),
                properties={
                    "parcel_id": row.parcel_id,
                    "region": row.region,
                    "district": row.district,
                    "ward": row.ward,
                    "area_sqm": float(row.area_sqm) if row.area_sqm else None,
                    "perimeter_m": float(row.perimeter_m) if row.perimeter_m else None,
                    "owner_name": row.owner_name,
                    "owner_id": row.owner_id,
                    "address": row.address,
                    "land_use": row.land_use,
                    "zoning": row.zoning,
                    "valuation": float(row.valuation) if row.valuation else None,
                    "created_at": row.created_at.isoformat() if row.created_at else None,
                    "updated_at": row.updated_at.isoformat() if row.updated_at else None
                }
            ))
        
        return ParcelCollection(
            features=features,
            total=len(features)
        )
    
    def create_parcel(self, parcel_data: ParcelCreate) -> Parcel:
        """Create new parcel"""
        # Convert GeoJSON geometry to PostGIS geometry
        geom = shape(parcel_data.geometry)
        
        db_parcel = Parcel(
            parcel_id=parcel_data.parcel_id,
            geometry=from_shape(geom, srid=4326),
            region=parcel_data.region,
            district=parcel_data.district,
            ward=parcel_data.ward,
            area_sqm=parcel_data.area_sqm,
            perimeter_m=parcel_data.perimeter_m,
            owner_name=parcel_data.owner_name,
            owner_id=parcel_data.owner_id,
            address=parcel_data.address,
            land_use=parcel_data.land_use,
            zoning=parcel_data.zoning,
            valuation=parcel_data.valuation
        )
        
        self.db.add(db_parcel)
        self.db.commit()
        self.db.refresh(db_parcel)
        
        return db_parcel