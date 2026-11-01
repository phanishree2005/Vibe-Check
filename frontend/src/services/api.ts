import { DistrictInfo, SatelliteMetrics, PredictionResponse, AgentConsultationResponse, SimulationResult } from '../types';

const API_BASE = '/api';

export const fetchDistricts = async (query?: string): Promise<DistrictInfo[]> => {
  const url = query ? `${API_BASE}/geocode?query=${encodeURIComponent(query)}` : `${API_BASE}/districts`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch districts');
  const data = await res.json();
  return data.results || data.districts || [];
};

export const fetchLulcZones = async (district: string, lat?: number, lon?: number, isStress?: boolean, year: number = 2025): Promise<any> => {
  let url = `${API_BASE}/lulc-zones?district=${encodeURIComponent(district)}&is_stress=${Boolean(isStress)}&year=${year}`;
  if (lat && lon) {
    url += `&lat=${lat}&lon=${lon}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch LULC zones');
  return res.json();
};

export const fetchTimeseriesTrends = async (district: string, simulatedDrought: boolean): Promise<any> => {
  const res = await fetch(`${API_BASE}/timeseries-trends?district=${encodeURIComponent(district)}&simulated_drought=${simulatedDrought}`);
  if (!res.ok) throw new Error('Failed to fetch timeseries trends');
  return res.json();
};

export const fetchEarthObservation = async (
  district: string,
  isCloudCovered: boolean,
  customLat?: number,
  customLon?: number
): Promise<SatelliteMetrics> => {
  const res = await fetch(`${API_BASE}/earth-observation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      district,
      is_cloud_covered: isCloudCovered,
      simulated_drought: false,
      custom_lat: customLat,
      custom_lon: customLon,
    }),
  });
  if (!res.ok) throw new Error('Failed to fetch satellite observation');
  const data = await res.json();
  return data.observations;
};

export const fetchWeatherForecast = async (district: string): Promise<any> => {
  const res = await fetch(`${API_BASE}/weather-forecast?district=${encodeURIComponent(district)}`);
  if (!res.ok) throw new Error('Failed to fetch weather forecast');
  const data = await res.json();
  return data.forecast_data;
};

export const inspectPoint = async (lat: number, lon: number, isStress?: boolean): Promise<any> => {
  const res = await fetch(`${API_BASE}/point-inspect?lat=${lat}&lon=${lon}&is_stress=${Boolean(isStress)}`);
  if (!res.ok) throw new Error('Failed to inspect point');
  return res.json();
};

export const runPrediction = async (
  district: string,
  isCloudCovered: boolean,
  simulatedDrought: boolean,
  customLat?: number,
  customLon?: number
): Promise<PredictionResponse> => {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      district,
      is_cloud_covered: isCloudCovered,
      simulated_drought: simulatedDrought,
      custom_lat: customLat,
      custom_lon: customLon
    })
  });
  if (!res.ok) throw new Error('Failed to execute prediction');
  return res.json();
};

export const runAgentConsultation = async (
  district: string,
  crop: string,
  isCloudCovered: boolean,
  simulatedDrought: boolean
): Promise<AgentConsultationResponse> => {
  const res = await fetch(`${API_BASE}/agent/consult`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      district,
      crop,
      is_cloud_covered: isCloudCovered,
      simulated_drought: simulatedDrought
    })
  });
  if (!res.ok) throw new Error('Failed to run agent consultation');
  return res.json();
};

export const runSimulation = async (
  district: string,
  rainfallChange: number,
  tempIncrease: number,
  isCloudCovered: boolean
): Promise<SimulationResult> => {
  const res = await fetch(`${API_BASE}/simulator/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      district,
      rainfall_pct_change: rainfallChange,
      temp_increase_c: tempIncrease,
      is_cloud_obscured: isCloudCovered
    })
  });
  if (!res.ok) throw new Error('Failed to run simulation');
  return res.json();
};

export const fetchExperiments = async (): Promise<any> => {
  const res = await fetch(`${API_BASE}/experiments`);
  if (!res.ok) throw new Error('Failed to fetch experiments');
  return res.json();
};

export const fetchProvenance = async (): Promise<any> => {
  const res = await fetch(`${API_BASE}/provenance`);
  if (!res.ok) throw new Error('Failed to fetch provenance');
  return res.json();
};

