import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

interface LocationPickerMapProps {
  onLocationSelected: (lat: number, lng: number) => void;
  defaultLocation?: { lat: number, lng: number };
}

const customIcon = new L.DivIcon({
  className: 'custom-icon',
  html: `<div style="background-color: #10b981; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.4); font-size: 16px;">📍</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Helper component to recenter map when default location changes (e.g. geolocation)
function MapUpdater({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);
  return null;
}

export default function LocationPickerMap({ onLocationSelected, defaultLocation }: LocationPickerMapProps) {
  const [position, setPosition] = useState<{lat: number, lng: number} | null>(defaultLocation || null);

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onLocationSelected(e.latlng.lat, e.latlng.lng);
      }
    });
    return null;
  };

  return (
    <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--panel-border)' }}>
      <MapContainer 
        center={defaultLocation ? [defaultLocation.lat, defaultLocation.lng] : [17.6772, 75.3236]} 
        zoom={14} 
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents />
        <MapUpdater center={position ? [position.lat, position.lng] : null} />
        {position && <Marker position={[position.lat, position.lng]} icon={customIcon} />}
      </MapContainer>
    </div>
  );
}
