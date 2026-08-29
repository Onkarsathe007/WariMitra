import { useEffect, useState } from 'react';
import { Droplets, Utensils, Baby, ArrowRight, X } from 'lucide-react';
import { fetchCamps } from '../services/api';
import type { Service } from '../types';
import './NearestCampCard.css';

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; 
}

interface NearestCampCardProps {
  activeLocation?: Service | null;
  onClose?: () => void;
}

export const NearestCampCard = ({ activeLocation, onClose }: NearestCampCardProps = {}) => {
  const [nearestCamp, setNearestCamp] = useState<Service | null>(null);
  const [distance, setDistance] = useState<string>("Calculating...");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (activeLocation) {
      setVisible(true);
    }
  }, [activeLocation]);

  useEffect(() => {
    const loadNearestCamp = async () => {
      try {
        const camps = await fetchCamps();
        if (camps.length === 0) {
          setNearestCamp({
            _id: 'mock',
            name: 'Shri Gajanan Maharaj Annachhatra',
            type: 'camp',
            location: { type: 'Point', coordinates: [75.321, 17.675] },
            available: true,
            media: [],
            verified: true
          });
          setDistance("850 m");
          return;
        }

        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const userLat = pos.coords.latitude;
              const userLng = pos.coords.longitude;
              let closest: Service | null = null;
              let minDistance = Infinity;

              camps.forEach(camp => {
                if (camp.location?.coordinates) {
                  const campLng = camp.location.coordinates[0];
                  const campLat = camp.location.coordinates[1];
                  const dist = getDistanceFromLatLonInKm(userLat, userLng, campLat, campLng);
                  if (dist < minDistance) {
                    minDistance = dist;
                    closest = camp;
                  }
                }
              });

              if (closest) {
                setNearestCamp(closest);
                if (minDistance < 1) {
                  setDistance(`${Math.round(minDistance * 1000)} m`);
                } else {
                  setDistance(`${minDistance.toFixed(1)} km`);
                }
              }
            },
            () => {
              setNearestCamp(camps[0]);
              setDistance("850 m");
            }
          );
        } else {
          setNearestCamp(camps[0]);
          setDistance("850 m");
        }
      } catch (err) {
        console.error("Failed to load nearest camp", err);
      }
    };
    loadNearestCamp();
  }, []);

  const displayCamp = activeLocation || nearestCamp;

  if (!visible || !displayCamp) return null;

  return (
    <div className="nearest-camp-card glass-panel">
      <button className="close-btn" aria-label="Close card" onClick={() => {
        setVisible(false);
        if (onClose) onClose();
      }}>
        <X size={16} />
      </button>
      
      <div className="camp-header">
        <h3 className="camp-title">{displayCamp.name || (activeLocation ? 'Location Details' : 'Nearest Camp')}</h3>
        <div className="camp-meta">
          <span>{activeLocation ? (displayCamp.city || 'Pandharpur') : distance + ' away'}</span>
          <span className="dot">•</span>
          <span className={`status ${displayCamp.available ? 'open' : 'closed'}`}>
            {displayCamp.available ? 'Open' : 'Closed'}
          </span>
        </div>
      </div>

      <div className="facilities-row">
        {activeLocation ? (
          <div className="facility-item" style={{ flex: 1, padding: '8px', opacity: 0.8 }}>
            <span style={{ fontSize: '13px', lineHeight: '1.4' }}>
              {displayCamp.description || 'Details are available for this location.'}
            </span>
          </div>
        ) : (
          <>
            <div className="facility-item">
              <div className="facility-icon water">
                <Droplets size={16} />
              </div>
              <span className="facility-label">Water</span>
            </div>
            <div className="facility-item">
              <div className="facility-icon food">
                <Utensils size={16} />
              </div>
              <span className="facility-label">Food</span>
            </div>
            <div className="facility-item">
              <div className="facility-icon toilet">
                <Baby size={16} />
              </div>
              <span className="facility-label">Toilets</span>
            </div>
          </>
        )}
      </div>

      {activeLocation && displayCamp.contactPhone ? (
        <a href={`tel:${displayCamp.contactPhone}`} className="view-details-btn" style={{ textDecoration: 'none', background: 'var(--color-green-open)', borderColor: 'var(--color-green-open)' }}>
          <span style={{ color: 'white' }}>Call {displayCamp.contactPhone}</span>
          <ArrowRight size={18} strokeWidth={2.5} color="white" />
        </a>
      ) : (
        <button className="view-details-btn">
          <span>View Details</span>
          <ArrowRight size={18} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
};
