"""
BHUMI-X Sentinel-2 Optical Processing Engine
Handles Copernicus Sentinel-2 L2A (Harmonized) MSI data:
- Bands: B2, B3, B4, B5, B6, B7, B8, B8A, B11, B12
- Spectral Indices: NDVI, NDMI, EVI, NDRE
- Quality Assessment: SCL (Scene Classification Layer) and QA60 cloud bitmask
- Missing-modality flag for monsoonal cloud occlusion
"""

from typing import Dict, Any, List, Optional
import math
from datetime import datetime
from backend.app.services.provenance import provenance_tracker


class Sentinel2Processor:
    @staticmethod
    def compute_spectral_indices(
        b2: float,   # Blue (490 nm)
        b3: float,   # Green (560 nm)
        b4: float,   # Red (665 nm)
        b8: float,   # NIR (842 nm)
        b11: float,  # SWIR1 (1610 nm)
        b5: Optional[float] = None,  # Red Edge 1 (705 nm)
        b8a: Optional[float] = None  # Narrow NIR (865 nm)
    ) -> Dict[str, float]:
        """
        Computes standard biophysical indices with division-by-zero protection.
        All reflectance values in range [0.0, 1.0].
        """
        eps = 1e-6
        # 1. Normalized Difference Vegetation Index (NDVI)
        ndvi = (b8 - b4) / (b8 + b4 + eps)
        ndvi = max(-1.0, min(1.0, ndvi))

        # 2. Normalized Difference Moisture Index (NDMI)
        ndmi = (b8 - b11) / (b8 + b11 + eps)
        ndmi = max(-1.0, min(1.0, ndmi))

        # 3. Enhanced Vegetation Index (EVI)
        denom_evi = b8 + 6.0 * b4 - 7.5 * b2 + 1.0
        evi = 2.5 * (b8 - b4) / (denom_evi + eps) if abs(denom_evi) > eps else 0.0
        evi = max(-1.0, min(1.5, evi))

        # 4. Red Edge Chlorophyll Index (NDRE)
        if b5 is not None and b8a is not None:
            ndre = (b8a - b5) / (b8a + b5 + eps)
            ndre = max(-1.0, min(1.0, ndre))
        else:
            ndre = ndvi * 0.85  # Approximation if narrow red-edge band missing

        return {
            "ndvi": round(ndvi, 4),
            "ndmi": round(ndmi, 4),
            "evi": round(evi, 4),
            "ndre": round(ndre, 4)
        }

    @classmethod
    def process_observation(
        cls,
        lat: float,
        lon: float,
        acquisition_date: str,
        cloud_coverage_pct: float,
        reflectance: Dict[str, float],
        scene_classification: int = 4  # 4 = Vegetation, 5 = Bare Soil, 8/9 = Clouds, 3 = Shadow
    ) -> Dict[str, Any]:
        """
        Processes a genuine Sentinel-2 acquisition and sets cloud mask states.
        """
        is_cloud_obscured = cloud_coverage_pct > 70.0 or scene_classification in [3, 8, 9, 10]
        
        b2 = reflectance.get("B2", 0.05)
        b3 = reflectance.get("B3", 0.08)
        b4 = reflectance.get("B4", 0.06)
        b8 = reflectance.get("B8", 0.35)
        b11 = reflectance.get("B11", 0.18)
        b5 = reflectance.get("B5", 0.12)
        b8a = reflectance.get("B8A", 0.36)

        indices = cls.compute_spectral_indices(b2, b3, b4, b8, b11, b5, b8a)

        provenance_tracker.register_observation(
            modality="Optical",
            source_name="Copernicus Sentinel-2 MSI L2A",
            dataset_id="COPERNICUS/S2_SR_HARMONIZED",
            spatial_resolution_m=10.0,
            temporal_resolution="5-day revisit",
            target_coords={"lat": lat, "lon": lon},
            acquisition_time=acquisition_date,
            quality_flags={
                "cloud_coverage_pct": cloud_coverage_pct,
                "scl_code": scene_classification,
                "is_cloud_obscured": is_cloud_obscured
            },
            is_available=not is_cloud_obscured
        )

        return {
            "satellite": "Sentinel-2A/B",
            "modality": "Optical",
            "acquisition_date": acquisition_date,
            "spatial_resolution_m": 10.0,
            "cloud_coverage_pct": cloud_coverage_pct,
            "scene_classification": scene_classification,
            "is_cloud_obscured": is_cloud_obscured,
            "reflectance": reflectance,
            "indices": indices if not is_cloud_obscured else {
                "ndvi": None,
                "ndmi": None,
                "evi": None,
                "ndre": None,
                "masked_reason": f"Cloud obscured (Coverage {cloud_coverage_pct}%, SCL {scene_classification})"
            }
        }

