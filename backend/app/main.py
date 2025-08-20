from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import parcels, auth, listings, external
from app.core.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.project_name,
    openapi_url=f"{settings.api_v1_str}/openapi.json"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(parcels.router, prefix=settings.api_v1_str)
app.include_router(auth.router, prefix=settings.api_v1_str)
app.include_router(listings.router, prefix=settings.api_v1_str)
app.include_router(external.router, prefix=settings.api_v1_str)

@app.get("/")
async def root():
    return {"message": "Land Parcel Mapping System API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "2.0.0",
        "features": [
            "Land Parcel Management",
            "User Authentication",
            "Plot Listings",
            "External API Integration",
            "Shapefile Support"
        ]
    }

@app.get("/api-docs")
async def api_documentation():
    return {
        "title": "Tanzania Land Parcel System API",
        "version": "2.0.0",
        "description": "Comprehensive API for land parcel management and real estate integration",
        "endpoints": {
            "authentication": "/api/v1/auth/*",
            "parcels": "/api/v1/parcels/*", 
            "listings": "/api/v1/listings/*",
            "external_integration": "/api/v1/external/*"
        },
        "documentation": "/docs",
        "contact": "admin@landparcel.com"
    }