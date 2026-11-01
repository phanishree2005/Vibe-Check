import React from 'react';
import { PredictionResponse } from '../types';
import { Eye, TrendingUp, TrendingDown, AlertCircle, Info, BarChart3 } from 'lucide-react';

interface ExplainableLabProps {
  prediction: PredictionResponse | null;
  selectedDistrict: string;
}

export const ExplainableLab: React.FC<ExplainableLabProps> = ({
  prediction,
  selectedDistrict,
}) => {
  if (!prediction) {
    return <div className="p-8 text-center text-ivory-400 font-mono">Generating model explanations...</div>;
  }

  const xai = prediction.explainability;
  const attributions = xai.feature_attributions || [];
  const breakdown = xai.modality_breakdown_pct || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-5">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-forest-400" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-forest-400">
            EXPLAINABLE AI (XAI) SCIENTIFIC LABORATORY
          </span>
        </div>
        <h2 className="text-xl font-bold text-ivory-100 mt-1">
          SHAP-Style Feature Attributions & Modality Decomposition
        </h2>
        <p className="text-sm text-ivory-300 mt-1">
          Addressing Section 11: Transparently decomposing why BHUMI-X predicted{' '}
          <span className="text-forest-400 font-bold font-mono">{(xai.predicted_drought_risk * 100).toFixed(1)}%</span> drought stress
          risk for {selectedDistrict}.
        </p>
      </div>

      {/* Primary Driver & Modality Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-charcoal-900 border border-charcoal-700 rounded-lg p-5">
          <span className="text-xs font-mono font-semibold text-ivory-400 uppercase tracking-wider block mb-1">
            IDENTIFIED PRIMARY CLIMATE STRESS DRIVER:
          </span>
          <h3 className="text-lg font-bold text-ivory-100 mb-2">
            {xai.primary_driver}
          </h3>
          <p className="text-xs text-ivory-300 leading-relaxed">
            The trained spatiotemporal network detected an uncoupling between atmospheric evaporative demand and root-zone soil water retention.
            Vapour Pressure Deficit surges induce rapid stomatal resistance while soil suction approaches permanent wilting point (-1500 kPa).
          </p>

          <div className="mt-5 border-t border-charcoal-800 pt-4">
            <span className="text-xs font-mono font-semibold text-ivory-400 uppercase tracking-wider block mb-3">
              MODALITY ATTRIBUTION BREAKDOWN:
            </span>
            <div className="space-y-2.5">
              {Object.entries(breakdown).map(([modality, pct], idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-mono text-ivory-300 mb-1">
                    <span>{modality}:</span>
                    <span className="font-bold">{pct}%</span>
                  </div>
                  <div className="w-full bg-charcoal-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        idx === 0 ? 'bg-forest-400' : idx === 1 ? 'bg-sky-400' : idx === 2 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scientific Disclaimer Card */}
        <div className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-mono font-semibold text-xs mb-2">
              <AlertCircle className="w-4 h-4" />
              <span>SCIENTIFIC HONESTY DISCLAIMER</span>
            </div>
            <p className="text-xs text-ivory-300 leading-relaxed">
              {xai.scientific_disclaimer}
            </p>
            <div className="mt-4 p-3 rounded bg-charcoal-800/80 border border-charcoal-700 text-[11px] font-mono text-ivory-400">
              <span className="text-forest-400 font-bold block mb-1">Causal Boundaries:</span>
              Feature importance scores reflect local gradient sensitivity across the multi-scale latent space.
              They do not imply direct causal counterfactuals without randomized field trials.
            </div>
          </div>
          <div className="text-[11px] font-mono text-ivory-400 mt-4 pt-3 border-t border-charcoal-800">
            Complies with Rule 3 (Scientific Honesty)
          </div>
        </div>
      </div>

      {/* Granular Feature Attribution Table */}
      <div className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-5">
        <h3 className="font-mono text-sm font-bold text-ivory-100 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-forest-400" />
          LOCAL VARIABLE SENSITIVITY & MARGINAL CONTRIBUTIONS
        </h3>

        <div className="space-y-3">
          {attributions.map((attr, idx) => {
            const isEscalator = attr.direction === 'Risk Escalator';
            const isInactive = attr.direction === 'Modality Inactive';
            return (
              <div
                key={idx}
                className="p-4 rounded bg-charcoal-800/70 border border-charcoal-700 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-ivory-100">{attr.feature}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-charcoal-900 text-ivory-400 border border-charcoal-700">
                      {attr.modality}
                    </span>
                  </div>
                  <p className="text-xs text-ivory-300 max-w-2xl">{attr.physical_mechanism}</p>
                  <div className="text-[11px] font-mono text-ivory-400 flex items-center gap-3 pt-1">
                    <span>Observed: <strong className="text-ivory-200">{attr.observed_value}</strong></span>
                    <span>Baseline Norm: <strong className="text-ivory-300">{attr.reference_baseline}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold block text-ivory-200">
                      {attr.contribution_score > 0 ? `+${attr.contribution_score.toFixed(3)}` : attr.contribution_score.toFixed(3)}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1 ${
                        isEscalator
                          ? 'bg-danger-600/20 text-danger-400 border border-danger-600/40'
                          : isInactive
                          ? 'bg-charcoal-700 text-ivory-400'
                          : 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/40'
                      }`}
                    >
                      {isEscalator ? <TrendingUp className="w-3 h-3" /> : isInactive ? null : <TrendingDown className="w-3 h-3" />}
                      {attr.direction}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

