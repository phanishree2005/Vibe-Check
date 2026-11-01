export interface DistrictInfo {
  id: string;
  name: string;
  zone: string;
  lat: number;
  lon: number;
  soil_order: string;
  primary_crop: string;
  mean_annual_rainfall_mm?: number;
  vulnerability: string;
  state?: string;
  clay_fraction?: number;
  rooting_depth_m?: number;
}

export interface SatelliteMetrics {
  sentinel_2_optical: {
    satellite: string;
    modality: string;
    acquisition_date: string;
    spatial_resolution_m: number;
    cloud_coverage_pct: number;
    scene_classification: number;
    is_cloud_obscured: boolean;
    reflectance: Record<string, number>;
    indices: {
      ndvi?: number | null;
      ndmi?: number | null;
      evi?: number | null;
      ndre?: number | null;
      masked_reason?: string;
    };
  };
  sentinel_1_sar: {
    satellite: string;
    modality: string;
    acquisition_date: string;
    spatial_resolution_m: number;
    orbit_pass: string;
    incidence_angle_deg: number;
    is_cloud_obscured: boolean;
    metrics: {
      vv_db: number;
      vh_db: number;
      cross_ratio_db: number;
      rvi: number;
      ndpi: number;
    };
  };
  cloud_blindout_active: boolean;
}

export interface PredictionResponse {
  target: string;
  district: string;
  crop: string;
  drought_stress_probability: number;
  predicted_delta_swdi: number;
  conformal_uncertainty: {
    calibrated_prob: number;
    confidence_level: string;
    q_hat_threshold: number;
    prediction_set: string[];
    set_size: number;
    mahalanobis_ood_distance: number;
    is_out_of_distribution: boolean;
    should_abstain: boolean;
    abstain_reason?: string | null;
  };
  dynamic_modality_weights: {
    optical: number;
    sar: number;
    weather: number;
    soil: number;
    geo: number;
  };
  explainability: {
    predicted_drought_risk: number;
    risk_category: string;
    primary_driver: string;
    feature_attributions: Array<{
      feature: string;
      modality: string;
      observed_value: string;
      reference_baseline: string;
      contribution_score: number;
      direction: string;
      physical_mechanism: string;
    }>;
    modality_breakdown_pct: Record<string, number>;
    scientific_disclaimer: string;
  };
  sensor_availability: {
    optical_active: boolean;
    sar_active: boolean;
    weather_active: boolean;
    soil_active: boolean;
  };
}

export interface AgentConsultationResponse {
  agent_status: string;
  consultation_timestamp: string;
  district: string;
  crop: string;
  detected_stress_level: string;
  predicted_drought_probability?: number;
  conformal_confidence?: string;
  prediction_set?: string[];
  recommendation_summary?: string;
  abstain_reason?: string;
  guardrail_triggered?: boolean;
  recommended_actions: Array<{
    action: string;
    objective?: string;
    rate?: string;
    depth?: string;
    timing?: string;
    source: string;
    requires_human_approval?: boolean;
  }>;
  audit_trail: Array<{
    step: number;
    action: string;
    [key: string]: any;
  }>;
}

export interface SimulationResult {
  simulation_id: string;
  scenario_type: string;
  disclaimer: string;
  district: string;
  perturbations_applied: {
    rainfall_change_pct: number;
    temperature_anomaly_deg_c: number;
    optical_cloud_deck_active: boolean;
  };
  baseline_state: {
    drought_probability: number;
    conformal_set: string[];
    predicted_delta_swdi: number;
  };
  simulated_state: {
    drought_probability: number;
    conformal_set: string[];
    predicted_delta_swdi: number;
    mahalanobis_ood_distance: number;
  };
  impact_metrics: {
    absolute_risk_increase: number;
    relative_risk_increase_pct: number;
    hydrological_deficit_acceleration: string;
  };
  dynamic_attention_shift: {
    weather_weight_simulated: number;
    soil_weight_simulated: number;
    sar_weight_simulated: number;
  };
}

