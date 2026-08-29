import { useState } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { MapView } from './components/MapView';
import { MapControls } from './components/MapControls';
import { NearestCampCard } from './components/NearestCampCard';
import { BottomNavigation } from './components/BottomNavigation';
import { ProfilePage } from './components/ProfilePage';
import { OfferHelpPage } from './components/OfferHelpPage';

export type TabType = 'map' | 'explore' | 'help' | 'profile';

function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('map');

  return (
    <div className="app-container">
      {/* Map and its UI are always rendered but visually hidden by overlays when inactive */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <MapView />
        <div className="ui-layer" style={{ display: currentTab === 'map' ? 'flex' : 'none' }}>
          <Header />
          <SearchBar />
          <MapControls />
          <NearestCampCard />
        </div>
      </div>

      {/* Profile Page Overlay */}
      {currentTab === 'profile' && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }}>
          <ProfilePage />
        </div>
      )}

      {/* Offer Help Overlay */}
      {currentTab === 'help' && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }}>
          <OfferHelpPage />
        </div>
      )}

      {currentTab === 'explore' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
          <p className="text-secondary glass-panel" style={{ padding: '8px 16px', pointerEvents: 'auto' }}>Coming Soon</p>
        </div>
      )}

      {/* Global Navigation Overlay */}
      <div className="ui-layer" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 100 }}>
        <BottomNavigation currentTab={currentTab} onTabChange={setCurrentTab} />
      </div>
    </div>
  );
}

export default App;
