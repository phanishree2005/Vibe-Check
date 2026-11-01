import React, { useState } from 'react';
import { runSimulation } from '../services/api';
import { SimulationResult } from '../types';
import { Sliders, Play, AlertCircle, ArrowRight, Zap, RefreshCw } from 'lucide-react';

interface ScenarioSimulatorProps {
  selectedDistrict: string;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({ selectedDistrict }) => {
  const [rainfallDeficit, setRainfallDeficit] = useState<number>(-40);
  const [tempSurge, setTempSurge] = useState<number>(2.5);
  const [cloudCover, setCloudCover] = useState<boolean>(true);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleSimulate = async () => {
    setIsRunning(true);
    try {
      const res = await runSimulation(selectedDistrict, rainfallDeficit, tempSurge, cloudCover);
      setSimResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-forest-400" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-forest-400">
            WHAT-IF CLIMATE SCENARIO SIMULATOR
          </span>
        </div>
        <h2 className="text-xl font-bold text-ivory-100 mt-1">
          Counterfactual Sensitivity & Climate Stress Testing
        </h2>
        <p className="text-sm text-ivory-300 mt-1">
          Applying controlled hypothetical perturbations to authentic baseline conditions in {selectedDistrict}.
          Evaluates non-linear compound extreme stress thresholds and cross-modal attention redistribution.
        </p>
      </div>

      {/* Simulator Controls & Simulation Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-5 space-y-5">
          <h3 className="font-mono text-sm font-bold text-ivory-100 border-b border-charcoal-800 pb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            SCENARIO PERTURBATION CONTROLS
          </h3>

          {/* Slider 1: Rainfall Deficit */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-ivory-300">Precipitation Deficit:</span>
              <span className="text-danger-400 font-bold">{rainfallDeficit}%</span>
            </div>
            <input
              type="range"
              min="-80"
              max="0"
              step="5"
              value={rainfallDeficit}
              onChange={(e) => setRainfallDeficit(parseFloat(e.target.value))}
              className="w-full accent-danger-500 cursor-pointer"
            />
            <span className="text-[10px] text-ivory-400 block mt-0.5">
              Simulates severe monsoon failure or extended rain break
            </span>
          </div>

          {/* Slider 2: Temperature Anomaly */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-ivory-300">Temperature Surge:</span>
              <span className="text-amber-400 font-bold">+{tempSurge.toFixed(1)}°C</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.5"
              value={tempSurge}
              onChange={(e) => setTempSurge(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-[10px] text-ivory-400 block mt-0.5">
              Elevates atmospheric Vapour Pressure Deficit (VPD)
            </span>
          </div>

          {/* Toggle: Kharif Cloud Cover */}
          <div className="p-3 rounded bg-charcoal-800 border border-charcoal-700">
            <label className="flex items-center justify-between text-xs font-mono text-ivory-200 cursor-pointer">
              <span>Monsoon Cloud Deck Active (85%):</span>
              <input
                type="checkbox"
                checked={cloudCover}
                onChange={(e) => setCloudCover(e.target.checked)}
                className="w-4 h-4 accent-forest-500 cursor-pointer"
              />
            </label>
            <span className="text-[10px] text-ivory-400 block mt-1">
              Simulates optical sensor blindout during peak monsoon
            </span>
          </div>

          <button
            onClick={handleSimulate}
            disabled={isRunning}
            className="w-full bg-forest-600 hover:bg-forest-500 disabled:opacity-50 text-white text-xs font-mono font-bold py-2.5 rounded flex items-center justify-center gap-2 transition-all shadow-md"
          >
            {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Running Simulation...' : 'Execute Counterfactual Simulation'}
          </button>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-2">
          {simResult ? (
            <div className="space-y-5">
              {/* Disclaimer Banner */}
              <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-600/40 text-amber-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <span className="font-bold font-mono block">EXPLICIT SCIENTIFIC SIMULATION TAG:</span>
                  <span>{simResult.disclaimer}</span>
                </div>
              </div>

              {/* Baseline vs Simulated Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Baseline Card */}
                <div className="p-5 rounded-lg bg-charcoal-900 border border-charcoal-700">
                  <span className="text-xs font-mono text-ivory-400 block mb-1">AUTHENTIC BASELINE STATE</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold font-mono text-ivory-200">
                      {(simResult.baseline_state.drought_probability * 100).toFixed(1)}%
                    </span>
                    <span className="text-xs text-ivory-400">Drought Risk</span>
                  </div>
                  <div className="mt-3 text-xs font-mono text-ivory-300 space-y-1">
                    <div>Predicted ΔSWDI: <strong>{simResult.baseline_state.predicted_delta_swdi}</strong></div>
                    <div>Conformal Set: <strong>{simResult.baseline_state.conformal_set.join(', ')}</strong></div>
                  </div>
                </div>

                {/* Simulated Card */}
                <div className="p-5 rounded-lg bg-charcoal-900 border border-danger-700/60 shadow-lg shadow-danger-950/40">
                  <span className="text-xs font-mono text-danger-400 font-bold block mb-1">
                    SIMULATED COUNTERFACTUAL STATE
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold font-mono text-danger-400">
                      {(simResult.simulated_state.drought_probability * 100).toFixed(1)}%
                    </span>
                    <span className="text-xs text-danger-300 font-semibold">
                      (+{(simResult.impact_metrics.absolute_risk_increase * 100).toFixed(1)}% Risk Shift)
                    </span>
                  </div>
                  <div className="mt-3 text-xs font-mono text-ivory-300 space-y-1">
                    <div>Predicted ΔSWDI: <strong>{simResult.simulated_state.predicted_delta_swdi}</strong></div>
                    <div>Conformal Set: <strong className="text-danger-300">{simResult.simulated_state.conformal_set.join(', ')}</strong></div>
                  </div>
                </div>
              </div>

              {/* Dynamic Attention Shift under Stress */}
              <div className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-5">
                <h4 className="font-mono text-xs font-bold text-ivory-200 uppercase tracking-wider mb-3">
                  DYNAMIC MULTI-SCALE ATTENTION REDISTRIBUTION:
                </h4>
                <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 rounded bg-charcoal-800 border border-charcoal-700">
                    <span className="text-ivory-400 block text-[10px]">ATMOSPHERIC WEATHER</span>
                    <span className="text-base font-bold text-sky-400">
                      {((simResult.dynamic_attention_shift.weather_weight_simulated || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-3 rounded bg-charcoal-800 border border-charcoal-700">
                    <span className="text-ivory-400 block text-[10px]">SOIL HYDROLOGY</span>
                    <span className="text-base font-bold text-forest-400">
                      {((simResult.dynamic_attention_shift.soil_weight_simulated || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-3 rounded bg-charcoal-800 border border-charcoal-700">
                    <span className="text-ivory-400 block text-[10px]">ACTIVE SAR RADAR</span>
                    <span className="text-base font-bold text-amber-400">
                      {((simResult.dynamic_attention_shift.sar_weight_simulated || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-charcoal-900/50 border border-dashed border-charcoal-700 rounded-lg text-center text-ivory-400">
              <Sliders className="w-10 h-10 text-charcoal-600 mb-2" />
              <p className="text-sm font-mono">Adjust scenario sliders and click "Execute Counterfactual Simulation"</p>
              <p className="text-xs text-charcoal-500 mt-1">Evaluates compound dry-spell and heat-stress sensitivity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

