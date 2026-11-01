import React, { useEffect, useRef, useState } from 'react';
import { DistrictInfo } from '../types';
import { fetchLulcZones, inspectPoint } from '../services/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Satellite,
  Layers,
  MapPin,
  Calendar,
  Download,
  BarChart2,
  TrendingUp,
  Cpu,
  CheckCircle2,
  Sliders,
  Sparkles,
  Crosshair,
  Droplets,
  Thermometer,
  X,
  Compass,
} from 'lucide-react';

interface InteractiveMapProps {
  districts: DistrictInfo[];
  selectedDistrict: string;
  onSelectDistrict: (d: string) => void;
  onSelectCoords?: (lat: number, lon: number) => void;
  onLocationInspected?: (data: any) => void;
  customCoords?: { lat: number; lon: number } | null;
  isSimulatedDrought?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  districts,
  selectedDistrict,
  onSelectDistrict,
  onSelectCoords,
  onLocationInspected,
  customCoords,
  isSimulatedDrought = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polygonLayersRef = useRef<L.Polygon[]>([]);
  const baseLayersRef = useRef<Record<string, L.TileLayer>>({});
  const clickMarkerRef = useRef<L.Marker | null>(null);
  const handleInspectLocationRef = useRef<((lat: number, lon: number, flyTo?: boolean) => Promise<void>) | null>(null);

  // Default to Esri World Imagery (high-resolution global true-color satellite, 100% reliable)
  const [activeBaseLayer, setActiveBaseLayer] = useState<'esri' | 'google' | 'osm'>('esri');
  const [showLulcOverlay, setShowLulcOverlay] = useState<boolean>(true);
  const [lulcOpacity, setLulcOpacity] = useState<number>(0.72);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [lulcData, setLulcData] = useState<any>(null);
  const [clickedPoint, setClickedPoint] = useState<any>(null);
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const mouseCoordsSpanRef = useRef<HTMLSpanElement>(null);
  const lastLulcCoordsRef = useRef<{ lat: number; lon: number; district: string; year: number } | null>(null);
  const lastInspectedCoordsRef = useRef<{ lat: number; lon: number } | null>(null);

  // Initialize Leaflet Map ONCE on mount
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on selected district coordinates or Karnataka default
    const curr = districts.find((d) => d.id === selectedDistrict);
    const initLat = curr?.lat || 15.43;
    const initLon = curr?.lon || 75.63;

    const map = L.map(mapContainerRef.current, {
      center: [initLat, initLon],
      zoom: 10,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: true,
    });

    // 1. Esri World Imagery (High-Resolution Satellite Photos of Every Place in India, ZERO WATERMARK)
    const esriLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics & Copernicus',
        maxZoom: 18,
      }
    );

    // 2. Google Satellite Hybrid Tiles (mt0-mt3 subdomains)
    const googleHybrid = L.tileLayer(
      'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      {
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Earth Imagery &copy; Maxar',
        maxZoom: 20,
      }
    );

    // 3. OpenStreetMap
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    });

    // Default to Esri high-res satellite
    esriLayer.addTo(map);

    baseLayersRef.current = {
      esri: esriLayer,
      google: googleHybrid,
      osm: osmLayer,
    };

    // MASTER HYPERLOCAL POINT INSPECTION HANDLER
    const handleInspectLocation = async (lat: number, lon: number, flyTo: boolean = false) => {
      lastInspectedCoordsRef.current = { lat, lon };
      if (flyTo) {
        map.flyTo([lat, lon], 12, { animate: true, duration: 0.8 });
      }

      // Remove previous click pin
      if (clickMarkerRef.current) {
        clickMarkerRef.current.remove();
      }

      // Add calm, steady precision GIS reticle pin (zero glittering ping animation)
      const pulseHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;">
          <div style="position: absolute; width: 26px; height: 26px; border-radius: 50%; border: 2px solid #38bdf8; background: rgba(56, 189, 248, 0.25); box-shadow: 0 0 10px rgba(56, 189, 248, 0.6);"></div>
          <div style="width: 10px; height: 10px; border-radius: 50%; background: #38bdf8; border: 2px solid #ffffff; box-shadow: 0 0 8px #38bdf8;"></div>
        </div>
      `;
      const clickIcon = L.divIcon({
        html: pulseHtml,
        className: 'bhumi-clicked-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([lat, lon], { icon: clickIcon }).addTo(map);
      clickMarkerRef.current = marker;

      const popupOptions: L.PopupOptions = {
        maxWidth: 330,
        minWidth: 290,
        className: 'bhumi-custom-popup',
        autoPan: true,
        autoPanPadding: [25, 25],
        closeButton: true,
      };

      marker.bindPopup(`
        <div style="font-family: monospace; font-size: 11px; padding: 12px 14px; color: #fff; background: transparent; line-height: 1.4;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #38bdf8;"></span>
            <strong style="color: #38bdf8; font-size: 12px;">🛰️ Querying Earth Engine...</strong>
          </div>
          <div style="color: #94a3b8; font-size: 11px;">Coordinates: [${lat.toFixed(5)}°N, ${lon.toFixed(5)}°E]</div>
          <div style="color: #64748b; font-size: 10px; margin-top: 4px;">Resolving Village, Soil Hydraulics & NDVI...</div>
        </div>
      `, popupOptions).openPopup();

      setIsInspecting(true);

      try {
        const pointData = await inspectPoint(lat, lon, isSimulatedDrought);
        setClickedPoint(pointData);

        const isCritical = pointData.drought_probability >= 0.70;
        const isElevated = pointData.drought_probability >= 0.40 && pointData.drought_probability < 0.70;
        const riskColor = isCritical ? '#f87171' : (isElevated ? '#fbbf24' : '#4ade80');
        const riskBg = isCritical ? '#450a0a' : (isElevated ? '#451a03' : '#052e16');
        const riskBorder = isCritical ? '#ef4444' : (isElevated ? '#f59e0b' : '#10b981');

        const popupContent = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; width: 310px; padding: 12px 14px; background: transparent; color: #f8fafc; line-height: 1.4;">
            
            <!-- Village & Administrative Header -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #1e293b; padding-bottom: 6px; margin-bottom: 8px;">
              <div>
                <div style="font-size: 15px; font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 4px;">
                  <span>📍</span> ${pointData.village_or_town}
                </div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
                  ${pointData.taluk_or_subdistrict} • ${pointData.district}, ${pointData.state}
                </div>
              </div>
              <span style="font-size: 10px; background: #1e293b; color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: bold; white-space: nowrap;">
                ${lat.toFixed(4)}°, ${lon.toFixed(4)}°
              </span>
            </div>
            
            <!-- GEE LULC Classification Banner -->
            <div style="margin-bottom: 8px; padding: 6px 8px; background: #131c38; border-radius: 6px; border-left: 4px solid ${pointData.lulc_color}; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-size: 9px; text-transform: uppercase; color: #94a3b8; display: block; font-weight: bold;">Google Earth Engine LULC</span>
                <strong style="color: ${pointData.lulc_color}; font-size: 12px;">Class ${pointData.lulc_code}: ${pointData.lulc_class}</strong>
              </div>
              <span style="font-size: 10px; background: rgba(0,0,0,0.6); color: #facc15; padding: 2px 6px; border-radius: 4px; font-weight: 600;">
                🌾 ${pointData.default_crop}
              </span>
            </div>

            <!-- Biophysical Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 10px; margin-bottom: 8px;">
              <div style="background: #131c38; padding: 6px 8px; border-radius: 5px; border: 1px solid #1e293b;">
                <span style="color: #94a3b8; display: block; font-size: 9px; font-weight: 600;">💧 Root Soil SM</span>
                <strong style="color: #60a5fa; font-size: 13px;">${pointData.soil_moisture_m3m3} <span style="font-size: 8px; color: #94a3b8;">m³/m³</span></strong>
                <div style="font-size: 8px; color: #94a3b8; margin-top: 1px;">FC: ${pointData.field_capacity} | PWP: ${pointData.permanent_wilting_point}</div>
              </div>

              <div style="background: #131c38; padding: 6px 8px; border-radius: 5px; border: 1px solid #1e293b;">
                <span style="color: #94a3b8; display: block; font-size: 9px; font-weight: 600;">🌿 Sentinel-2 NDVI</span>
                <strong style="color: #4ade80; font-size: 13px;">${pointData.ndvi}</strong>
                <div style="font-size: 8px; color: #94a3b8; margin-top: 1px;">Canopy: ${pointData.ndvi > 0.6 ? 'Vigorous' : (pointData.ndvi > 0.4 ? 'Moderate' : 'Stressed')}</div>
              </div>

              <div style="background: #131c38; padding: 6px 8px; border-radius: 5px; border: 1px solid #1e293b;">
                <span style="color: #94a3b8; display: block; font-size: 9px; font-weight: 600;">🌡️ Surface Temp</span>
                <strong style="color: #f59e0b; font-size: 13px;">${pointData.temp_max_c}°C</strong>
                <div style="font-size: 8px; color: #94a3b8; margin-top: 1px;">VPD Deficit: ${pointData.vpd_kpa} kPa</div>
              </div>

              <div style="background: #131c38; padding: 6px 8px; border-radius: 5px; border: 1px solid #1e293b;">
                <span style="color: #94a3b8; display: block; font-size: 9px; font-weight: 600;">🏔️ Soil Order</span>
                <strong style="color: #cbd5e1; font-size: 11px;">${pointData.soil_order.split('(')[0].trim()}</strong>
                <div style="font-size: 8px; color: #94a3b8; margin-top: 1px;">Clay: ${Math.round(pointData.clay_fraction * 100)}%</div>
              </div>
            </div>

            <!-- 14-Day Stress Risk -->
            <div style="background: ${riskBg}; border: 1px solid ${riskBorder}; padding: 7px 9px; border-radius: 6px; text-align: center; margin-bottom: 8px;">
              <div style="font-size: 9.5px; color: #cbd5e1; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">
                14-Day Climate Stress Risk
              </div>
              <div style="color: ${riskColor}; font-size: 17px; font-weight: 900; font-family: monospace; margin: 1px 0;">
                ${(pointData.drought_probability * 100).toFixed(1)}%
              </div>
              <div style="font-size: 9.5px; font-weight: bold; color: ${riskColor};">
                ${pointData.risk_level} • Conformal: ${(pointData.conformal_set || []).join(', ') || 'Calibrated'}
              </div>
            </div>

            <!-- FAO-56 Irrigation & Contingency Advisory -->
            <div style="padding: 7px 9px; background: #0f1f2e; border-radius: 6px; border-left: 3.5px solid #38bdf8; font-size: 9.5px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <span style="color: #38bdf8; font-weight: bold; font-size: 9px; text-transform: uppercase;">🚜 Irrigation Guidance</span>
                <span style="font-size: 8px; padding: 1px 5px; border-radius: 3px; font-weight: bold; background: ${pointData.irrigation_urgency?.includes('CRITICAL') ? '#ef4444' : (pointData.irrigation_urgency?.includes('ELEVATED') ? '#f59e0b' : '#10b981')}; color: #fff;">
                  ${pointData.irrigation_urgency || 'OPTIMAL'}
                </span>
              </div>
              <div style="color: #e2e8f0; font-size: 9.5px; line-height: 1.3;">
                ${pointData.irrigation_action || 'Soil moisture within optimal bounds.'}
              </div>
              <div style="color: #94a3b8; font-size: 8.5px; margin-top: 2px;">
                ⚡ <em>Action:</em> ${pointData.contingency_measure || 'Standard crop monitoring.'}
              </div>
            </div>

          </div>
        `;
        marker.setPopupContent(popupContent);

        if (onLocationInspected) {
          onLocationInspected(pointData);
        } else if (onSelectDistrict && pointData.village_or_town) {
          onSelectDistrict(pointData.village_or_town);
        }
      } catch (err) {
        console.error('Point inspection failed:', err);
      } finally {
        setIsInspecting(false);
      }
    };

    handleInspectLocationRef.current = handleInspectLocation;

    // ON CLICK ANYWHERE ON MAP: Instant Point Inspection & Live Evaluation
    map.on('click', (e: L.LeafletMouseEvent) => {
      handleInspectLocation(e.latlng.lat, e.latlng.lng);
    });

    // Track live cursor coordinates on map directly in DOM (zero React re-render glittering)
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      if (mouseCoordsSpanRef.current) {
        mouseCoordsSpanRef.current.textContent = `${e.latlng.lat.toFixed(4)}°N, ${e.latlng.lng.toFixed(4)}°E`;
      }
    });

    // Invalidate size once on mount to guarantee full tile loading
    const timer1 = setTimeout(() => map.invalidateSize(), 200);
    const timer2 = setTimeout(() => map.invalidateSize(), 800);

    let resizeTimer: any = null;
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        map.invalidateSize();
      }, 250);
    };
    window.addEventListener('resize', handleResize);

    mapInstanceRef.current = map;

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Base Layer Switching
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(baseLayersRef.current).forEach((layer) => map.removeLayer(layer));
    if (baseLayersRef.current[activeBaseLayer]) {
      baseLayersRef.current[activeBaseLayer].addTo(map);
    }
  }, [activeBaseLayer]);

  // Load LULC Zones & Prediction Data (Cached by ~5km vicinity to prevent unnecessary polygon rebuilding)
  useEffect(() => {
    const curr = districts.find((d) => d.id === selectedDistrict);
    const lat = clickedPoint?.coordinates?.lat || customCoords?.lat || curr?.lat;
    const lon = clickedPoint?.coordinates?.lon || customCoords?.lon || curr?.lon;

    if (!lat || !lon) return;

    if (
      lastLulcCoordsRef.current &&
      lastLulcCoordsRef.current.district === selectedDistrict &&
      lastLulcCoordsRef.current.year === selectedYear &&
      Math.abs(lastLulcCoordsRef.current.lat - lat) < 0.05 &&
      Math.abs(lastLulcCoordsRef.current.lon - lon) < 0.05
    ) {
      return;
    }

    const loadLulc = async () => {
      try {
        lastLulcCoordsRef.current = { lat, lon, district: selectedDistrict, year: selectedYear };
        const data = await fetchLulcZones(selectedDistrict, lat, lon, isSimulatedDrought, selectedYear);
        setLulcData(data);
      } catch (e) {
        console.error('LULC Fetch error:', e);
      }
    };
    loadLulc();
  }, [selectedDistrict, isSimulatedDrought, selectedYear, clickedPoint, customCoords]);

  // Render LULC Polygons (Matching Google Earth Engine Colorful Classification)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    polygonLayersRef.current.forEach((p) => p.remove());
    polygonLayersRef.current = [];

    if (!showLulcOverlay || !lulcData?.parcels) return;

    lulcData.parcels.forEach((parcel: any) => {
      const polygon = L.polygon(parcel.bounds, {
        stroke: true,
        color: parcel.color,
        weight: 0.5,
        opacity: 0.35,
        fillColor: parcel.color,
        fillOpacity: lulcOpacity,
      }).addTo(map);

      polygon.bindTooltip(
        `
        <div style="font-family: monospace; font-size: 11px; padding: 4px; background: #0f172a; color: #fff; border-radius: 4px; border: 1px solid #334155;">
          <strong style="color: ${parcel.color}; font-size: 12px;">Class ${parcel.class_code}: ${parcel.classification}</strong><br/>
          <span>Coordinates: [${parcel.center[0]}, ${parcel.center[1]}]</span><br/>
          <span>Area: ${parcel.area_ha} ha • Crop: ${parcel.crop}</span><br/>
          <span style="color: #94a3b8;">Temporal Year: ${selectedYear}</span>
        </div>
        `,
        { direction: 'top', sticky: true }
      );

      polygon.on('click', (e: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e);
        handleInspectLocationRef.current?.(parcel.center[0], parcel.center[1]);
      });

      polygonLayersRef.current.push(polygon);
    });
  }, [lulcData, showLulcOverlay, lulcOpacity, selectedDistrict, selectedYear]);

  // Update District Pin Markers & Fly to Selected District
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    districts.forEach((dist) => {
      const isSelected = dist.id === selectedDistrict;

      const markerHtml = `
        <div style="
          background: ${isSelected ? '#10b981' : '#1e293b'};
          border: 2px solid ${isSelected ? '#ffffff' : '#94a3b8'};
          width: ${isSelected ? '24px' : '16px'};
          height: ${isSelected ? '24px' : '16px'};
          border-radius: 50%;
          box-shadow: 0 0 ${isSelected ? '14px #10b981' : '4px rgba(0,0,0,0.8)'};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          <div style="
            width: ${isSelected ? '8px' : '5px'};
            height: ${isSelected ? '8px' : '5px'};
            background: #ffffff;
            border-radius: 50%;
          "></div>
        </div>
      `;

      const icon = L.divIcon({
        html: markerHtml,
        className: 'bhumi-map-pin',
        iconSize: [isSelected ? 24 : 16, isSelected ? 24 : 16],
        iconAnchor: [isSelected ? 12 : 8, isSelected ? 12 : 8],
      });

      const marker = L.marker([dist.lat, dist.lon], { icon }).addTo(map);

      marker.bindTooltip(
        `
        <div style="font-family: monospace; font-size: 11px; padding: 2px;">
          <strong style="color: #10b981;">${dist.name}</strong><br/>
          <span>Crop: ${dist.primary_crop || 'Maize'}</span><br/>
          <span style="color: #cbd5e1;">${dist.soil_order || 'Agricultural Vertisol'}</span>
        </div>
        `,
        { direction: 'top', offset: [0, -8] }
      );

      marker.on('click', () => {
        onSelectDistrict(dist.id);
        if (onSelectCoords) {
          onSelectCoords(dist.lat, dist.lon);
        }
      });

      markersRef.current.push(marker);

      if (isSelected && !clickedPoint) {
        map.flyTo([dist.lat, dist.lon], 11, { animate: true, duration: 1.0 });
      }
    });
  }, [districts, selectedDistrict]);

  // Fly and inspect custom searched coordinates anywhere in India (triggered only from search bar)
  useEffect(() => {
    if (!customCoords) return;
    const last = lastInspectedCoordsRef.current;
    if (
      last &&
      Math.abs(last.lat - customCoords.lat) < 0.0001 &&
      Math.abs(last.lon - customCoords.lon) < 0.0001
    ) {
      return; // Already inspected or currently inspecting these coordinates
    }
    lastInspectedCoordsRef.current = { lat: customCoords.lat, lon: customCoords.lon };
    handleInspectLocationRef.current?.(customCoords.lat, customCoords.lon, true);
  }, [customCoords]);

  const legend = lulcData?.legend || [
    { code: 1, label: 'Built', color: '#f87171' },
    { code: 2, label: 'Water', color: '#38bdf8' },
    { code: 3, label: 'Dryland forest', color: '#15803d' },
    { code: 4, label: 'Grass', color: '#a3e635' },
    { code: 5, label: 'Wetland', color: '#0284c7' },
    { code: 6, label: 'Shrub', color: '#16a34a' },
    { code: 7, label: 'Swamp', color: '#854d0e' },
    { code: 8, label: 'Palm oil', color: '#ea580c' },
    { code: 9, label: 'Crops', color: '#facc15' },
    { code: 10, label: 'Bare', color: '#d97706' },
  ];

  const areaChanges = lulcData?.area_changes || [];

  return (
    <div className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-5 space-y-4">
      {/* GEE Code Editor Style Title Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-charcoal-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500 flex items-center justify-center shrink-0">
            <Satellite className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/40">
                GOOGLE EARTH ENGINE
              </span>
              <h3 className="font-mono text-sm font-bold text-ivory-100 flex items-center gap-2">
                Land Use and Land Cover (LULC) Future Prediction
              </h3>
            </div>
            <span className="text-[11px] text-ivory-400 font-mono">
              Click ANY farm, road, or location across India to instantly inspect coordinates live
            </span>
          </div>
        </div>

        {/* Temporal & Basemap Switchers */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Temporal Year Switcher */}
          <div className="flex items-center bg-charcoal-800 p-1 rounded border border-charcoal-700">
            <span className="text-[10px] text-ivory-400 px-1.5 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-forest-400" /> Year:
            </span>
            {[2005, 2018, 2022, 2025].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-2 py-1 rounded transition-all text-xs font-semibold ${
                  selectedYear === yr
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-ivory-400 hover:text-ivory-200'
                }`}
                title={yr === 2025 ? 'AI Predicted Classification' : `Historical Epoch ${yr}`}
              >
                {yr}
              </button>
            ))}
          </div>

          {/* Basemap Switcher */}
          <div className="flex items-center bg-charcoal-800 p-1 rounded border border-charcoal-700">
            <button
              onClick={() => setActiveBaseLayer('esri')}
              className={`px-2.5 py-1 rounded transition-all ${
                activeBaseLayer === 'esri' ? 'bg-forest-600 text-white font-bold' : 'text-ivory-400 hover:text-ivory-200'
              }`}
            >
              🛰️ Esri Satellite
            </button>
            <button
              onClick={() => setActiveBaseLayer('google')}
              className={`px-2.5 py-1 rounded transition-all ${
                activeBaseLayer === 'google' ? 'bg-forest-600 text-white font-bold' : 'text-ivory-400 hover:text-ivory-200'
              }`}
            >
              🌍 Google Hybrid
            </button>
            <button
              onClick={() => setActiveBaseLayer('osm')}
              className={`px-2.5 py-1 rounded transition-all ${
                activeBaseLayer === 'osm' ? 'bg-forest-600 text-white font-bold' : 'text-ivory-400 hover:text-ivory-200'
              }`}
            >
              🗺️ Vector OSM
            </button>
          </div>

          {/* LULC Overlay Toggle */}
          <button
            onClick={() => setShowLulcOverlay(!showLulcOverlay)}
            className={`px-3 py-1.5 rounded border flex items-center gap-1.5 transition-all ${
              showLulcOverlay
                ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500 font-semibold'
                : 'bg-charcoal-800 text-ivory-400 border-charcoal-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            LULC: {showLulcOverlay ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Main Map Viewport with Floating GEE Legend */}
      <div className="relative w-full h-[540px] min-h-[540px] rounded-lg overflow-hidden border border-charcoal-700 shadow-2xl bg-charcoal-950 bhumi-gis-map">
        <div ref={mapContainerRef} className="w-full h-full min-h-[540px] bhumi-gis-map" style={{ zIndex: 1 }} />

        {/* Floating Vibrant Legend (Exact Google Earth Engine Code Editor Replica) */}
        {showLulcOverlay && (
          <div className="absolute top-4 left-4 bg-charcoal-900/95 backdrop-blur-md border border-charcoal-700 rounded-lg p-3 z-30 shadow-2xl text-xs font-mono space-y-1.5 max-w-[210px]">
            <div className="flex items-center justify-between border-b border-charcoal-700/80 pb-1.5 mb-1.5">
              <span className="font-bold text-ivory-100 flex items-center gap-1.5 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                GEE LULC Classes
              </span>
              <span className="text-[10px] text-amber-400 font-bold">{selectedYear}</span>
            </div>

            <div className="space-y-1">
              {legend.map((item: any) => (
                <div key={item.code} className="flex items-center gap-2">
                  <span
                    className="w-4 h-3 rounded-sm shrink-0 border border-black/40 shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[11px] text-ivory-200">
                    <strong className="text-ivory-400">{item.code}</strong> {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Opacity Slider */}
            <div className="pt-2 border-t border-charcoal-700/80 mt-2">
              <div className="flex justify-between text-[10px] text-ivory-400 mb-0.5">
                <span>Overlay Transparency:</span>
                <span>{Math.round(lulcOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={lulcOpacity}
                onChange={(e) => setLulcOpacity(parseFloat(e.target.value))}
                className="w-full accent-forest-500 cursor-pointer h-1.5"
              />
            </div>
          </div>
        )}

        {/* Click Instruction Banner */}
        <div className="absolute bottom-4 left-4 bg-charcoal-950/90 backdrop-blur-md border border-sky-500/40 px-3.5 py-2 rounded-lg text-xs font-mono text-ivory-200 z-30 flex items-center gap-2 shadow-lg">
          <Crosshair className="w-4 h-4 text-sky-400" />
          <span>Click <strong>any village, farm, or terrain</strong> across India to inspect</span>
        </div>

        {/* Selected Region & Precision Cursor HUD */}
        <div className="absolute bottom-4 right-4 bg-charcoal-950/95 backdrop-blur-md border border-charcoal-700/80 px-3 py-1.5 rounded-lg text-xs font-mono text-ivory-300 z-30 flex items-center gap-3 shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
            <span>Active: <strong className="text-white">{clickedPoint?.village_or_town || selectedDistrict}</strong></span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-sky-400 border-l border-charcoal-700 pl-2.5">
            <Crosshair className="w-3 h-3 text-sky-400" />
            <span ref={mouseCoordsSpanRef}>--°N, --°E</span>
          </div>
        </div>
      </div>

      {/* LIVE POINT INSPECTION CARD (Appears immediately when user clicks ANY place) */}
      {clickedPoint && (
        <div className="bg-gradient-to-r from-sky-950/70 via-charcoal-800 to-charcoal-900 border border-sky-500/60 rounded-lg p-4 font-mono shadow-xl space-y-3 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-charcoal-700 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-sky-500/20 border border-sky-400 flex items-center justify-center text-sky-300 font-bold text-base shadow-sm">
                📍
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="text-sky-300 font-extrabold">{clickedPoint.village_or_town}</span>
                  <span className="text-xs text-ivory-400 font-normal">
                    ({clickedPoint.taluk_or_subdistrict}, {clickedPoint.district}, {clickedPoint.state})
                  </span>
                </h4>
                <span className="text-[10px] text-sky-400/90">
                  Exact Coordinates: [{clickedPoint.coordinates.lat}°N, {clickedPoint.coordinates.lon}°E] • Primary Crop: {clickedPoint.default_crop}
                </span>
              </div>
            </div>

            <button
              onClick={() => setClickedPoint(null)}
              className="text-ivory-400 hover:text-white p-1 rounded hover:bg-charcoal-700 transition-colors"
              title="Close inspection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="bg-charcoal-900/90 p-2.5 rounded border border-charcoal-700">
              <span className="text-[10px] text-ivory-400 block uppercase">GEE Land Cover:</span>
              <span className="font-bold text-[11px] block mt-0.5" style={{ color: clickedPoint.lulc_color }}>
                {clickedPoint.lulc_class}
              </span>
              <span className="text-[9px] text-ivory-500 block mt-1">Class {clickedPoint.lulc_code} Sentinel Model</span>
            </div>

            <div className="bg-charcoal-900/90 p-2.5 rounded border border-charcoal-700">
              <span className="text-[10px] text-ivory-400 block uppercase">14-Day Climate Stress:</span>
              <span
                className={`font-bold text-xs block mt-0.5 ${
                  clickedPoint.drought_probability >= 0.70
                    ? 'text-danger-400'
                    : clickedPoint.drought_probability >= 0.40
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {(clickedPoint.drought_probability * 100).toFixed(1)}% ({clickedPoint.risk_level})
              </span>
              <span className="text-[9px] text-ivory-500 block mt-1">Conformal Guarantee α=0.10</span>
            </div>

            <div className="bg-charcoal-900/90 p-2.5 rounded border border-charcoal-700">
              <span className="text-[10px] text-ivory-400 block uppercase">Soil Moisture (0-1m):</span>
              <span className="font-bold text-sky-400 text-xs block mt-0.5">
                {clickedPoint.soil_moisture_m3m3} m³/m³
              </span>
              <span className="text-[9px] text-ivory-500 block mt-1">FC: {clickedPoint.field_capacity} | PWP: {clickedPoint.permanent_wilting_point}</span>
            </div>

            <div className="bg-charcoal-900/90 p-2.5 rounded border border-charcoal-700">
              <span className="text-[10px] text-ivory-400 block uppercase">Sentinel-2 NDVI:</span>
              <span className="font-bold text-emerald-400 text-xs block mt-0.5">
                {clickedPoint.ndvi}
              </span>
              <span className="text-[9px] text-ivory-500 block mt-1">{clickedPoint.ndvi > 0.6 ? 'Healthy Canopy' : 'Moisture Deficit'}</span>
            </div>

            <div className="bg-charcoal-900/90 p-2.5 rounded border border-charcoal-700">
              <span className="text-[10px] text-ivory-400 block uppercase">Max Surface Temp:</span>
              <span className="font-bold text-amber-300 text-xs block mt-0.5">
                {clickedPoint.temp_max_c}°C
              </span>
              <span className="text-[9px] text-ivory-500 block mt-1">VPD: {clickedPoint.vpd_kpa} kPa Deficit</span>
            </div>

            <div className="bg-charcoal-900/90 p-2.5 rounded border border-charcoal-700">
              <span className="text-[10px] text-ivory-400 block uppercase">Soil Pedotransfer:</span>
              <span className="font-bold text-ivory-200 text-xs block mt-0.5 truncate" title={clickedPoint.soil_order}>
                {clickedPoint.soil_order.split('(')[0]}
              </span>
              <span className="text-[9px] text-ivory-500 block mt-1">Clay: {Math.round(clickedPoint.clay_fraction * 100)}% | Sand: {Math.round(clickedPoint.sand_fraction * 100)}%</span>
            </div>
          </div>

          {/* FAO-56 Irrigation & Contingency Advisory Banner */}
          {clickedPoint.irrigation_action && (
            <div className="bg-sky-950/70 border border-sky-500/50 rounded-lg p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/40">
                    🚜 FAO-56 IRRIGATION ADVISORY
                  </span>
                  <span className={`text-[11px] font-bold ${
                    clickedPoint.irrigation_urgency?.includes('CRITICAL') ? 'text-danger-400' :
                    clickedPoint.irrigation_urgency?.includes('ELEVATED') ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {clickedPoint.irrigation_urgency} ({clickedPoint.moisture_deficit_mm} mm Soil Deficit)
                  </span>
                </div>
                <p className="text-xs text-ivory-100 font-semibold">
                  {clickedPoint.irrigation_action}
                </p>
                <p className="text-[11px] text-ivory-400">
                  ⚡ <strong className="text-amber-300">Contingency Action:</strong> {clickedPoint.contingency_measure}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Google Earth Engine LULC Area Changes Graph & Model Validation Panel (Exact Replica of Screenshot 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
        {/* Left & Center: Time-Series Area Changes Graph (2019 - 2022 - 2025) */}
        <div className="lg:col-span-2 bg-charcoal-800/80 border border-charcoal-700 rounded-lg p-4 font-mono space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-charcoal-700 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-ivory-100">
                  LULC area changes 2019 - 2022 - 2025
                </h4>
              </div>
              <span className="text-[10px] text-ivory-400">
                Earth Engine Area Quantification (Hectares) across multitemporal epochs
              </span>
            </div>

            {/* Download Buttons matching GEE screenshot */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => alert('Exporting LULC area changes time series as CSV...')}
                className="px-2 py-1 text-[10px] bg-charcoal-900 border border-charcoal-600 rounded text-ivory-300 hover:text-white flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> Download CSV
              </button>
              <button
                onClick={() => alert('Exporting vector chart as SVG...')}
                className="px-2 py-1 text-[10px] bg-charcoal-900 border border-charcoal-600 rounded text-ivory-300 hover:text-white flex items-center gap-1"
              >
                Download SVG
              </button>
              <button
                onClick={() => alert('Exporting raster chart as PNG...')}
                className="px-2 py-1 text-[10px] bg-charcoal-900 border border-charcoal-600 rounded text-ivory-300 hover:text-white flex items-center gap-1"
              >
                Download PNG
              </button>
            </div>
          </div>

          {/* SVG Multi-Line Chart */}
          <div className="h-48 w-full relative pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160">
              {/* Grid Lines */}
              {[30, 60, 90, 120, 150].map((y, idx) => (
                <g key={idx}>
                  <line x1="50" y1={y} x2="480" y2={y} stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" />
                  <text x="45" y={y + 3} textAnchor="end" fill="#64748b" fontSize="8" fontFamily="monospace">
                    {Math.round((160 - y) * 260)}
                  </text>
                </g>
              ))}

              {/* X Axis Labels */}
              {[2019, 2020, 2021, 2022, 2023, 2024, 2025].map((yr, idx) => {
                const x = 60 + idx * 65;
                return (
                  <g key={yr}>
                    <line x1={x} y1="20" x2={x} y2="150" stroke="#334155" strokeWidth="0.5" />
                    <text x={x} y="158" textAnchor="middle" fill={yr === selectedYear ? '#f59e0b' : '#94a3b8'} fontSize="9" fontWeight={yr === selectedYear ? 'bold' : 'normal'} fontFamily="monospace">
                      {yr}
                    </text>
                  </g>
                );
              })}

              {/* Multi-line series for each LULC class */}
              {legend.map((cls: any) => {
                const points = areaChanges.map((rec: any, idx: number) => {
                  const x = 60 + idx * 65;
                  const val = rec[cls.label] || 15000;
                  const y = 150 - (val / 42000) * 125;
                  return `${x},${y}`;
                }).join(' ');

                return (
                  <polyline
                    key={cls.label}
                    fill="none"
                    stroke={cls.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                    opacity="0.9"
                  />
                );
              })}
            </svg>
          </div>

          {/* Interactive Class Legend Chips */}
          <div className="flex flex-wrap gap-2 pt-1 border-t border-charcoal-700/60">
            {legend.map((cls: any) => (
              <div key={cls.label} className="flex items-center gap-1.5 text-[10px] text-ivory-300">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: cls.color }} />
                <span>{cls.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Earth Engine Validation & Confusion Matrix Card (Replica of Screenshot 6) */}
        <div className="bg-charcoal-800/80 border border-charcoal-700 rounded-lg p-4 font-mono space-y-3">
          <div className="flex items-center justify-between border-b border-charcoal-700 pb-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-ivory-100">
                Earth Engine Validation
              </h4>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded">
              GEE CONSOLE
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-charcoal-700/60">
              <span className="text-ivory-400">Sample train:</span>
              <span className="text-ivory-100 font-bold">189,063 pixels</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-charcoal-700/60">
              <span className="text-ivory-400">Sample test:</span>
              <span className="text-ivory-100 font-bold">47,537 pixels</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-charcoal-700/60">
              <span className="text-ivory-400">Confusion matrix:</span>
              <span className="text-ivory-200">List (10 classes)</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-charcoal-700/60 bg-emerald-950/20 px-2 rounded">
              <span className="text-emerald-300 font-semibold">Overall Accuracy:</span>
              <span className="text-emerald-400 font-bold text-sm">0.88575 (88.58%)</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-charcoal-700/60 bg-blue-950/20 px-2 rounded">
              <span className="text-blue-300 font-semibold">Cohen's Kappa (κ):</span>
              <span className="text-blue-400 font-bold text-sm">0.87220 (0.8722)</span>
            </div>
          </div>

          <div className="pt-2">
            <div className="text-[10px] text-ivory-400 space-y-1">
              <div className="flex items-center gap-1.5 text-forest-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Algorithm: Random Forest Classifier (200 trees)</span>
              </div>
              <div>Bands: Sentinel-2 B2, B3, B4, B8, B11, B12 + S1 SAR VH/VV</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
