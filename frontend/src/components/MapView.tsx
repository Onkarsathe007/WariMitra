import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Phone, MapPin } from 'lucide-react';
import { fetchServices, fetchCamps } from '../services/api';
import { GeoWebSocket } from '../services/websocket';
import type { Service, UserLocation } from '../types';
import './MapView.css';

const createCustomIcon = (color: string, iconHtml: string, label: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="marker-container">
        <div class="marker-pin" style="background-color: ${color}">
          ${iconHtml}
          <div class="marker-pin-tail" style="border-top-color: ${color}"></div>
        </div>
        <div class="marker-label-pill glass-panel">
          ${label}
        </div>
      </div>
    `,
    iconSize: [120, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

const iconMap = {
  camp: createCustomIcon('var(--color-orange-camp)', '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 20 10 4M5 20l9-16M3 20h18M12 15v5"/></svg>', 'Camp'), 
  medical: createCustomIcon('var(--color-red-medical)', '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/></svg>', 'Medical'), 
  water: createCustomIcon('var(--color-blue-water)', '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>', 'Water'),
  food: createCustomIcon('var(--color-green-open)', '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>', 'Food'),
  toilet: createCustomIcon('var(--color-purple-toilet)', '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 22V12h6v10M8 22H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4"/></svg>', 'Toilet'),
  helper: createCustomIcon('var(--color-yellow-helper)', '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg>', 'Helper'),
  other: createCustomIcon('var(--text-muted)', '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>', 'Service')
};

export const MapView = ({ onMarkerClick }: { onMarkerClick?: (service: Service) => void }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [liveUsers, setLiveUsers] = useState<Record<string, UserLocation>>({});
  const [userPos, setUserPos] = useState<[number, number]>([17.675, 75.321]);
  
  const wsRef = useRef<GeoWebSocket | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [campsRes, servicesRes] = await Promise.all([fetchCamps(), fetchServices()]);
      const combined = [...(campsRes || []), ...(servicesRes || [])];
      const validServices = combined.filter(s => 
        s.location && s.location.coordinates && s.location.coordinates.length === 2
      );
      setServices(validServices);
    };
    
    loadData();

    const wariId = 'wari-live'; 
    wsRef.current = new GeoWebSocket(wariId, (location) => {
      if (location.userId) {
        setLiveUsers(prev => ({ ...prev, [location.userId!]: location }));
      }
    });
    wsRef.current.connect();

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserPos([lat, lng]);
          wsRef.current?.sendLocation(lat, lng);
        },
        (err) => console.log('Geolocation error:', err),
        { enableHighAccuracy: true }
      );
    }

    return () => {
      wsRef.current?.disconnect();
    };
  }, []);

  const userIcon = L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="user-marker-container">
        <div class="user-dot-pulse"></div>
        <div class="user-dot">
           <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
        </div>
        <div class="user-label-pill glass-panel">You are here</div>
      </div>
    `,
    iconSize: [120, 40],
    iconAnchor: [20, 20]
  });

  const getIconForType = (type: string) => {
    return iconMap[type as keyof typeof iconMap] || iconMap.other;
  };

  return (
    <div className="map-container">
      <MapContainer 
        center={userPos} 
        zoom={14} 
        zoomControl={false} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <Marker position={userPos} icon={userIcon} />

        {Object.values(liveUsers).map((u, i) => (
          <Marker key={u.userId || i} position={[u.lat, u.lng]} icon={iconMap.helper} />
        ))}

        {services.map(s => {
          const lat = s.location.coordinates[1];
          const lng = s.location.coordinates[0];
          
          return (
            <Marker 
              key={s._id} 
              position={[lat, lng]} 
              icon={getIconForType(s.type)}
              eventHandlers={{ click: () => onMarkerClick && onMarkerClick(s) }}
            >
              <Popup className="custom-popup">
                <div className="p-2">
                  {s.media && s.media.length > 0 && (
                    <img src={s.media[0]} alt="Service" className="popup-img" />
                  )}
                  <h3 className="font-bold mb-1" style={{ fontSize: '14px', margin: '0 0 4px 0', color: s.type === 'medical' ? 'var(--color-red-medical)' : 'var(--color-orange-camp)' }}>{s.name}</h3>
                  
                  {s.city && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      <MapPin size={12} /> {s.city}
                    </div>
                  )}

                  <p className="text-secondary" style={{ fontSize: '12px', margin: '0 0 12px 0', lineHeight: '1.4' }}>{s.description || 'No description available.'}</p>
                  
                  {s.contactPhone && (
                    <a href={`tel:${s.contactPhone}`} className="contact-btn" style={{ fontSize: '12px', padding: '6px' }}>
                      <Phone size={14} /> {s.contactPhone}
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
