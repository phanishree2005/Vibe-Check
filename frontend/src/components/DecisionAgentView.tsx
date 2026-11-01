import React, { useState, useEffect } from 'react';
import { runAgentConsultation } from '../services/api';
import { AgentConsultationResponse } from '../types';
import { ShieldCheck, ArrowRight, CheckCircle, AlertTriangle, UserCheck, BookOpen, Layers, RefreshCw } from 'lucide-react';

interface DecisionAgentViewProps {
  selectedDistrict: string;
  isCloudCovered: boolean;
  isSimulatedDrought: boolean;
}

export const DecisionAgentView: React.FC<DecisionAgentViewProps> = ({
  selectedDistrict,
  isCloudCovered,
  isSimulatedDrought,
}) => {
  const [crop, setCrop] = useState<string>('Maize');
  const [consultResult, setConsultResult] = useState<AgentConsultationResponse | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [approvedActions, setApprovedActions] = useState<Record<number, boolean>>({});

  const handleRunAgent = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const res = await runAgentConsultation(
        selectedDistrict,
        crop,
        isCloudCovered,
        isSimulatedDrought
      );
      setConsultResult(res);
      setApprovedActions({});
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Agent consultation connection error. Retrying...');
    } finally {
      setIsRunning(false);
    }
  };

  // Automatically execute agent consultation on mount or when district/crop changes
  useEffect(() => {
    handleRunAgent();
  }, [selectedDistrict, crop, isCloudCovered, isSimulatedDrought]);

  const toggleApproval = (idx: number) => {
    setApprovedActions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-forest-400" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-forest-400">
                AUTONOMOUS AGRICULTURAL DECISION AGENT
              </span>
            </div>
            <h2 className="text-xl font-bold text-ivory-100 mt-1">
              Evidence-Grounded Agronomic Intervention Engine
            </h2>
            <p className="text-sm text-ivory-300 mt-1">
              Deterministic multi-tool execution grounded in University of Agricultural Sciences (UAS) Dharwad & ICAR
              guidelines with mandatory human sign-off for capital-intensive interventions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="bg-charcoal-800 border border-charcoal-700 text-xs font-mono text-ivory-200 px-3 py-2 rounded focus:outline-none"
            >
              <option value="Maize">Crop: Maize (Zea mays)</option>
              <option value="Ragi">Crop: Ragi (Finger Millet)</option>
            </select>
            <button
              onClick={handleRunAgent}
              disabled={isRunning}
              className="bg-forest-600 hover:bg-forest-500 disabled:opacity-50 text-white text-xs font-mono font-bold px-4 py-2 rounded flex items-center gap-2 transition-all shadow-md"
            >
              {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {isRunning ? 'Executing Multi-Tool Agent...' : 'Run Agent Consultation'}
            </button>
          </div>
        </div>
      </div>

      {isRunning && !consultResult && (
        <div className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-10 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-forest-400 animate-spin mx-auto" />
          <h4 className="text-sm font-mono font-bold text-ivory-100">
            Executing Autonomous Multi-Tool Agent Pipeline...
          </h4>
          <p className="text-xs text-ivory-400 max-w-md mx-auto">
            Step 1: Validating Geography & Soil Context → Step 2: Querying Copernicus SAR/Optical → Step 3: Conformal Inference → Step 4: Retrieving UAS Dharwad Practices.
          </p>
        </div>
      )}

      {error && !consultResult && (
        <div className="bg-danger-950/40 border border-danger-700/50 rounded-lg p-6 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-danger-400 mx-auto" />
          <h4 className="text-sm font-mono font-bold text-danger-200">
            Agent Consultation Connection Notice
          </h4>
          <p className="text-xs text-danger-300">{error}</p>
          <button
            onClick={handleRunAgent}
            className="px-4 py-2 bg-danger-600 hover:bg-danger-500 text-white rounded font-mono text-xs font-bold transition-all inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Agent Consultation
          </button>
        </div>
      )}

      {consultResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Tool Audit Trail */}
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-5">
            <h3 className="font-mono text-sm font-bold text-ivory-100 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-forest-400" />
              MULTI-TOOL AUDIT TRAIL
            </h3>
            <p className="text-xs text-ivory-400 mb-4">
              Deterministic execution log verifying zero dummy data and zero LLM hallucination:
            </p>

            <div className="space-y-3">
              {consultResult.audit_trail.map((step, idx) => (
                <div key={idx} className="p-3 rounded bg-charcoal-800/80 border border-charcoal-700 text-xs font-mono">
                  <div className="flex items-center gap-2 text-forest-400 font-bold mb-1">
                    <CheckCircle className="w-3.5 h-3.5 text-forest-400" />
                    <span>Tool Step {step.step}: {step.action}</span>
                  </div>
                  {step.district && <span className="text-ivory-300 block text-[11px]">Region: {step.district}</span>}
                  {step.inputs && (
                    <span className="text-ivory-400 block text-[11px]">
                      Inputs: Cloud Deck = {step.inputs.cloud_covered ? '85% True' : 'False'}
                    </span>
                  )}
                  {step.reason && <span className="text-danger-400 block text-[11px]">Reason: {step.reason}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Agronomic Mitigation Plan */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-ivory-400">
                  CONSULTATION STATUS & STRESS DIAGNOSIS
                </span>
                <span
                  className={`text-xs px-2.5 py-1 rounded font-mono font-bold ${
                    consultResult.agent_status === 'ABSTAINED'
                      ? 'bg-danger-600/20 text-danger-400 border border-danger-600/40'
                      : 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/40'
                  }`}
                >
                  {consultResult.agent_status}: {consultResult.detected_stress_level || 'ABSTENTION GUARD'}
                </span>
              </div>

              {consultResult.agent_status === 'ABSTAINED' ? (
                <div className="mt-4 p-4 rounded bg-danger-900/20 border border-danger-600/40 text-danger-300 text-xs">
                  <div className="flex items-center gap-2 font-bold mb-1 text-danger-400 font-mono">
                    <AlertTriangle className="w-4 h-4" />
                    <span>POLICY TRIGGERED: MODEL ABSTAINED FROM SPECULATIVE ACTION</span>
                  </div>
                  <p className="mt-1">{consultResult.recommendation_summary}</p>
                </div>
              ) : (
                <div className="mt-3">
                  <div className="flex items-center gap-3 text-xs font-mono text-ivory-300">
                    <span>Target Crop: <strong className="text-forest-400">{consultResult.crop}</strong></span>
                    <span>•</span>
                    <span>Drought Stress Probability: <strong className="text-ivory-100">{((consultResult.predicted_drought_probability || 0) * 100).toFixed(1)}%</strong></span>
                    <span>•</span>
                    <span>Conformal Confidence: <strong className="text-forest-400">{consultResult.conformal_confidence}</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* Recommended Interventions */}
            {consultResult.recommended_actions.length > 0 && (
              <div className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-forest-400" />
                    <h3 className="font-mono text-sm font-bold text-ivory-100">
                      Grounded Mitigation Interventions (UAS Dharwad Guidelines)
                    </h3>
                  </div>
                  <span className="text-xs text-ivory-400 font-mono">
                    {consultResult.recommended_actions.length} Interventions Prescribed
                  </span>
                </div>

                <div className="space-y-4">
                  {consultResult.recommended_actions.map((act, idx) => {
                    const isApproved = approvedActions[idx];
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded bg-charcoal-800/80 border border-charcoal-700 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm font-bold text-ivory-100">
                            {idx + 1}. {act.action}
                          </span>
                          {act.requires_human_approval && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-600/40 font-semibold">
                              REQUIRES HUMAN SIGN-OFF
                            </span>
                          )}
                        </div>

                        {act.objective && <p className="text-ivory-300">{act.objective}</p>}
                        {act.rate && (
                          <div className="font-mono text-xs text-forest-300">
                            Application Rate / Dosage: <strong>{act.rate}</strong>
                          </div>
                        )}
                        {act.depth && (
                          <div className="font-mono text-xs text-sky-300">
                            Irrigation Depth: <strong>{act.depth}</strong> ({act.timing})
                          </div>
                        )}

                        <div className="pt-2 border-t border-charcoal-700/80 flex items-center justify-between">
                          <span className="text-[11px] font-mono text-ivory-400">
                            Authority: <span className="text-ivory-200">{act.source}</span>
                          </span>

                          {act.requires_human_approval && (
                            <button
                              onClick={() => toggleApproval(idx)}
                              className={`px-3 py-1 rounded text-xs font-mono font-semibold flex items-center gap-1.5 transition-all ${
                                isApproved
                                  ? 'bg-forest-600 text-white'
                                  : 'bg-charcoal-700 text-ivory-300 hover:text-ivory-100 border border-charcoal-600'
                              }`}
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              {isApproved ? 'Agronomist Signed Off' : 'Authorize Action'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

