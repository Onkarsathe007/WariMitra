import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import RoleSelection from './components/RoleSelection';
import GoogleLogin from './components/GoogleLogin';
import ProfileCompletion from './components/ProfileCompletion';
import { MapView } from './components/MapView';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { MapControls } from './components/MapControls';
import { NearestCampCard } from './components/NearestCampCard';
import { BottomNavigation } from './components/BottomNavigation';
import { ProfilePage } from './components/ProfilePage';
import { OfferHelpPage } from './components/OfferHelpPage';
import { HelperDashboard } from './components/helper-dashboard/HelperDashboard';
import { NotificationProvider } from './context/NotificationContext';
import type { TabType } from './types';

type Page = 'landing' | 'role-select' | 'google-login' | 'profile-complete' | 'app';

interface User {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
  role: 'varkari' | 'helper' | 'admin';
  age?: number;
  gender?: string;
  city?: string;
  profileComplete: boolean;
}

function App() {
  const [page, setPage] = useState<Page>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<TabType>('map');
  const [activeLocation, setActiveLocation] = useState<any>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('visava_token');
    const savedUser = localStorage.getItem('visava_user');
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        if (parsedUser.profileComplete) {
          setPage('app');
        } else {
          setPage('profile-complete');
        }
      } catch {
        localStorage.removeItem('visava_token');
        localStorage.removeItem('visava_user');
      }
    }
  }, []);

  const handleStart = () => setPage('role-select');

  const handleRoleSelect = (_role: 'explorer' | 'helper') => {
    setPage('google-login');
  };

  const handleBackToLanding = () => setPage('landing');

  const handleGoogleSuccess = (googleUser: User, googleToken: string) => {
    setUser(googleUser);
    setToken(googleToken);
    if (googleUser.profileComplete) {
      setPage('app');
    } else {
      setPage('profile-complete');
    }
  };

  const handleGoogleError = (error: string) => {
    console.error('Google login error:', error);
    alert(error);
  };

  const handleProfileComplete = (updatedUser: User) => {
    setUser(updatedUser);
    setPage('app');
  };

  const handleLogout = () => {
    localStorage.removeItem('visava_token');
    localStorage.removeItem('visava_user');
    setUser(null);
    setToken(null);
    setPage('landing');
  };

  if (page === 'landing') {
    return <LandingPage onStart={handleStart} />;
  }

  if (page === 'role-select') {
    return <RoleSelection onSelect={handleRoleSelect} onBack={handleBackToLanding} />;
  }

  if (page === 'google-login') {
    return (
      <div className="google-login-page">
        <div className="google-login-page-bg" />
        <div className="google-login-page-content">
          <h2>Sign In to Visava</h2>
          <p>Continue with Google to start your journey</p>
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
          <button className="back-link" onClick={() => setPage('role-select')}>
            Back
          </button>
        </div>
      </div>
    );
  }

  if (page === 'profile-complete' && user && token) {
    return <ProfileCompletion user={user} token={token} onComplete={handleProfileComplete} />;
  }

  if (user?.role === 'helper') {
    return <HelperDashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <NotificationProvider>
      <div className="app-container">
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
          <MapView onMarkerClick={setActiveLocation} />
          <div className="ui-layer" style={{ display: currentTab === 'map' ? 'flex' : 'none' }}>
            <Header />
            <SearchBar />
            <MapControls />
            <NearestCampCard activeLocation={activeLocation} onClose={() => setActiveLocation(null)} />
          </div>
        </div>

        {currentTab === 'profile' && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }}>
            <ProfilePage user={user} onLogout={handleLogout} />
          </div>
        )}

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

        <div className="ui-layer" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 100 }}>
          <BottomNavigation currentTab={currentTab} onTabChange={setCurrentTab} />
        </div>
      </div>
    </NotificationProvider>
  );
}

export default App;
