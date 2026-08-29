import React, { useState } from 'react';
import WarkariFeed from './components/WarkariFeed';
import HelperDashboard from './components/HelperDashboard';
import { MapPin, Compass, HandHeart } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<'explorer' | 'helper'>('explorer');

  return (
    <>
      <div className="header glass-panel">
        <MapPin color="#f97316" size={28} />
        <h1>Visava Wari Map</h1>
        
        <div className="role-toggle">
          <button 
            className={`role-btn ${currentView === 'explorer' ? 'active' : ''}`}
            onClick={() => setCurrentView('explorer')}
          >
            <Compass size={18} /> Warkari Explorer
          </button>
          <button 
            className={`role-btn ${currentView === 'helper' ? 'active' : ''}`}
            onClick={() => setCurrentView('helper')}
          >
            <HandHeart size={18} /> Helper Portal
          </button>
        </div>
      </div>

      {currentView === 'explorer' ? <WarkariFeed /> : <HelperDashboard />}
    </>
  );
}

export default App;
