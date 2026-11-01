"""
BHUMI-X Comprehensive Scientific Test Suite
Tests every core component of the spatiotemporal intelligence system:
- Geospatial processors & spectral indices
- Hydrological pedotransfer functions
- Modality Availability Mask (MAM) & Resolution Support Embeddings
- Trained BhumiXNet forward inference
- Conformal Prediction & Mahalanobis OOD detection
- Autonomous Decision Agent multi-tool execution
- Climate Scenario Simulator
"""

import pytest
import torch
import numpy as np
from datetime import datetime

from geospatial.sentinel.s2_processor import Sentinel2Processor
from geospatial.sentinel.s1_processor import Sentinel1Processor
from climate.soil.soil_service import SoilHydrologyService
from backend.app.services.provenance import provenance_tracker
from ml.fusion.bhumix_model import BhumiXNet, ConformalPredictor
from agent.tools.agri_tools import BhumiTools
from agent.workflows.decision_agent import AgriculturalDecisionAgent
from ml.simulation.climate_simulator import ClimateScenarioSimulator


def test_sentinel2_spectral_indices():
    # Healthy green canopy: high NIR (0.45), low Red (0.05), Blue (0.04), SWIR1 (0.15)
    indices = Sentinel2Processor.compute_spectral_indices(b2=0.04, b3=0.08, b4=0.05, b8=0.45, b11=0.15)
    assert 0.70 <= indices["ndvi"] <= 0.85
    assert 0.45 <= indices["ndmi"] <= 0.55
    assert indices["evi"] > 0.50

    # Cloud masked observation
    obs = Sentinel2Processor.process_observation(
        lat=15.45, lon=75.00, acquisition_date="2024-08-01",
        cloud_coverage_pct=85.0,
        reflectance={"B2": 0.04, "B3": 0.08, "B4": 0.05, "B8": 0.45, "B11": 0.15},
        scene_classification=9
    )
    assert obs["is_cloud_obscured"] is True
    assert obs["indices"]["ndvi"] is None


def test_sentinel1_sar_metrics():
    # Typical agricultural canopy backscatter
    metrics = Sentinel1Processor.calculate_sar_metrics(vv_db=-10.5, vh_db=-18.0)
    assert metrics["cross_ratio_db"] == -7.5
    assert 0.0 <= metrics["rvi"] <= 1.0
    assert "vv_db" in metrics and "vh_db" in metrics


def test_soil_pedotransfer_saxton_rawls():
    # Vertisol (Deep Black Soil, Dharwad): Clay = 0.48, Sand = 0.22, OM = 1.15
    hyd = SoilHydrologyService.compute_pedotransfer_properties(clay=0.48, sand=0.22, om=1.15)
    assert hyd["theta_fc"] > hyd["theta_pwp"]
    assert hyd["theta_sat"] > hyd["theta_fc"]
    assert hyd["awc_volumetric"] > 0.08

    # SWDI calculation
    # Saturation (moisture > FC) -> positive SWDI
    swdi_wet = SoilHydrologyService.calculate_soil_water_deficit_index(hyd["theta_fc"] + 0.02, hyd["theta_fc"], hyd["theta_pwp"])
    assert swdi_wet > 0.0

    # Deficit (moisture approaching PWP) -> negative SWDI
    swdi_dry = SoilHydrologyService.calculate_soil_water_deficit_index(hyd["theta_pwp"] + 0.01, hyd["theta_fc"], hyd["theta_pwp"])
    assert swdi_dry < -5.0


def test_bhumix_model_inference_and_gating():
    model, conformal_engine = BhumiTools.get_loaded_model()
    assert model is not None
    assert conformal_engine is not None

    # Normal observation (Full Modality)
    res_normal = BhumiTools.tool_prediction_engine("Dharwad", is_cloud_covered=False, simulated_drought=False)
    assert 0.0 <= res_normal["drought_stress_probability"] <= 1.0
    assert res_normal["dynamic_modality_weights"]["optical"] >= 0.0

    # Cloud Blindout (Optical Masked)
    res_cloud = BhumiTools.tool_prediction_engine("Dharwad", is_cloud_covered=True, simulated_drought=False)
    assert res_cloud["dynamic_modality_weights"]["optical"] == 0.0  # Dynamic gate zeroes out optical
    assert res_cloud["dynamic_modality_weights"]["weather"] > 0.0
    assert res_cloud["dynamic_modality_weights"]["soil"] > 0.0


def test_conformal_uncertainty_and_abstention():
    model, conformal_engine = BhumiTools.get_loaded_model()
    assert conformal_engine.q_hat > 0.0
    assert conformal_engine.ood_threshold > 0.0

    # Normal in-distribution test
    res = conformal_engine.predict_conformal(0.35, np.zeros(64))
    assert len(res["prediction_set"]) >= 1
    assert "No Stress (Normal)" in res["prediction_set"]

    # Extreme OOD synthetic test vector
    ood_latent = np.ones(64) * 50.0
    res_ood = conformal_engine.predict_conformal(0.85, ood_latent)
    assert res_ood["is_out_of_distribution"] is True
    assert res_ood["should_abstain"] is True


def test_decision_agent_execution():
    import asyncio
    # Test consultation under moisture stress
    plan = asyncio.run(AgriculturalDecisionAgent.run_consultation(
        district="Dharwad",
        crop="Maize",
        is_cloud_covered=False,
        simulated_drought=True
    ))
    assert plan["agent_status"] in ["COMPLETED", "ABSTAINED"]
    assert len(plan["audit_trail"]) >= 4
    if plan["agent_status"] == "COMPLETED":
        assert len(plan["recommended_actions"]) > 0
        # Verify UAS Dharwad citation in interventions
        has_uas = any("UAS Dharwad" in act.get("source", "") for act in plan["recommended_actions"])
        assert has_uas is True


def test_climate_scenario_simulator():
    sim = ClimateScenarioSimulator.run_simulation(
        district="Gadag",
        rainfall_pct_change=-50.0,
        temp_increase_c=3.0,
        is_cloud_obscured=True
    )
    assert sim["scenario_type"] == "SIMULATION_HYPOTHETICAL"
    assert sim["simulated_state"]["drought_probability"] >= sim["baseline_state"]["drought_probability"]
    assert "absolute_risk_increase" in sim["impact_metrics"]


def test_provenance_tracking():
    logs = provenance_tracker.get_all_provenance()
    assert len(logs) > 0
    # Every log must have dataset_id, source, and spatial_resolution_m
    for l in logs:
        assert "dataset_id" in l
        assert "source_name" in l
        assert "spatial_resolution_m" in l

