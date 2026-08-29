import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { Phone, Loader2 } from 'lucide-react';

const CORE_API_URL = 'http://localhost:3000/api/v1';

const createIcon = (color: string, iconUrl: string) => {
  return new L.DivIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.4); font-size: 20px;">${iconUrl}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

const ICONS = {
  camp: createIcon('#f97316', '⛺'),
  service: createIcon('#3b82f6', '🍲'),
  report: createIcon('#ef4444', '⚠️')
};

interface LocationPoint {
  member_id: string;
  latitude: number;
  longitude: number;
  distance: number;
  entity_type: string;
}

export default function MainExplorerMap() {
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [richDetails, setRichDetails] = useState<Record<string, any>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});

  const fetchLocations = useCallback(async () => {
    try {
      const [campsRes, servicesRes, reportsRes] = await Promise.all([
        axios.get(`${CORE_API_URL}/camps`),
        axios.get(`${CORE_API_URL}/services`),
        axios.get(`${CORE_API_URL}/reports`)
      ]);

      const allLocations: LocationPoint[] = [];

      campsRes.data.camps.forEach((camp: any) => {
        if (camp.location && camp.location.coordinates) {
          allLocations.push({
            member_id: camp._id,
            latitude: camp.location.coordinates[1],
            longitude: camp.location.coordinates[0],
            distance: 0,
            entity_type: 'camp'
          });
        }
      });

      servicesRes.data.services.forEach((service: any) => {
        if (service.location && service.location.coordinates) {
          allLocations.push({
            member_id: service._id,
            latitude: service.location.coordinates[1],
            longitude: service.location.coordinates[0],
            distance: 0,
            entity_type: 'service'
          });
        }
      });

      reportsRes.data.reports.forEach((report: any) => {
        if (report.location && report.location.coordinates) {
          allLocations.push({
            member_id: report._id,
            latitude: report.location.coordinates[1],
            longitude: report.location.coordinates[0],
            distance: 0,
            entity_type: 'report'
          });
        }
      });

      setLocations(allLocations);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
    const interval = setInterval(fetchLocations, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, [fetchLocations]);

  const loadRichDetails = async (loc: LocationPoint) => {
    if (richDetails[loc.member_id] || loadingDetails[loc.member_id]) return;
    
    setLoadingDetails(prev => ({ ...prev, [loc.member_id]: true }));
    try {
      const route = loc.entity_type === 'camp' ? 'camps' : loc.entity_type === 'service' ? 'services' : 'reports';
      const res = await axios.get(`${CORE_API_URL}/${route}/${loc.member_id}`);
      const data = res.data.camp || res.data.service || res.data.report;
      setRichDetails(prev => ({ ...prev, [loc.member_id]: data }));
    } catch (e) {
      console.error("Could not fetch rich details for", loc.member_id);
    } finally {
      setLoadingDetails(prev => ({ ...prev, [loc.member_id]: false }));
    }
  };

  return (
    <>
      <MapContainer 
        center={[17.6772, 75.3236]} 
        zoom={15} 
        zoomControl={true}
        style={{ width: '100vw', height: '100vh', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {locations.map((loc) => {
          const detail = richDetails[loc.member_id];
          const isLoading = loadingDetails[loc.member_id];
          
          return (
            <Marker 
              key={loc.member_id} 
              position={[loc.latitude, loc.longitude]}
              icon={ICONS[loc.entity_type as keyof typeof ICONS] || ICONS.camp}
              eventHandlers={{
                click: () => loadRichDetails(loc)
              }}
            >
              <Popup>
                <div style={{ minWidth: '220px' }}>
                  {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Loader2 className="lucide-spin" size={24} /></div>}
                  
                  {detail && !isLoading && (
                    <>
                      {detail.media && detail.media.length > 0 && (
                        <img src={detail.media[0]} alt="Location" className="popup-img" />
                      )}
                      
                      <h3 style={{ margin: '0 0 4px 0', color: loc.entity_type === 'report' ? '#ef4444' : '#f97316' }}>
                        {detail.name || (loc.entity_type === 'report' && '⚠️ Emergency Report')}
                      </h3>
                      
                      {detail.type && (
                        <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', color: '#94a3b8' }}>
                          {detail.type.replace('_', ' ').toUpperCase()}
                        </span>
                      )}
                      
                      <p style={{ marginTop: '12px', fontSize: '0.95rem', lineHeight: '1.4' }}>{detail.description}</p>
                      
                      {(detail.contactPhone || detail.reporterPhone) && (
                        <a href={`tel:${detail.contactPhone || detail.reporterPhone}`} className="contact-btn">
                          <Phone size={16} /> {detail.contactPhone || detail.reporterPhone}
                        </a>
                      )}
                    </>
                  )}
                  
                  {!detail && !isLoading && (
                    <p style={{ color: '#94a3b8' }}>Details not available.</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </>
  );
}
