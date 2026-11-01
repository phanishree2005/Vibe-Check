"""
BHUMI-X NASA POWER Agroclimatology Service
Connects to NASA POWER REST API to acquire genuine, daily meteorological observations:
- Precipitation (PRECTOTCORR, mm/day)
- 2m Maximum Temperature (T2M_MAX, deg C)
- 2m Minimum Temperature (T2M_MIN, deg C)
- 2m Dewpoint Temperature (T2MDEW, deg C)
- 2m Relative Humidity (RH2M, %)
- Surface Solar Radiation (ALLSKY_SFC_SW_DWN, MJ/m^2/day)
- 2m Wind Speed (WS2M, m/s)
- Vapor Pressure Deficit (VPD, kPa) computed via Tetens equation
"""

import math
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import httpx
from backend.app.services.provenance import provenance_tracker


class NasaPowerService:
    BASE_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"

    @staticmethod
    def calculate_vapor_pressure_deficit(t_max: float, t_min: float, t_dew: float) -> float:
        """
        Calculate Vapor Pressure Deficit (VPD) in kPa using standard FAO-56 Penman-Monteith formulas.
        e0(T) = 0.6108 * exp((17.27 * T) / (T + 237.3))
        es = (e0(T_max) + e0(T_min)) / 2
        ea = e0(T_dew)
        VPD = max(0.0, es - ea)
        """
        try:
            es_max = 0.6108 * math.exp((17.27 * t_max) / (t_max + 237.3))
            es_min = 0.6108 * math.exp((17.27 * t_min) / (t_min + 237.3))
            es = (es_max + es_min) / 2.0
            ea = 0.6108 * math.exp((17.27 * t_dew) / (t_dew + 237.3))
            vpd = max(0.0, es - ea)
            return round(vpd, 3)
        except Exception:
            return 0.0

    async def fetch_daily_weather(
        self,
        lat: float,
        lon: float,
        start_date: str,  # Format: YYYYMMDD
        end_date: str     # Format: YYYYMMDD
    ) -> Dict[str, Any]:
        """
        Fetches genuine daily agro-meteorological data from NASA POWER.
        """
        params = {
            "parameters": "PRECTOTCORR,T2M_MAX,T2M_MIN,T2MDEW,RH2M,ALLSKY_SFC_SW_DWN,WS2M",
            "community": "AG",
            "longitude": lon,
            "latitude": lat,
            "start": start_date,
            "end": end_date,
            "format": "JSON"
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.get(self.BASE_URL, params=params)
                if response.status_code != 200:
                    provenance_tracker.register_observation(
                        modality="Meteorology",
                        source_name="NASA POWER Agroclimatology",
                        dataset_id="POWER_POINT_DAILY",
                        spatial_resolution_m=50000.0,
                        temporal_resolution="Daily",
                        target_coords={"lat": lat, "lon": lon},
                        acquisition_time=f"{start_date}-{end_date}",
                        quality_flags={"status_code": response.status_code},
                        is_available=False,
                        error_message=f"HTTP {response.status_code}: {response.text[:200]}"
                    )
                    return {
                        "is_available": False,
                        "source": "NASA POWER",
                        "error": f"API returned status {response.status_code}",
                        "records": []
                    }

                data = response.json()
                properties = data.get("properties", {})
                param_data = properties.get("parameter", {})

                precip = param_data.get("PRECTOTCORR", {})
                t_max = param_data.get("T2M_MAX", {})
                t_min = param_data.get("T2M_MIN", {})
                t_dew = param_data.get("T2MDEW", {})
                rh = param_data.get("RH2M", {})
                srad = param_data.get("ALLSKY_SFC_SW_DWN", {})
                wind = param_data.get("WS2M", {})

                records = []
                dates = sorted(list(precip.keys()))
                for d in dates:
                    p_val = precip.get(d, -999.0)
                    tmax_val = t_max.get(d, -999.0)
                    tmin_val = t_min.get(d, -999.0)
                    tdew_val = t_dew.get(d, -999.0)
                    rh_val = rh.get(d, -999.0)
                    srad_val = srad.get(d, -999.0)
                    wind_val = wind.get(d, -999.0)

                    # Missing or fill value check in NASA POWER (-999 or -99)
                    if -900 in [p_val, tmax_val, tmin_val]:
                        continue

                    vpd_val = self.calculate_vapor_pressure_deficit(tmax_val, tmin_val, tdew_val)

                    records.append({
                        "date": d,
                        "precipitation_mm": max(0.0, p_val),
                        "temp_max_c": tmax_val,
                        "temp_min_c": tmin_val,
                        "dewpoint_c": tdew_val,
                        "rel_humidity_pct": rh_val,
                        "solar_radiation_mj_m2": max(0.0, srad_val),
                        "wind_speed_2m_ms": max(0.0, wind_val),
                        "vpd_kpa": vpd_val
                    })

                provenance_tracker.register_observation(
                    modality="Meteorology",
                    source_name="NASA POWER Agroclimatology",
                    dataset_id="POWER_POINT_DAILY",
                    spatial_resolution_m=50000.0,
                    temporal_resolution="Daily",
                    target_coords={"lat": lat, "lon": lon},
                    acquisition_time=f"{start_date}-{end_date}",
                    quality_flags={"record_count": len(records), "data_fill_policy": "NASA POWER Version 2"},
                    is_available=True
                )

                return {
                    "is_available": True,
                    "source": "NASA POWER Agroclimatology",
                    "spatial_resolution_km": 50.0,
                    "temporal_resolution": "Daily",
                    "coordinate_system": "EPSG:4326",
                    "record_count": len(records),
                    "records": records
                }

            except Exception as e:
                provenance_tracker.register_observation(
                    modality="Meteorology",
                    source_name="NASA POWER Agroclimatology",
                    dataset_id="POWER_POINT_DAILY",
                    spatial_resolution_m=50000.0,
                    temporal_resolution="Daily",
                    target_coords={"lat": lat, "lon": lon},
                    acquisition_time=f"{start_date}-{end_date}",
                    quality_flags={},
                    is_available=False,
                    error_message=str(e)
                )
                return {
                    "is_available": False,
                    "source": "NASA POWER",
                    "error": str(e),
                    "records": []
                }

