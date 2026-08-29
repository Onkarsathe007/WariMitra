import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { Phone, Loader2, Utensils, Tent, AlertTriangle, Layers } from 'lucide-react';

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

// Map updater to fly to a location when a card is clicked
function FlyToLocation({ target }: { target: { lat: number, lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 16, { duration: 1.5 });
    }
  }, [target, map]);
  return null;
}

export default function WarkariFeed() {
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [richDetails, setRichDetails] = useState<Record<string, any>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});
  
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [focusedLocation, setFocusedLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const popupRefs = useRef<Record<string, L.Marker | null>>({});

  const fetchLocations = useCallback(async () => {
    try {
      const [campsRes, servicesRes, reportsRes] = await Promise.all([
        axios.get(`${CORE_API_URL}/camps`),
        axios.get(`${CORE_API_URL}/services`),
        axios.get(`${CORE_API_URL}/reports`)
      ]);

      const allLocations: LocationPoint[] = [];

      campsRes.data.camps.forEach((camp: any) => {
        if (camp.location?.coordinates) {
          allLocations.push({ member_id: camp._id, latitude: camp.location.coordinates[1], longitude: camp.location.coordinates[0], distance: 0, entity_type: 'camp' });
          setRichDetails(prev => ({ ...prev, [camp._id]: camp }));
        }
      });

      servicesRes.data.services.forEach((service: any) => {
        if (service.location?.coordinates) {
          allLocations.push({ member_id: service._id, latitude: service.location.coordinates[1], longitude: service.location.coordinates[0], distance: 0, entity_type: 'service' });
          setRichDetails(prev => ({ ...prev, [service._id]: service }));
        }
      });

      reportsRes.data.reports.forEach((report: any) => {
        if (report.location?.coordinates) {
          allLocations.push({ member_id: report._id, latitude: report.location.coordinates[1], longitude: report.location.coordinates[0], distance: 0, entity_type: 'report' });
          setRichDetails(prev => ({ ...prev, [report._id]: report }));
        }
      });

      setLocations(allLocations);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
    const interval = setInterval(fetchLocations, 10000);
    return () => clearInterval(interval);
  }, [fetchLocations]);

  const filteredLocations = locations.filter(loc => activeFilter === 'all' || loc.entity_type === activeFilter);

  const handleCardClick = (loc: LocationPoint) => {
    setFocusedLocation({ lat: loc.latitude, lng: loc.longitude });
    const marker = popupRefs.current[loc.member_id];
    if (marker) {
      marker.openPopup();
    }
  };

  return (
    <div className="warkari-feed-container">
      {/* Left Sidebar: Feed List */}
      <div className="feed-sidebar glass-panel">
        <h2 style={{ padding: '0 20px', margin: '20px 0 10px 0' }}>Explore Pandharpur</h2>
        
        <div className="feed-filters">
          <button className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>
            <Layers size={16} /> All
          </button>
          <button className={`filter-btn ${activeFilter === 'camp' ? 'active' : ''}`} onClick={() => setActiveFilter('camp')}>
            <Tent size={16} /> Camps
          </button>
          <button className={`filter-btn ${activeFilter === 'service' ? 'active' : ''}`} onClick={() => setActiveFilter('service')}>
            <Utensils size={16} /> Food
          </button>
          <button className={`filter-btn ${activeFilter === 'report' ? 'active' : ''}`} onClick={() => setActiveFilter('report')}>
            <AlertTriangle size={16} /> Alerts
          </button>
        </div>

        <div className="feed-list">
          {filteredLocations.map(loc => {
            const detail = richDetails[loc.member_id];
            if (!detail) return null;

            return (
              <div key={loc.member_id} className="feed-card" onClick={() => handleCardClick(loc)}>
                {detail.media && detail.media.length > 0 ? (
                  <img src={detail.media[0].startsWith('http') ? detail.media[0] : `http://localhost:3000${detail.media[0]}`} alt="Location" className="feed-card-img" />
                ) : (
                  <div className="feed-card-img-placeholder">
                    {loc.entity_type === 'camp' ? '⛺' : loc.entity_type === 'service' ? '🍲' : '⚠️'}
                  </div>
                )}
                <div className="feed-card-content">
                  <div className="feed-card-type">{loc.entity_type.toUpperCase()}</div>
                  <h3>{detail.name || (loc.entity_type === 'report' && 'Emergency Report')}</h3>
                  <p className="feed-card-desc">{detail.description?.substring(0, 80)}...</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Side: Interactive Map */}
      <div className="feed-map">
        <MapContainer 
          center={[17.6772, 75.3236]} 
          zoom={15} 
          zoomControl={true}
          style={{ width: '100%', height: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FlyToLocation target={focusedLocation} />

          {filteredLocations.map((loc) => {
            const detail = richDetails[loc.member_id];
            return (
              <Marker 
                key={loc.member_id} 
                position={[loc.latitude, loc.longitude]}
                icon={ICONS[loc.entity_type as keyof typeof ICONS] || ICONS.camp}
                ref={(r) => { popupRefs.current[loc.member_id] = r; }}
              >
                <Popup>
                  <div style={{ minWidth: '220px' }}>
                    {detail && (
                      <>
                        {detail.media && detail.media.length > 0 && (
                          <img src={detail.media[0].startsWith('http') ? detail.media[0] : `http://localhost:3000${detail.media[0]}`} alt="Location" className="popup-img" />
                        )}
                        <h3 style={{ margin: '0 0 4px 0', color: loc.entity_type === 'report' ? '#ef4444' : '#f97316' }}>
                          {detail.name || (loc.entity_type === 'report' && '⚠️ Emergency Report')}
                        </h3>
                        <p style={{ marginTop: '12px', fontSize: '0.95rem', lineHeight: '1.4' }}>{detail.description}</p>
                        {(detail.contactPhone || detail.reporterPhone) && (
                          <a href={`tel:${detail.contactPhone || detail.reporterPhone}`} className="contact-btn">
                            <Phone size={16} /> {detail.contactPhone || detail.reporterPhone}
                          </a>
                        )}
                      </>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
