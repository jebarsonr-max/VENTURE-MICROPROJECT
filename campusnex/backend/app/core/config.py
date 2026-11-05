import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CAMPUSNEX — Smart Campus Delivery Ecosystem"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "campusnex-super-secret-key-production-change-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days for demo ease
    
    # SQLite default, easily overridden to PostgreSQL via DATABASE_URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./campusnex.db")

    # Campus Center Geo-reference (e.g. Modern Tech University Campus)
    CAMPUS_CENTER_LAT: float = 12.971598
    CAMPUS_CENTER_LNG: float = 77.594562
    CAMPUS_RADIUS_KM: float = 2.5

    # Vehicle Operational Constraints
    MIN_BATTERY_FOR_DISPATCH: float = 20.0  # percentage
    ROBOT_SPEED_KMH: float = 15.0
    DRONE_SPEED_KMH: float = 45.0
    ROBOT_MAX_PAYLOAD_KG: float = 25.0
    DRONE_MAX_PAYLOAD_KG: float = 4.0

    class Config:
        case_sensitive = True

settings = Settings()

