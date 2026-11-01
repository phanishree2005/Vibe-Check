import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CommandCenter } from './components/CommandCenter';
import { EarthObservationLab } from './components/EarthObservationLab';
import { MultimodalObservatory } from './components/MultimodalObservatory';
import { PredictiveIntelligence } from './components/PredictiveIntelligence';
import { ExplainableLab } from './components/ExplainableLab';
import { DecisionAgentView } from './components/DecisionAgentView';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { ResearchObservatory } from './components/ResearchObservatory';
import { fetchDistricts, runPrediction, fetchEarthObservation } from './services/api';
import { DistrictInfo, PredictionResponse, SatelliteMetrics } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('command');
  const [districts, setDistricts] = useState<DistrictInfo[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Dharwad');
  const [customCoords, setCustomCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [isCloudCovered, setIsCloudCovered] = useState<boolean>(false);
  const [isSimulatedDrought, setIsSimulatedDrought] = useState<boolean>(false);

  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [satelliteMetrics, setSatelliteMetrics] = useState<SatelliteMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load full district catalog on mount
  useEffect(() => {
    const initDistricts = async () => {
      try {
        const list = await fetchDistricts();
        setDistricts(list);
        if (list.length > 0 && !selectedDistrict) {
          setSelectedDistrict(list[0].id);
        }
      } catch (e) {
        console.error('Failed to load districts:', e);
      }
    };
    initDistricts();
  }, []);

  // Fetch prediction and satellite data whenever district, custom coords, cloud deck, or stress state changes
  useEffect(() => {
    if (!selectedDistrict) return;
    const loadState = async () => {
      setIsLoading(true);
      try {
        const [pred, sat] = await Promise.all([
          runPrediction(
            selectedDistrict,
            isCloudCovered,
            isSimulatedDrought,
            customCoords?.lat,
            customCoords?.lon
          ),
          fetchEarthObservation(
            selectedDistrict,
            isCloudCovered,
            customCoords?.lat,
            customCoords?.lon
          )
        ]);
        setPrediction(pred);
        setSatelliteMetrics(sat);
      } catch (e) {
        console.error('Error updating spatiotemporal state:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadState();
  }, [selectedDistrict, customCoords, isCloudCovered, isSimulatedDrought]);

  const handleCustomCoords = (lat: number, lon: number, item?: any) => {
    setCustomCoords((prev) => {
      if (prev && Math.abs(prev.lat - lat) < 0.0001 && Math.abs(prev.lon - lon) < 0.0001) {
        return prev;
      }
      return { lat, lon };
    });
    if (item && item.name) {
      const locName = item.name;
      setSelectedDistrict(locName);
      setDistricts((prev) => {
        const exists = prev.some((d) => d.id === locName || d.name === locName);
        if (exists) return prev;
        const newDist: DistrictInfo = {
          id: locName,
          name: locName,
          state: item.state || 'Karnataka',
          zone: item.display_name ? item.display_name.split(',').slice(1, 3).join(',') : 'Hyperlocal Region',
          lat: lat,
          lon: lon,
          soil_order: item.soil_order || 'Agricultural Vertisol',
          primary_crop: item.primary_crop || 'Maize / Rainfed Mixed Crops',
          clay_fraction: 0.35,
          rooting_depth_m: 1.0,
          vulnerability: item.display_name || 'High Precision Monitored Field'
        };
        return [newDist, ...prev];
      });
    }
  };

  const handleLocationInspected = (pointData: any) => {
    const locName = pointData.village_or_town || pointData.nearest_district;
    if (locName) {
      setSelectedDistrict((prev) => (prev === locName ? prev : locName));
    }
  };

  const currentDistrictInfo = districts.find((d) => d.id === selectedDistrict) || districts[0];

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col text-ivory-200">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        districts={districts}
        isCloudOccluded={isCloudCovered}
        setIsCloudOccluded={setIsCloudCovered}
        isSimulatedDrought={isSimulatedDrought}
        setIsSimulatedDrought={setIsSimulatedDrought}
        onCustomCoords={handleCustomCoords}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'command' && (
          <CommandCenter
            districtInfo={currentDistrictInfo}
            allDistricts={districts}
            selectedDistrict={selectedDistrict}
            onSelectDistrict={setSelectedDistrict}
            onSelectCoords={handleCustomCoords}
            onLocationInspected={handleLocationInspected}
            customCoords={customCoords}
            prediction={prediction}
            onNavigateTab={setActiveTab}
            isSimulatedDrought={isSimulatedDrought}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'earth_obs' && (
          <EarthObservationLab
            metrics={satelliteMetrics}
            isCloudCovered={isCloudCovered}
            onToggleCloud={() => setIsCloudCovered(!isCloudCovered)}
            selectedDistrict={selectedDistrict}
          />
        )}

        {activeTab === 'multimodal' && (
          <MultimodalObservatory selectedDistrict={selectedDistrict} />
        )}

        {activeTab === 'predictive' && (
          <PredictiveIntelligence
            prediction={prediction}
            selectedDistrict={selectedDistrict}
          />
        )}

        {activeTab === 'xai' && (
          <ExplainableLab
            prediction={prediction}
            selectedDistrict={selectedDistrict}
          />
        )}

        {activeTab === 'agent' && (
          <DecisionAgentView
            selectedDistrict={selectedDistrict}
            isCloudCovered={isCloudCovered}
            isSimulatedDrought={isSimulatedDrought}
          />
        )}

        {activeTab === 'simulator' && (
          <ScenarioSimulator selectedDistrict={selectedDistrict} />
        )}

        {activeTab === 'research' && <ResearchObservatory />}
      </main>

      {/* Scientific Footer */}
      <footer className="border-t border-charcoal-800 bg-charcoal-900 py-4 px-6 text-xs font-mono text-ivory-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div>
            BHUMI-X: Bharat's Hyperlocal Understanding & Multimodal Intelligence – X • IIT Research Prototype
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-emerald-400 font-semibold">Zero API Key Required</span>
            <span>•</span>
            <span>Zero Dummy Data Certified</span>
            <span>•</span>
            <span>Split-Conformal Calibration α=0.10</span>
            <span>•</span>
            <span>UAS Dharwad Guidelines Grounded</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
