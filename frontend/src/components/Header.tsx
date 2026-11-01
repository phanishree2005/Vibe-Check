import React, { useState, useEffect } from 'react';
import { Satellite, ShieldCheck, Activity, Cpu, Database, Eye, Search, MapPin, X, Loader2 } from 'lucide-react';
import { fetchDistricts } from '../services/api';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (d: string) => void;
  districts: Array<{ id: string; name: string; zone?: string; primary_crop?: string; lat?: number; lon?: number }>;
  isCloudOccluded: boolean;
  setIsCloudOccluded: (c: boolean) => void;
  isSimulatedDrought: boolean;
  setIsSimulatedDrought: (d: boolean) => void;
  onCustomCoords?: (lat: number, lon: number, item?: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedDistrict,
  setSelectedDistrict,
  districts,
  isCloudOccluded,
  setIsCloudOccluded,
  isSimulatedDrought,
  setIsSimulatedDrought,
  onCustomCoords,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [liveResults, setLiveResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const tabs = [
    { id: 'command', label: 'Command Center', icon: Activity },
    { id: 'earth_obs', label: 'Earth Observation', icon: Satellite },
    { id: 'multimodal', label: 'Multimodal Observatory', icon: Database },
    { id: 'predictive', label: 'Predictive Intelligence', icon: Cpu },
    { id: 'xai', label: 'Explainable AI', icon: Eye },
    { id: 'agent', label: 'Decision Agent', icon: ShieldCheck },
    { id: 'simulator', label: 'What-If Simulator', icon: Activity },
    { id: 'research', label: 'Research Benchmarks', icon: Database },
  ];

  // Debounced search to geocoding API covering ALL of India
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setLiveResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await fetchDistricts(q);
        setLiveResults(results || []);
      } catch (e) {
        console.error('Geocode search failed:', e);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectResult = (item: any) => {
    setSelectedDistrict(item.id || item.name);
    if (item.lat && item.lon && onCustomCoords) {
      onCustomCoords(item.lat, item.lon, item);
    }
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    // Check direct coordinates (e.g. "15.45, 75.00")
    if (q.includes(',') && onCustomCoords) {
      try {
        const parts = q.split(',');
        const lat = parseFloat(parts[0].trim());
        const lon = parseFloat(parts[1].trim());
        if (!isNaN(lat) && !isNaN(lon)) {
          onCustomCoords(lat, lon);
          setShowDropdown(false);
          setSearchQuery('');
          return;
        }
      } catch (err) {}
    }

    if (liveResults.length > 0) {
      handleSelectResult(liveResults[0]);
    } else {
      // Query on submit
      try {
        setIsSearching(true);
        const results = await fetchDistricts(q);
        if (results && results.length > 0) {
          handleSelectResult(results[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }
  };

  return (
    <header className="border-b border-charcoal-700 bg-charcoal-900/95 sticky top-0 z-[1200] backdrop-blur-md">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-forest-700 border border-forest-500/50 flex items-center justify-center text-ivory-100 font-bold text-xl shadow-lg shadow-forest-900/50">
            भ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold tracking-tight text-ivory-100">BHUMI-X</span>
              <span className="text-xs bg-forest-800 text-forest-400 border border-forest-600/50 px-2 py-0.5 rounded font-mono">
                IIT-RESEARCH v1.0
              </span>
              <span className="text-xs bg-emerald-600/20 text-emerald-400 border border-emerald-600/40 px-2 py-0.5 rounded font-mono">
                ZERO API KEY REQUIRED
              </span>
              <span className="text-xs bg-amber-600/20 text-amber-500 border border-amber-600/40 px-2 py-0.5 rounded font-mono">
                ZERO DUMMY DATA
              </span>
            </div>
            <p className="text-xs text-ivory-400 tracking-wide">
              Bharat's Hyperlocal Understanding & Multimodal Intelligence – X
            </p>
          </div>
        </div>

        {/* Global Controls: Search Bar & Test Stress Toggles */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Universal Search Bar with Live All-India Geocoding */}
          <div className="relative">
            <form onSubmit={handleSearchSubmit} className="flex items-center">
              <div className="flex items-center gap-2 bg-charcoal-800 border border-charcoal-700 px-3 py-1.5 rounded focus-within:border-forest-500 transition-colors w-60 md:w-72">
                {isSearching ? (
                  <Loader2 className="w-3.5 h-3.5 text-forest-400 animate-spin shrink-0" />
                ) : (
                  <Search className="w-3.5 h-3.5 text-ivory-400 shrink-0" />
                )}
                <input
                  type="text"
                  placeholder="Search any place in India (e.g. Goa)..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="bg-transparent text-xs text-ivory-100 focus:outline-none w-full font-mono placeholder:text-charcoal-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setShowDropdown(false);
                    }}
                    className="text-ivory-400 hover:text-ivory-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>

            {/* Live Autocomplete Dropdown for All-India locations */}
            {showDropdown && liveResults.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-charcoal-900 border border-charcoal-700 rounded-md shadow-2xl z-50 max-h-64 overflow-y-auto">
                <div className="p-1.5 space-y-1">
                  {liveResults.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectResult(item)}
                      className={`w-full text-left px-3 py-2 rounded text-xs font-mono flex items-center justify-between transition-colors ${
                        item.name === selectedDistrict
                          ? 'bg-forest-900/60 text-forest-300 font-bold border border-forest-600/40'
                          : 'text-ivory-300 hover:bg-charcoal-800'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1.5 font-bold text-white">
                          <MapPin className="w-3 h-3 text-forest-400 shrink-0" />
                          {item.name}
                        </span>
                        {item.display_name && (
                          <span className="text-[10px] text-ivory-400 truncate max-w-[200px]">
                            {item.display_name}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        {item.primary_crop && (
                          <span className="text-[10px] text-amber-300 block">{item.primary_crop}</span>
                        )}
                        {item.lat && (
                          <span className="text-[9px] text-ivory-500 block">
                            {item.lat.toFixed(2)}°, {item.lon.toFixed(2)}°
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Kharif Cloud Deck Simulator Toggle */}
          <button
            onClick={() => setIsCloudOccluded(!isCloudOccluded)}
            className={`text-xs font-mono px-3 py-1.5 rounded border transition-colors flex items-center gap-1.5 ${
              isCloudOccluded
                ? 'bg-amber-600/20 text-amber-400 border-amber-500 font-semibold'
                : 'bg-charcoal-800 text-ivory-400 border-charcoal-700 hover:text-ivory-200'
            }`}
            title="Simulates monsoon cloud blindout on Sentinel-2 to test SAR/Hydrology gating"
          >
            <span className={`w-2 h-2 rounded-full ${isCloudOccluded ? 'bg-amber-400 animate-pulse' : 'bg-gray-500'}`} />
            Cloud Occlusion: {isCloudOccluded ? '85% (S2 Gated)' : 'Clear'}
          </button>

          {/* Drought Stress Injector Toggle */}
          <button
            onClick={() => setIsSimulatedDrought(!isSimulatedDrought)}
            className={`text-xs font-mono px-3 py-1.5 rounded border transition-colors flex items-center gap-1.5 ${
              isSimulatedDrought
                ? 'bg-danger-600/20 text-danger-400 border-danger-500 font-semibold'
                : 'bg-charcoal-800 text-ivory-400 border-charcoal-700 hover:text-ivory-200'
            }`}
            title="Simulates dry-spell soil moisture depletion to observe 14-day anticipatory warning"
          >
            <span className={`w-2 h-2 rounded-full ${isSimulatedDrought ? 'bg-danger-500 animate-pulse' : 'bg-gray-500'}`} />
            Moisture Stress: {isSimulatedDrought ? 'ON' : 'NORMAL'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2.5 px-3.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'border-forest-400 text-ivory-100 bg-forest-900/30'
                  : 'border-transparent text-ivory-400 hover:text-ivory-200 hover:border-charcoal-600'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-forest-400' : 'text-ivory-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
