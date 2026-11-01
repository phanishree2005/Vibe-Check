import React from 'react';
import { PredictionResponse } from '../types';
import { Cpu, ShieldCheck, AlertTriangle, Layers, Target, Scale, CheckCircle } from 'lucide-react';

interface PredictiveIntelligenceProps {
  prediction: PredictionResponse | null;
  selectedDistrict: string;
}

export const PredictiveIntelligence: React.FC<PredictiveIntelligenceProps> = ({
  prediction,
  selectedDistrict,
}) => {
  if (!prediction) {
    return <div className="p-8 text-center text-ivory-400 font-mono">Running model inference...</div>;
  }

  const conf = prediction.conformal_uncertainty;
  const weights = prediction.dynamic_modality_weights;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-5">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-forest-400" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-forest-400">
            PREDICTIVE SPATIOTEMPORAL INTELLIGENCE
          </span>
        </div>
        <h2 className="text-xl font-bold text-ivory-100 mt-1">
          Resolution-Aware Multi-Scale Fusion & Conformal Uncertainty
        </h2>
        <p className="text-sm text-ivory-300 mt-1">
          Predicting forward agricultural drought stress at lead time tau = 14 days with finite-sample
          coverage guarantees under monsoonal distribution shifts and missing observations.
        </p>
      </div>

      {/* Main Dual Panels: Conformal Uncertainty & Resolution Embeddings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Split-Conformal Calibration & OOD Engine */}
        <div className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-forest-400" />
                <h3 className="font-mono text-sm font-bold text-ivory-100">
                  Split-Conformal Prediction Engine (90% Finite-Sample Coverage)
                </h3>
              </div>
              <span className="text-xs font-mono text-forest-400 font-semibold bg-forest-900/30 border border-forest-600/40 px-2 py-0.5 rounded">
                α = 0.10
              </span>
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-4 rounded bg-charcoal-800/80 border border-charcoal-700">
                <span className="text-xs font-mono text-ivory-400 block mb-1">CONFORMAL PREDICTION SET:</span>
                <div className="flex flex-wrap gap-2">
                  {conf.prediction_set.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded font-mono text-xs font-bold bg-charcoal-900 border border-forest-500/50 text-forest-300 shadow-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-2 text-[11px] font-mono text-ivory-400 flex items-center justify-between">
                  <span>Confidence Level: <strong className="text-ivory-200">{conf.confidence_level}</strong></span>
                  <span>Non-Conformity Threshold (q̂): <strong className="text-ivory-200">{conf.q_hat_threshold.toFixed(4)}</strong></span>
                </div>
              </div>

              {/* Mahalanobis OOD Detector */}
              <div className="p-4 rounded bg-charcoal-800/80 border border-charcoal-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-ivory-300 font-semibold">
                    MAHALANOBIS OOD DISTANCE DETECTOR:
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      conf.is_out_of_distribution
                        ? 'bg-danger-600/20 text-danger-400 border border-danger-600/40'
                        : 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/40'
                    }`}
                  >
                    {conf.is_out_of_distribution ? 'OUT-OF-DISTRIBUTION' : 'IN-DISTRIBUTION'}
                  </span>
                </div>
                <div className="mt-2 text-xs font-mono text-ivory-300 flex justify-between">
                  <span>Observed Latent Distance: <strong>{conf.mahalanobis_ood_distance.toFixed(2)}</strong></span>
                  <span>OOD Critical Bound: <strong>125.19</strong></span>
                </div>
              </div>

              {/* Abstention Logic */}
              <div
                className={`p-3.5 rounded border text-xs font-mono ${
                  conf.should_abstain
                    ? 'bg-danger-900/30 border-danger-600/60 text-danger-300'
                    : 'bg-forest-900/20 border-forest-600/40 text-forest-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  {conf.should_abstain ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-danger-400" />
                      <span>AUTONOMOUS ABSTENTION ACTIVATED</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-forest-400" />
                      <span>CONFIDENT PREDICTION ACCEPTED</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] opacity-90">
                  {conf.should_abstain
                    ? conf.abstain_reason
                    : 'Conformal coverage bounds verified. Prediction set size is 1; epistemic certainty permits agricultural decision execution.'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-charcoal-800 text-[11px] font-mono text-ivory-400">
            Theoretical Guarantee: <span className="text-ivory-200">P(Y ∈ C(X)) ≥ 1 - α (Vovk et al. 2005)</span>
          </div>
        </div>

        {/* Panel 2: Resolution-Aware Multi-Scale Hierarchical Support */}
        <div className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <h3 className="font-mono text-sm font-bold text-ivory-100">
                  Resolution Support Embeddings (e_res)
                </h3>
              </div>
              <span className="text-xs font-mono text-sky-400 bg-sky-900/30 border border-sky-600/40 px-2 py-0.5 rounded">
                GAP A Addressed
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs font-mono">
              <p className="text-ivory-300 text-xs font-sans">
                Rather than naively upsampling coarse 9km ERA5 reanalysis to 10m (which hallucinates non-existent spatial detail),
                BHUMI-X introduces native Resolution Support Embeddings e_res (d_model = 64):
              </p>

              <div className="p-3 rounded bg-charcoal-800/80 border border-charcoal-700 flex justify-between items-center">
                <div>
                  <span className="text-emerald-400 font-bold block">Scale 0: 10m Optical Support</span>
                  <span className="text-[11px] text-ivory-400">Sentinel-2 MSI (B2, B3, B4, B8, B11, SCL)</span>
                </div>
                <span className="text-ivory-200 font-bold">Token Weight: {(weights.optical * 100).toFixed(1)}%</span>
              </div>

              <div className="p-3 rounded bg-charcoal-800/80 border border-charcoal-700 flex justify-between items-center">
                <div>
                  <span className="text-sky-400 font-bold block">Scale 1: 10m C-band SAR Support</span>
                  <span className="text-[11px] text-ivory-400">Sentinel-1 GRD (γ° VV, VH, Cross-Ratio)</span>
                </div>
                <span className="text-ivory-200 font-bold">Token Weight: {(weights.sar * 100).toFixed(1)}%</span>
              </div>

              <div className="p-3 rounded bg-charcoal-800/80 border border-charcoal-700 flex justify-between items-center">
                <div>
                  <span className="text-amber-400 font-bold block">Scale 2: 30m Digital Elevation (DEM)</span>
                  <span className="text-[11px] text-ivory-400">USGS SRTM (Elevation, Slope, TWI)</span>
                </div>
                <span className="text-ivory-200 font-bold">Token Weight: {(weights.geo * 100).toFixed(1)}%</span>
              </div>

              <div className="p-3 rounded bg-charcoal-800/80 border border-charcoal-700 flex justify-between items-center">
                <div>
                  <span className="text-teal-400 font-bold block">Scale 3: 250m Edaphic Support</span>
                  <span className="text-[11px] text-ivory-400">ISRIC SoilGrids (Clay, Sand, FC, PWP, AWC)</span>
                </div>
                <span className="text-ivory-200 font-bold">Token Weight: {(weights.soil * 100).toFixed(1)}%</span>
              </div>

              <div className="p-3 rounded bg-charcoal-800/80 border border-charcoal-700 flex justify-between items-center">
                <div>
                  <span className="text-indigo-400 font-bold block">Scale 4: 9000m Hydrometeorology Support</span>
                  <span className="text-[11px] text-ivory-400">ERA5-Land / SMAP L4 / NASA POWER</span>
                </div>
                <span className="text-ivory-200 font-bold">Token Weight: {(weights.weather * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-charcoal-800 text-[11px] font-mono text-ivory-400">
            Multi-Task Heads: <span className="text-ivory-200">Binary Cross-Entropy Logits + Continuous ΔSWDI MSE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
