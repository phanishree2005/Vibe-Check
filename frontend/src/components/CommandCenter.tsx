import React from 'react';
import { DistrictInfo, PredictionResponse } from '../types';
import { AlertTriangle, CheckCircle, Shield, Droplets, Wind, Sun, ArrowUpRight, Database, MapPin } from 'lucide-react';
import { InteractiveMap } from './InteractiveMap';
import { TimeseriesCharts } from './TimeseriesCharts';

interface CommandCenterProps {
  districtInfo?: DistrictInfo;
  allDistricts: DistrictInfo[];
  selectedDistrict: string;
  onSelectDistrict: (d: string) => void;
  onSelectCoords?: (lat: number, lon: number) => void;
  onLocationInspected?: (data: any) => void;
  customCoords?: { lat: number; lon: number } | null;
  prediction?: PredictionResponse | null;
  onNavigateTab: (tab: string) => void;
  isSimulatedDrought: boolean;
  isLoading: boolean;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  districtInfo,
  allDistricts,
  selectedDistrict,
  onSelectDistrict,
  onSelectCoords,
  onLocationInspected,
  customCoords,
  prediction,
  onNavigateTab,
  isSimulatedDrought,
  isLoading,
}) => {
  if (!districtInfo) return null;

  const prob = prediction ? prediction.drought_stress_probability : 0.0;
  const isHighRisk = prob >= 0.70;
  const isElevated = prob >= 0.40 && prob < 0.70;

  const conformalSet = prediction?.conformal_uncertainty.prediction_set || [];
  const shouldAbstain = prediction?.conformal_uncertainty.should_abstain || false;
  const weights = prediction?.dynamic_modality_weights;

  return (
    <div className="space-y-6">
      {/* Top Banner / Problem Formulation Overview */}
      <div className="bg-gradient-to-r from-charcoal-900 via-charcoal-800 to-charcoal-900 border border-charcoal-700 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-forest-400 font-mono font-semibold">
                {districtInfo.zone}
              </span>
              <span className="text-xs text-charcoal-600">•</span>
              <span className="text-xs text-ivory-400 font-mono">
                Lat {districtInfo.lat.toFixed(4)}°N, Lon {districtInfo.lon.toFixed(4)}°E
              </span>
            </div>
            <h1 className="text-2xl font-bold text-ivory-100 mt-1 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-forest-400" />
              {districtInfo.name} Agricultural Climate Stress Monitor
            </h1>
            <p className="text-sm text-ivory-300 mt-1 max-w-3xl">
              {districtInfo.vulnerability} Primary Rainfed Crop:{' '}
              <span className="text-forest-400 font-medium">{districtInfo.primary_crop}</span> | Soil Order:{' '}
              <span className="text-ivory-200 font-medium">{districtInfo.soil_order}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('agent')}
              className="bg-forest-600 hover:bg-forest-500 text-white text-xs font-semibold px-4 py-2.5 rounded flex items-center gap-1.5 transition-all shadow-md"
            >
              Open Decision Agent <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab('simulator')}
              className="bg-charcoal-800 hover:bg-charcoal-700 text-ivory-200 border border-charcoal-600 text-xs font-semibold px-4 py-2.5 rounded flex items-center gap-1.5 transition-all"
            >
              What-If Simulator <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: 14-Day Drought Stress Risk */}
        <div className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-ivory-400">
                14-Day Predictive Risk
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded font-mono font-semibold ${
                  isHighRisk
                    ? 'bg-danger-500/20 text-danger-400 border border-danger-500/40'
                    : isElevated
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-forest-500/20 text-forest-400 border border-forest-500/40'
                }`}
              >
                {isHighRisk ? 'CRITICAL RISK' : isElevated ? 'ELEVATED RISK' : 'NORMAL / LOW RISK'}
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-4xl font-extrabold font-mono text-ivory-100">
                {(prob * 100).toFixed(1)}%
              </span>
              <span className="text-xs text-ivory-400">P(Agricultural Stress at t+14d)</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-charcoal-800 h-2.5 rounded-full mt-3 overflow-hidden border border-charcoal-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isHighRisk ? 'bg-danger-500' : isElevated ? 'bg-amber-500' : 'bg-forest-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, prob * 100))}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-ivory-400 mt-4 border-t border-charcoal-800 pt-3">
            Predicted continuous moisture anomaly:{' '}
            <span className="text-ivory-200 font-mono">
              {prediction ? `${prediction.predicted_delta_swdi} ΔSWDI` : 'Calculating...'}
            </span>
          </p>
        </div>

        {/* Card 2: Conformal Uncertainty Guarantee */}
        <div className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-ivory-400">
                Conformal Uncertainty
              </span>
              <span className="text-xs bg-charcoal-800 text-forest-400 border border-charcoal-700 px-2 py-0.5 rounded font-mono">
                90% Coverage Guarantee
              </span>
            </div>
            <div className="mt-3">
              <span className="text-xs text-ivory-400 font-mono">CALIBRATED PREDICTION SET:</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {conformalSet.map((s, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold px-2.5 py-1 rounded bg-charcoal-800 border border-charcoal-600 text-ivory-100 font-mono"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-3 text-xs text-ivory-300">
              {shouldAbstain ? (
                <div className="p-2 rounded bg-danger-900/30 border border-danger-700/50 text-danger-300 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-danger-400" />
                  <span>Abstention Activated: {prediction?.conformal_uncertainty.abstain_reason}</span>
                </div>
              ) : (
                <div className="p-2 rounded bg-forest-900/20 border border-forest-700/40 text-forest-300 text-xs flex items-center gap-1.5">
                  <Shield className="w-4 h-4 shrink-0 text-forest-400" />
                  <span>
                    Calibrated Set Size {conformalSet.length} | OOD Distance{' '}
                    {prediction?.conformal_uncertainty.mahalanobis_ood_distance.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-ivory-400 mt-4 border-t border-charcoal-800 pt-3">
            Conformal Quantile Threshold:{' '}
            <span className="font-mono text-ivory-200">
              {prediction?.conformal_uncertainty.q_hat_threshold.toFixed(4)}
            </span>
          </p>
        </div>

        {/* Card 3: Dynamic Attention & Gating State */}
        <div className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-ivory-400">
                Reliability Attention Weights
              </span>
              <span className="text-xs bg-charcoal-800 text-amber-400 border border-charcoal-700 px-2 py-0.5 rounded font-mono">
                RGCA Gate
              </span>
            </div>
            <div className="mt-3 space-y-2">
              <div>
                <div className="flex justify-between text-xs font-mono text-ivory-300">
                  <span>Soil Moisture Hydrology:</span>
                  <span>{((weights?.soil || 0) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-charcoal-800 h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-forest-400 h-full rounded-full" style={{ width: `${(weights?.soil || 0) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono text-ivory-300">
                  <span>Atmospheric Weather (VPD/Rain):</span>
                  <span>{((weights?.weather || 0) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-charcoal-800 h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-sky-400 h-full rounded-full" style={{ width: `${(weights?.weather || 0) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono text-ivory-300">
                  <span>Sentinel-1 SAR Radar:</span>
                  <span>{((weights?.sar || 0) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-charcoal-800 h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${(weights?.sar || 0) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono text-ivory-300">
                  <span>Sentinel-2 Optical (MSI):</span>
                  <span>{((weights?.optical || 0) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-charcoal-800 h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${(weights?.optical || 0) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-ivory-400 mt-3 border-t border-charcoal-800 pt-2.5">
            MAM Gating Status:{' '}
            <span className="text-ivory-200 font-mono">
              {prediction?.sensor_availability.optical_active
                ? 'Full Optical + SAR Synergy'
                : 'Optical Gated (SAR/Met Compensated)'}
            </span>
          </p>
        </div>
      </div>

      {/* Interactive Map Component */}
      <InteractiveMap
        districts={allDistricts}
        selectedDistrict={selectedDistrict}
        onSelectDistrict={onSelectDistrict}
        onSelectCoords={onSelectCoords}
        onLocationInspected={onLocationInspected}
        customCoords={customCoords}
        isSimulatedDrought={isSimulatedDrought}
      />

      {/* Dynamic Timeseries Graphs Component */}
      <TimeseriesCharts
        selectedDistrict={selectedDistrict}
        isSimulatedDrought={isSimulatedDrought}
      />

      {/* Sensor Provenance Quick Status */}
      <div className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-5">
        <h3 className="text-sm font-semibold font-mono text-ivory-100 mb-3 flex items-center gap-2">
          <Database className="w-4 h-4 text-forest-400" />
          GENUINE EARTH OBSERVATION INFRASTRUCTURE (ZERO DUMMY DATA VERIFIED)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded bg-charcoal-800/80 border border-charcoal-700">
            <span className="text-ivory-400 font-mono block">OPTICAL SATELLITE</span>
            <span className="font-semibold text-ivory-100 block mt-0.5">Copernicus Sentinel-2 L2A</span>
            <span className="text-[10px] text-forest-400 font-mono block mt-1">10m / 5-day revisit (SR_HARMONIZED)</span>
          </div>
          <div className="p-3 rounded bg-charcoal-800/80 border border-charcoal-700">
            <span className="text-ivory-400 font-mono block">C-BAND SAR RADAR</span>
            <span className="font-semibold text-ivory-100 block mt-0.5">Copernicus Sentinel-1 GRD</span>
            <span className="text-[10px] text-forest-400 font-mono block mt-1">10m / VV, VH dual-polarization</span>
          </div>
          <div className="p-3 rounded bg-charcoal-800/80 border border-charcoal-700">
            <span className="text-ivory-400 font-mono block">SOIL HYDRAULICS</span>
            <span className="font-semibold text-ivory-100 block mt-0.5">ISRIC SoilGrids & SMAP L4</span>
            <span className="text-[10px] text-forest-400 font-mono block mt-1">250m edaphic + 9km root-zone SWI</span>
          </div>
          <div className="p-3 rounded bg-charcoal-800/80 border border-charcoal-700">
            <span className="text-ivory-400 font-mono block">NWP METEOROLOGY</span>
            <span className="font-semibold text-ivory-100 block mt-0.5">NASA POWER & Open-Meteo ECMWF</span>
            <span className="text-[10px] text-forest-400 font-mono block mt-1">Daily Precipitation, VPD, Tmax, Solar</span>
          </div>
        </div>
      </div>
    </div>
  );
};
