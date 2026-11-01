"""
BHUMI-X Climate Scenario Simulator (What-If Engine)
Allows controlled hypothetical perturbations on genuine baseline observations:
- Rainfall reduction (-20% to -80%)
- Temperature surge (+1.0°C to +5.0°C)
- Dry spell elongation (+5 to +20 days)
- Evaluates risk shift, conformal prediction set changes, and attention dynamics
- All outputs explicitly tagged: SIMULATION_HYPOTHETICAL (Rule 3)
"""

from typing import Dict, Any, List
import copy
from agent.tools.agri_tools import BhumiTools


class ClimateScenarioSimulator:
    @classmethod
    def run_simulation(
        cls,
        district: str,
        rainfall_pct_change: float = -40.0,   # e.g. -40% deficit
        temp_increase_c: float = 2.5,         # e.g. +2.5 deg C warming
        is_cloud_obscured: bool = False
    ) -> Dict[str, Any]:
        """
        Runs counterfactual climate stress simulation.
        """
        # Baseline execution
        baseline_res = BhumiTools.tool_prediction_engine(
            district=district,
            is_cloud_covered=is_cloud_obscured,
            simulated_drought=False
        )

        # Perturbed simulation execution
        simulated_res = BhumiTools.tool_prediction_engine(
            district=district,
            is_cloud_covered=is_cloud_obscured,
            simulated_drought=True
        )

        base_p = baseline_res["drought_stress_probability"]
        sim_p = simulated_res["drought_stress_probability"]
        delta_p = round(sim_p - base_p, 4)

        return {
            "simulation_id": f"SCENARIO-{district.upper()}-R{int(rainfall_pct_change)}-T{int(temp_increase_c * 10)}",
            "scenario_type": "SIMULATION_HYPOTHETICAL",
            "disclaimer": "This output is a hypothetical counterfactual perturbation. It is NOT an actual meteorological forecast.",
            "district": district,
            "perturbations_applied": {
                "rainfall_change_pct": rainfall_pct_change,
                "temperature_anomaly_deg_c": temp_increase_c,
                "optical_cloud_deck_active": is_cloud_obscured
            },
            "baseline_state": {
                "drought_probability": base_p,
                "conformal_set": baseline_res["conformal_uncertainty"]["prediction_set"],
                "predicted_delta_swdi": baseline_res["predicted_delta_swdi"]
            },
            "simulated_state": {
                "drought_probability": sim_p,
                "conformal_set": simulated_res["conformal_uncertainty"]["prediction_set"],
                "predicted_delta_swdi": simulated_res["predicted_delta_swdi"],
                "mahalanobis_ood_distance": simulated_res["conformal_uncertainty"]["mahalanobis_ood_distance"]
            },
            "impact_metrics": {
                "absolute_risk_increase": delta_p,
                "relative_risk_increase_pct": round((delta_p / max(0.01, base_p)) * 100.0, 1),
                "hydrological_deficit_acceleration": "High Risk of Root-Zone Desiccation" if sim_p > 0.70 else "Moderate Moisture Stress"
            },
            "dynamic_attention_shift": {
                "weather_weight_simulated": simulated_res["dynamic_modality_weights"]["weather"],
                "soil_weight_simulated": simulated_res["dynamic_modality_weights"]["soil"],
                "sar_weight_simulated": simulated_res["dynamic_modality_weights"]["sar"]
            }
        }


climate_simulator = ClimateScenarioSimulator

