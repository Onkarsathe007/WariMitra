import React, { useEffect, useState } from 'react';
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

export const NearestCampCard: React.FC = () => {
  const [nearestCamp, setNearestCamp] = useState<Service | null>(null);
  const [distance, setDistance] = useState<string>("Calculating...");
  const [visible, setVisible] = useState(true);

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

  if (!visible || !nearestCamp) return null;

  return (
    <div className="nearest-camp-card glass-panel">
      <button className="close-btn" aria-label="Close card" onClick={() => setVisible(false)}>
        <X size={16} />
      </button>
      
      <div className="camp-header">
        <h3 className="camp-title">{nearestCamp.name || 'Nearest Camp'}</h3>
        <div className="camp-meta">
          <span>{distance} away</span>
          <span className="dot">•</span>
          <span className={`status ${nearestCamp.available ? 'open' : 'closed'}`}>
            {nearestCamp.available ? 'Open' : 'Closed'}
          </span>
        </div>
      </div>

      <div className="facilities-row">
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
      </div>

      <button className="view-details-btn">
        <span>View Details</span>
        <ArrowRight size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
};
