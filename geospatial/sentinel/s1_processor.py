"""
BHUMI-X Sentinel-1 SAR Processing Engine
Handles Copernicus Sentinel-1 C-band Synthetic Aperture Radar (GRD) data:
- Polarizations: VV, VH (in decibels, dB)
- Cross-ratio: VH/VV (in linear power) or VH - VV (in dB)
- Radar Vegetation Index (RVI): RVI = 4 * VH / (VV + VH)
- Cloud-penetration capability: provides uninterrupted signal during monsoonal cloud-blindouts
"""

import math
from typing import Dict, Any, Optional
from backend.app.services.provenance import provenance_tracker


class Sentinel1Processor:
    @staticmethod
    def calculate_sar_metrics(vv_db: float, vh_db: float) -> Dict[str, float]:
        """
        Calculates polarimetric SAR metrics from calibrated backscatter in decibels.
        vv_db, vh_db typically in range [-25.0 dB, -5.0 dB].
        """
        # Convert dB to linear power: sigma0_lin = 10^(sigma0_db / 10)
        vv_lin = 10.0 ** (vv_db / 10.0)
        vh_lin = 10.0 ** (vh_db / 10.0)

        # Cross-ratio in dB: vh_db - vv_db (equivalent to 10*log10(vh_lin / vv_lin))
        cross_ratio_db = vh_db - vv_db

        # Radar Vegetation Index (RVI) for dual-pol C-band:
        # RVI = (4 * vh_lin) / (vv_lin + vh_lin)
        denom = vv_lin + vh_lin
        rvi = (4.0 * vh_lin) / (denom + 1e-8) if denom > 0 else 0.0
        rvi = max(0.0, min(1.0, rvi))

        # Normalized Difference Polarization Index (NDPI):
        # NDPI = (vv_lin - vh_lin) / (vv_lin + vh_lin)
        ndpi = (vv_lin - vh_lin) / (denom + 1e-8) if denom > 0 else 0.0

        return {
            "vv_db": round(vv_db, 2),
            "vh_db": round(vh_db, 2),
            "cross_ratio_db": round(cross_ratio_db, 2),
            "rvi": round(rvi, 4),
            "ndpi": round(ndpi, 4)
        }

    @classmethod
    def process_observation(
        cls,
        lat: float,
        lon: float,
        acquisition_date: str,
        vv_db: float,
        vh_db: float,
        orbit_pass: str = "DESCENDING",  # ASCENDING or DESCENDING
        incidence_angle_deg: float = 38.5
    ) -> Dict[str, Any]:
        """
        Processes a genuine Sentinel-1 SAR acquisition.
        Notice: SAR is immune to cloud cover, so is_available is always True for valid acquisitions.
        """
        sar_metrics = cls.calculate_sar_metrics(vv_db, vh_db)

        provenance_tracker.register_observation(
            modality="SAR",
            source_name="Copernicus Sentinel-1 C-band SAR GRD",
            dataset_id="COPERNICUS/S1_GRD",
            spatial_resolution_m=10.0,
            temporal_resolution="6-12 day revisit",
            target_coords={"lat": lat, "lon": lon},
            acquisition_time=acquisition_date,
            quality_flags={
                "orbit_pass": orbit_pass,
                "incidence_angle_deg": incidence_angle_deg,
                "cloud_penetrating": True
            },
            is_available=True
        )

        return {
            "satellite": "Sentinel-1A/C",
            "modality": "SAR",
            "acquisition_date": acquisition_date,
            "spatial_resolution_m": 10.0,
            "orbit_pass": orbit_pass,
            "incidence_angle_deg": incidence_angle_deg,
            "is_cloud_obscured": False,
            "metrics": sar_metrics
        }

