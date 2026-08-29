import { Map, Compass, HelpingHand, User } from 'lucide-react';
import type { TabType } from '../types';
import './BottomNavigation.css';

interface BottomNavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNavigation = ({ currentTab, onTabChange }: BottomNavigationProps) => {
  return (
    <div className="bottom-nav-container" style={{ pointerEvents: 'auto' }}>
      <nav className="bottom-nav glass-panel">
        <button 
          className={`nav-item ${currentTab === 'map' ? 'active' : 'inactive'}`} 
          onClick={() => onTabChange('map')}
          aria-label="Map"
        >
          <Map size={22} strokeWidth={currentTab === 'map' ? 2.5 : 2} />
          <span className="nav-label">Map</span>
        </button>
        <button 
          className={`nav-item ${currentTab === 'explore' ? 'active' : 'inactive'}`}
          onClick={() => onTabChange('explore')}
          aria-label="Explore"
        >
          <Compass size={22} strokeWidth={currentTab === 'explore' ? 2.5 : 2} />
          <span className="nav-label">Explore</span>
        </button>
        <button 
          className={`nav-item ${currentTab === 'help' ? 'active' : 'inactive'}`}
          onClick={() => onTabChange('help')}
          aria-label="Help"
        >
          <HelpingHand size={22} strokeWidth={currentTab === 'help' ? 2.5 : 2} />
          <span className="nav-label">Help</span>
        </button>
        <button 
          className={`nav-item ${currentTab === 'profile' ? 'active' : 'inactive'}`}
          onClick={() => onTabChange('profile')}
          aria-label="Profile"
        >
          <User size={22} strokeWidth={currentTab === 'profile' ? 2.5 : 2} />
          <span className="nav-label">Profile</span>
        </button>
      </nav>
    </div>
  );
};
