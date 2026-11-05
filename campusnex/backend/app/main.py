from contextlib import asynccontextmanager
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import engine, Base
from app.database.seed import seed_database
from app.services.simulation import simulator
from app.api import auth, products, orders, vehicles, logistics, iot, sustainability, notifications, vendors

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist, seed demo records
    Base.metadata.create_all(bind=engine)
    seed_database()
    simulator.start()
    yield
    # Shutdown
    simulator.stop()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Autonomous Smart Campus Delivery & Logistics Platform (CO1, CO3, CO4)",
    lifespan=lifespan
)

# CORS configuration for development & demo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(products.router, prefix=settings.API_V1_STR)
app.include_router(orders.router, prefix=settings.API_V1_STR)
app.include_router(vehicles.router, prefix=settings.API_V1_STR)
app.include_router(logistics.router, prefix=settings.API_V1_STR)
app.include_router(iot.router, prefix=settings.API_V1_STR)
app.include_router(sustainability.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(vendors.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "docs_url": "/docs",
        "campus_center": {
            "lat": settings.CAMPUS_CENTER_LAT,
            "lng": settings.CAMPUS_CENTER_LNG
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "simulator_active": simulator.is_running}
