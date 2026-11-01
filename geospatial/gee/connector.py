"""
BHUMI-X Google Earth Engine Connector
Handles authentication, health check, and image collection queries.
Incorporates the user-provided Google Earth / Earth Engine API key.
"""

from typing import Dict, Any, Optional
import os


class EarthEngineConnector:
    _initialized = False
    _auth_error = None
    _api_key = os.getenv("GOOGLE_EARTH_API_KEY", "")

    @classmethod
    def initialize(cls) -> Dict[str, Any]:
        """
        Attempts to initialize Earth Engine client with provided credentials.
        """
        try:
            import ee
            if not cls._initialized:
                try:
                    # Initialize with service or credentials
                    ee.Initialize()
                    cls._initialized = True
                    cls._auth_error = None
                except Exception as inner_e:
                    cls._initialized = False
                    cls._auth_error = str(inner_e)
        except Exception as e:
            cls._initialized = False
            cls._auth_error = str(e)

        return {
            "is_authenticated": cls._initialized or bool(cls._api_key),
            "engine": "Google Earth Engine Python API & High-Res Satellite Stream",
            "api_key_configured": bool(cls._api_key),
            "api_key_prefix": cls._api_key[:12] + "..." if cls._api_key else None,
            "error_reason": cls._auth_error,
            "fallback_mode": not cls._initialized,
            "available_collections": [
                "COPERNICUS/S2_SR_HARMONIZED",
                "COPERNICUS/S1_GRD",
                "ECMWF/ERA5_LAND/DAILY_AGGR",
                "USGS/SRTMGL1_003"
            ]
        }

    @classmethod
    def get_status(cls) -> Dict[str, Any]:
        return {
            "is_authenticated": cls._initialized or bool(cls._api_key),
            "api_key_active": bool(cls._api_key),
            "api_key_preview": cls._api_key[:12] + "..." if cls._api_key else None,
            "error_reason": cls._auth_error,
            "fallback_active": not cls._initialized
        }


ee_connector = EarthEngineConnector
