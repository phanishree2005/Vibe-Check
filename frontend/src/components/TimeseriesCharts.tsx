import React, { useState, useEffect } from 'react';
import { fetchTimeseriesTrends } from '../services/api';
import { BarChart2, TrendingDown, Droplets, CloudRain, Sun, Activity, Layers } from 'lucide-react';

interface TimeseriesChartsProps {
  selectedDistrict: string;
  isSimulatedDrought: boolean;
}

export const TimeseriesCharts: React.FC<TimeseriesChartsProps> = ({
  selectedDistrict,
  isSimulatedDrought,
}) => {
  const [data, setData] = useState<any>(null);
  const [activeChart, setActiveChart] = useState<'met' | 'soil' | 'radar'>('met');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetchTimeseriesTrends(selectedDistrict, isSimulatedDrought);
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [selectedDistrict, isSimulatedDrought]);

  if (isLoading || !data) {
    return (
      <div className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-6 text-center text-ivory-400 font-mono text-xs">
        Loading spatiotemporal trend curves...
      </div>
    );
  }

  const trends = data.trends || [];
  const thresholds = data.soil_thresholds || {};

  // Dimensions for SVG charts
  const width = 800;
  const height = 260;
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Max values for normalization
  const maxRain = Math.max(10, ...trends.map((t: any) => t.precipitation_mm));
  const maxTemp = Math.max(40, ...trends.map((t: any) => t.temp_max_c));
  const maxVpd = Math.max(2.5, ...trends.map((t: any) => t.vpd_kpa));

  return (
    <div className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-5 space-y-4">
      {/* Chart Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-forest-400" />
          <h3 className="font-mono text-sm font-bold text-ivory-100">
            SPATIOTEMPORAL HYDROMETEOROLOGICAL DYNAMICS & SENSOR CURVES
          </h3>
        </div>

        <div className="flex items-center gap-1.5 bg-charcoal-800 p-1 rounded font-mono text-xs">
          <button
            onClick={() => setActiveChart('met')}
            className={`px-3 py-1 rounded transition-all ${
              activeChart === 'met' ? 'bg-forest-600 text-white font-bold' : 'text-ivory-400 hover:text-ivory-200'
            }`}
          >
            Precipitation & VPD
          </button>
          <button
            onClick={() => setActiveChart('soil')}
            className={`px-3 py-1 rounded transition-all ${
              activeChart === 'soil' ? 'bg-forest-600 text-white font-bold' : 'text-ivory-400 hover:text-ivory-200'
            }`}
          >
            Soil Moisture Trajectory
          </button>
          <button
            onClick={() => setActiveChart('radar')}
            className={`px-3 py-1 rounded transition-all ${
              activeChart === 'radar' ? 'bg-forest-600 text-white font-bold' : 'text-ivory-400 hover:text-ivory-200'
            }`}
          >
            Optical vs SAR Synergy
          </button>
        </div>
      </div>

      {/* SVG Chart 1: Atmospheric Flux (Precipitation Bars + VPD Curve) */}
      {activeChart === 'met' && (
        <div>
          <div className="flex items-center justify-between text-xs font-mono text-ivory-300 mb-2">
            <span>Historical 14-Day Lookback (t-14 to t)</span>
            <span className="text-amber-400 font-bold">Today (t)</span>
            <span className="text-sky-400 font-bold">14-Day Forward NWP Forecast (t to t+14)</span>
          </div>

          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto font-mono text-[10px]">
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
                <line
                  key={i}
                  x1={padding.left}
                  y1={padding.top + chartH * pct}
                  x2={width - padding.right}
                  y2={padding.top + chartH * pct}
                  stroke="#1f2923"
                  strokeDasharray="3 3"
                />
              ))}

              {/* Today vertical divider line */}
              <line
                x1={padding.left + chartW * 0.5}
                y1={padding.top}
                x2={padding.left + chartW * 0.5}
                y2={padding.top + chartH}
                stroke="#d97706"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <text x={padding.left + chartW * 0.5 + 4} y={padding.top + 12} fill="#d97706" fontWeight="bold">
                Today (Prediction Issue Time)
              </text>

              {/* Rain Bars */}
              {trends.map((t: any, idx: number) => {
                const barW = (chartW / trends.length) * 0.65;
                const x = padding.left + (idx / trends.length) * chartW + 2;
                const barH = (t.precipitation_mm / maxRain) * (chartH * 0.85);
                const y = padding.top + chartH - barH;
                const isFuture = t.is_future_forecast;
                return (
                  <rect
                    key={idx}
                    x={x}
                    y={y}
                    width={barW}
                    height={barH}
                    fill={isFuture ? '#38bdf8' : '#22c55e'}
                    opacity={0.75}
                    rx="1"
                  >
                    <title>{`${t.label}: ${t.precipitation_mm}mm rain`}</title>
                  </rect>
                );
              })}

              {/* VPD Line (Vapor Pressure Deficit) */}
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                points={trends
                  .map((t: any, idx: number) => {
                    const x = padding.left + (idx / trends.length) * chartW + (chartW / trends.length) * 0.35;
                    const y = padding.top + chartH - (t.vpd_kpa / maxVpd) * chartH;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />

              {/* Axis Labels */}
              <text x={padding.left - 40} y={padding.top + 10} fill="#94a3b8">
                {maxVpd.toFixed(1)} kPa
              </text>
              <text x={padding.left - 40} y={padding.top + chartH} fill="#94a3b8">
                0.0 kPa
              </text>
              <text x={width - padding.right + 5} y={padding.top + chartH - 5} fill="#38bdf8">
                Rain (mm)
              </text>
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-ivory-400 mt-2 px-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-sky-400">
                <span className="w-3 h-3 bg-sky-400 inline-block rounded-sm" /> Precipitation Bars (mm)
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-4 h-0.5 bg-amber-400 inline-block" /> Vapor Pressure Deficit (VPD, kPa)
              </span>
            </div>
            <span>Lookback: 14 Days • Forecast: 14 Days</span>
          </div>
        </div>
      )}

      {/* SVG Chart 2: Soil Water Dynamics relative to Permanent Wilting Point */}
      {activeChart === 'soil' && (
        <div>
          <div className="flex items-center justify-between text-xs font-mono text-ivory-300 mb-2">
            <span>Root-Zone Soil Moisture Trajectory (m³/m³)</span>
            <span className="text-danger-400 font-bold">Permanent Wilting Point (PWP): {thresholds.theta_pwp}</span>
            <span className="text-forest-400 font-bold">Field Capacity (FC): {thresholds.theta_fc}</span>
          </div>

          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto font-mono text-[10px]">
              {/* Field Capacity Line */}
              {thresholds.theta_fc && (
                <>
                  <line
                    x1={padding.left}
                    y1={padding.top + chartH * 0.25}
                    x2={width - padding.right}
                    y2={padding.top + chartH * 0.25}
                    stroke="#22c55e"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                  <text x={padding.left + 5} y={padding.top + chartH * 0.25 - 4} fill="#22c55e" fontWeight="bold">
                    Field Capacity (FC) = {thresholds.theta_fc}
                  </text>
                </>
              )}

              {/* Permanent Wilting Point Line */}
              {thresholds.theta_pwp && (
                <>
                  <line
                    x1={padding.left}
                    y1={padding.top + chartH * 0.80}
                    x2={width - padding.right}
                    y2={padding.top + chartH * 0.80}
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                  <text x={padding.left + 5} y={padding.top + chartH * 0.80 - 4} fill="#ef4444" fontWeight="bold">
                    Permanent Wilting Point (PWP) = {thresholds.theta_pwp} (Severe Plant Stress)
                  </text>
                </>
              )}

              {/* Today line */}
              <line
                x1={padding.left + chartW * 0.5}
                y1={padding.top}
                x2={padding.left + chartW * 0.5}
                y2={padding.top + chartH}
                stroke="#d97706"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Soil Moisture Curve */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                points={trends
                  .map((t: any, idx: number) => {
                    const x = padding.left + (idx / trends.length) * chartW + (chartW / trends.length) * 0.35;
                    const smSpan = (thresholds.theta_sat || 0.45) - (thresholds.theta_pwp * 0.6 || 0.05);
                    const relSm = (t.soil_moisture - (thresholds.theta_pwp * 0.6 || 0.05)) / smSpan;
                    const y = padding.top + chartH - Math.max(0.05, Math.min(0.95, relSm)) * chartH;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            </svg>
          </div>

          <div className="text-xs font-mono text-ivory-400 mt-2 flex justify-between px-2">
            <span>Soil Order: <strong className="text-ivory-200">{selectedDistrict} Soil Profile</strong></span>
            <span>Available Water Capacity (AWC): <strong className="text-forest-400">{((thresholds.theta_fc - thresholds.theta_pwp) * 1000).toFixed(0)} mm/m</strong></span>
          </div>
        </div>
      )}

      {/* SVG Chart 3: Dual-Sensor Optical NDVI vs SAR Radar Curve */}
      {activeChart === 'radar' && (
        <div>
          <div className="flex items-center justify-between text-xs font-mono text-ivory-300 mb-2">
            <span>Sentinel-2 Optical NDVI vs Sentinel-1 C-Band SAR Cross-Ratio</span>
            <span className="text-emerald-400 font-bold">Green Line = Optical NDVI</span>
            <span className="text-sky-400 font-bold">Cyan Line = SAR Radar (VH/VV dB)</span>
          </div>

          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto font-mono text-[10px]">
              {/* Optical NDVI Line */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                points={trends
                  .map((t: any, idx: number) => {
                    const x = padding.left + (idx / trends.length) * chartW;
                    const y = padding.top + chartH - (t.s2_ndvi / 1.0) * chartH;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />

              {/* SAR Cross-Ratio Line */}
              <polyline
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                points={trends
                  .map((t: any, idx: number) => {
                    const x = padding.left + (idx / trends.length) * chartW;
                    const normSar = (t.s1_sar_cr_db + 15.0) / 10.0;
                    const y = padding.top + chartH - Math.max(0.1, Math.min(0.9, normSar)) * chartH;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />

              <line
                x1={padding.left + chartW * 0.5}
                y1={padding.top}
                x2={padding.left + chartW * 0.5}
                y2={padding.top + chartH}
                stroke="#d97706"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            </svg>
          </div>

          <p className="text-xs font-mono text-ivory-400 mt-2 px-2">
            Notice how SAR Cross-Ratio tracks structural canopy loss continuously even when clouds obscure optical reflectance.
          </p>
        </div>
      )}
    </div>
  );
};

