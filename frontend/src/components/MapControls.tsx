import { LocateFixed } from 'lucide-react';
import './MapControls.css';

export const MapControls = () => {
  return (
    <div className="map-controls-container">
      <button className="map-control-btn glass-panel" aria-label="Locate me">
        <LocateFixed size={20} strokeWidth={2.5} className="map-control-icon" />
      </button>
    </div>
  );
};
