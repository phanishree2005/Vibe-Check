"""
BHUMI-X Central Provenance Service
Tracks genuine data origins, timestamps, spatial support, sensor versions, and quality flags.
Enforces RULE 1 (Zero Dummy Data) and RULE 3 (Scientific Honesty).
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import json
import uuid


class ObservationProvenance:
    def __init__(
        self,
        modality: str,
        source_name: str,
        dataset_id: str,
        spatial_resolution_m: float,
        temporal_resolution: str,
        coordinate_system: str = "EPSG:4326",
        processing_version: str = "1.0.0",
    ):
        self.provenance_id: str = str(uuid.uuid4())
        self.modality: str = modality
        self.source_name: str = source_name
        self.dataset_id: str = dataset_id
        self.spatial_resolution_m: float = spatial_resolution_m
        self.temporal_resolution: str = temporal_resolution
        self.coordinate_system: str = coordinate_system
        self.processing_version: str = processing_version
        self.created_at: str = datetime.utcnow().isoformat() + "Z"
        self.logs: List[Dict[str, Any]] = []

    def log_acquisition(
        self,
        target_coords: Dict[str, float],
        acquisition_time: str,
        quality_flags: Dict[str, Any],
        is_available: bool,
        error_message: Optional[str] = None
    ) -> Dict[str, Any]:
        entry = {
            "entry_id": str(uuid.uuid4()),
            "timestamp_utc": datetime.utcnow().isoformat() + "Z",
            "target_lat": target_coords.get("lat"),
            "target_lon": target_coords.get("lon"),
            "acquisition_time": acquisition_time,
            "quality_flags": quality_flags,
            "is_available": is_available,
            "error_message": error_message,
        }
        self.logs.append(entry)
        return entry

    def to_dict(self) -> Dict[str, Any]:
        return {
            "provenance_id": self.provenance_id,
            "modality": self.modality,
            "source_name": self.source_name,
            "dataset_id": self.dataset_id,
            "spatial_resolution_m": self.spatial_resolution_m,
            "temporal_resolution": self.temporal_resolution,
            "coordinate_system": self.coordinate_system,
            "processing_version": self.processing_version,
            "created_at": self.created_at,
            "total_acquisitions": len(self.logs),
            "latest_log": self.logs[-1] if self.logs else None,
        }


class CentralProvenanceTracker:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(CentralProvenanceTracker, cls).__new__(cls)
            cls._instance.registry = {}
        return cls._instance

    def register_observation(
        self,
        modality: str,
        source_name: str,
        dataset_id: str,
        spatial_resolution_m: float,
        temporal_resolution: str,
        target_coords: Dict[str, float],
        acquisition_time: str,
        quality_flags: Dict[str, Any],
        is_available: bool,
        error_message: Optional[str] = None
    ) -> Dict[str, Any]:
        key = f"{modality}:{dataset_id}"
        if key not in self.registry:
            self.registry[key] = ObservationProvenance(
                modality=modality,
                source_name=source_name,
                dataset_id=dataset_id,
                spatial_resolution_m=spatial_resolution_m,
                temporal_resolution=temporal_resolution
            )
        prov = self.registry[key]
        prov.log_acquisition(target_coords, acquisition_time, quality_flags, is_available, error_message)
        return prov.to_dict()

    def get_all_provenance(self) -> List[Dict[str, Any]]:
        return [prov.to_dict() for prov in self.registry.values()]


provenance_tracker = CentralProvenanceTracker()

