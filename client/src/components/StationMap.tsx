import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import type { Alert } from "@/types";

interface StationMapProps {
  stationId?: number;
  alerts: Alert[];
}

export default function StationMap({ stationId, alerts }: StationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return;
      
      // Check if Leaflet is already loaded
      if ((window as any).L) {
        initializeMap();
        return;
      }

      // Load Leaflet CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Load Leaflet JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initializeMap;
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current || leafletMapRef.current) return;

      const L = (window as any).L;
      if (!L) return;

      // Initialize map centered on New Delhi Railway Station
      const map = L.map(mapRef.current).setView([28.6448, 77.2097], 16);
      leafletMapRef.current = map;

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Add markers for alerts
      alerts.forEach((alert, index) => {
        if (alert.location?.latitude && alert.location?.longitude) {
          const markerColor = getMarkerColor(alert.severity);
          const markerIcon = getMarkerIcon(alert.type);
          
          const marker = L.marker([alert.location.latitude, alert.location.longitude])
            .addTo(map)
            .bindPopup(`
              <div class="p-2">
                <h4 class="font-semibold text-sm">${alert.title}</h4>
                <p class="text-xs text-gray-600">${alert.description || ''}</p>
                <p class="text-xs text-gray-500 mt-1">
                  ${alert.platformNumber ? `Platform ${alert.platformNumber}` : ''}
                  ${alert.coachNumber ? ` • Coach ${alert.coachNumber}` : ''}
                </p>
                <div class="mt-2">
                  <span class="px-2 py-1 text-xs rounded-full bg-${markerColor}-100 text-${markerColor}-800">
                    ${alert.severity.toUpperCase()}
                  </span>
                </div>
              </div>
            `);
        } else {
          // Add markers at random positions around the station for demo
          const lat = 28.6448 + (Math.random() - 0.5) * 0.002;
          const lng = 77.2097 + (Math.random() - 0.5) * 0.002;
          
          const marker = L.marker([lat, lng])
            .addTo(map)
            .bindPopup(`
              <div class="p-2">
                <h4 class="font-semibold text-sm">${alert.title}</h4>
                <p class="text-xs text-gray-600">${alert.description || ''}</p>
                <p class="text-xs text-gray-500 mt-1">
                  ${alert.platformNumber ? `Platform ${alert.platformNumber}` : ''}
                  ${alert.coachNumber ? ` • Coach ${alert.coachNumber}` : ''}
                </p>
              </div>
            `);
        }
      });
    };

    loadLeaflet();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [alerts, stationId]);

  const getMarkerColor = (severity: string) => {
    const colors = {
      low: 'green',
      medium: 'yellow',
      high: 'orange',
      critical: 'red'
    };
    return colors[severity as keyof typeof colors] || 'blue';
  };

  const getMarkerIcon = (type: string) => {
    const icons = {
      medical: 'heartbeat',
      crowd: 'users',
      safety: 'shield-alt',
      security: 'video'
    };
    return icons[type as keyof typeof icons] || 'exclamation';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Live Station Map</h3>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 text-sm bg-railway-blue text-white rounded-full">Live</span>
            <Button variant="ghost" size="sm">
              <i className="fas fa-expand-arrows-alt"></i>
            </Button>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div 
          ref={mapRef}
          className="h-96 bg-gray-100 rounded-lg relative"
        >
          {/* Fallback content while map loads */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <i className="fas fa-map-marked-alt text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-600">Interactive Station Map</p>
              <p className="text-sm text-gray-500">Loading real-time data...</p>
            </div>
          </div>
        </div>
        
        {/* Map Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                defaultChecked 
                className="rounded border-gray-300 text-railway-blue focus:ring-railway-blue"
              />
              <span className="text-sm text-gray-700">Show Crowd Density</span>
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                defaultChecked 
                className="rounded border-gray-300 text-railway-blue focus:ring-railway-blue"
              />
              <span className="text-sm text-gray-700">Show Emergencies</span>
            </div>
          </div>
          <Button variant="link" className="text-railway-blue">
            View Full Screen
          </Button>
        </div>

        {/* Platform Status Legend */}
        <div className="mt-4 bg-white rounded-lg shadow-sm border p-3">
          <h4 className="font-medium text-sm mb-2">Platform Status</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-safe-green rounded-full"></div>
              <span>Normal (1-3)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-alert-orange rounded-full"></div>
              <span>Crowded (4-5)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-danger-red rounded-full animate-pulse"></div>
              <span>Critical (6)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
