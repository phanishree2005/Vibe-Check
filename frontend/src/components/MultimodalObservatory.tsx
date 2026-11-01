import React, { useState, useEffect } from 'react';
import { fetchWeatherForecast, fetchProvenance } from '../services/api';
import { CloudRain, Thermometer, Droplets, Wind, Sun, Database, ShieldCheck } from 'lucide-react';

interface MultimodalObservatoryProps {
  selectedDistrict: string;
}

export const MultimodalObservatory: React.FC<MultimodalObservatoryProps> = ({ selectedDistrict }) => {
  const [forecastData, setForecastData] = useState<any>(null);
  const [provenanceData, setProvenanceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [fc, prov] = await Promise.all([
          fetchWeatherForecast(selectedDistrict),
          fetchProvenance()
        ]);
        setForecastData(fc);
        setProvenanceData(prov);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [selectedDistrict]);

  const forecastRecords = forecastData?.forecast || [];
  const provLogs = provenanceData?.provenance_logs || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-5">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-forest-400" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-forest-400">
            MULTIMODAL ENVIRONMENTAL DATA OBSERVATORY
          </span>
        </div>
        <h2 className="text-xl font-bold text-ivory-100 mt-1">
          Authentic Hydrometeorological Sequences & Soil Pedotransfer
        </h2>
        <p className="text-sm text-ivory-300 mt-1">
          Traceable meteorological observations from NASA POWER & ECMWF Open-Meteo coupled with ISRIC SoilGrids
          pedotransfer parameters. All data streams preserve native resolution and full audit provenance.
        </p>
      </div>

      {/* 14-Day NWP Forecast Horizon Table */}
      <div className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-sky-400" />
            <h3 className="font-mono text-sm font-bold text-ivory-100">
              Live 14-Day Numerical Weather Prediction (NWP) Horizon — {selectedDistrict}
            </h3>
          </div>
          <span className="text-xs font-mono text-forest-400 bg-forest-900/40 border border-forest-600/40 px-2 py-0.5 rounded">
            ECMWF IFS / DWD ICON Engine
          </span>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-ivory-400 font-mono text-xs">Loading authentic forecast stream...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-charcoal-800 text-ivory-300 uppercase border-b border-charcoal-700">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Precipitation</th>
                  <th className="py-2.5 px-3">Tmax / Tmin</th>
                  <th className="py-2.5 px-3">VPD (Evaporative Deficit)</th>
                  <th className="py-2.5 px-3">RH Mean</th>
                  <th className="py-2.5 px-3">Wind Speed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-800">
                {forecastRecords.map((r: any, idx: number) => {
                  const isDry = r.forecast_precipitation_mm === 0;
                  const isVpdHigh = r.forecast_vpd_kpa > 1.2;
                  return (
                    <tr key={idx} className="hover:bg-charcoal-800/50 transition-colors">
                      <td className="py-2 px-3 text-ivory-200 font-medium">{r.date}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded font-semibold ${isDry ? 'bg-amber-900/30 text-amber-400' : 'bg-sky-900/30 text-sky-400'}`}>
                          {r.forecast_precipitation_mm.toFixed(1)} mm
                        </span>
                      </td>
                      <td className="py-2 px-3 text-ivory-200">
                        {r.forecast_temp_max_c.toFixed(1)}°C / {r.forecast_temp_min_c.toFixed(1)}°C
                      </td>
                      <td className="py-2 px-3">
                        <span className={`font-semibold ${isVpdHigh ? 'text-danger-400' : 'text-emerald-400'}`}>
                          {r.forecast_vpd_kpa.toFixed(3)} kPa
                        </span>
                      </td>
                      <td className="py-2 px-3 text-ivory-300">{r.forecast_rel_humidity_pct}%</td>
                      <td className="py-2 px-3 text-ivory-300">{r.forecast_wind_ms.toFixed(1)} m/s</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Central Provenance Table: Enforcing Rule 1 (Zero Dummy Data) */}
      <div className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-forest-400" />
            <h3 className="font-mono text-sm font-bold text-ivory-100">
              Central Observation Provenance Registry (Rule 1 Compliance)
            </h3>
          </div>
          <span className="text-xs font-mono text-amber-400">
            {provLogs.length} Traceable Scientific Datasets Registered
          </span>
        </div>
        <p className="text-xs text-ivory-300 mb-4">
          Every observation ingested into BHUMI-X preserves its authenticated dataset identifier, coordinate reference system,
          spatial resolution, and acquisition timestamp. No synthetic or invented records are permitted in production.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-charcoal-800 text-ivory-300 uppercase border-b border-charcoal-700">
              <tr>
                <th className="py-2 px-3">Modality</th>
                <th className="py-2 px-3">Source Name</th>
                <th className="py-2 px-3">Dataset ID</th>
                <th className="py-2 px-3">Spatial Support</th>
                <th className="py-2 px-3">Temporal Cadence</th>
                <th className="py-2 px-3">CRS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800">
              {provLogs.map((log: any, idx: number) => (
                <tr key={idx} className="hover:bg-charcoal-800/40">
                  <td className="py-2 px-3 font-semibold text-forest-400">{log.modality}</td>
                  <td className="py-2 px-3 text-ivory-200">{log.source_name}</td>
                  <td className="py-2 px-3 text-amber-400/90">{log.dataset_id}</td>
                  <td className="py-2 px-3 text-ivory-300">
                    {log.spatial_resolution_m >= 1000 ? `${(log.spatial_resolution_m / 1000).toFixed(0)} km` : `${log.spatial_resolution_m} m`}
                  </td>
                  <td className="py-2 px-3 text-ivory-300">{log.temporal_resolution}</td>
                  <td className="py-2 px-3 text-ivory-400">{log.coordinate_system}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

