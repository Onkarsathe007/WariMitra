import { useState, useEffect } from 'react';
import WarkariFeed from './components/WarkariFeed';
import HelperDashboard from './components/HelperDashboard';
import LandingPage from './components/LandingPage';
import RoleSelection from './components/RoleSelection';
import GoogleLogin from './components/GoogleLogin';
import ProfileCompletion from './components/ProfileCompletion';
import { MapPin, Compass, HandHeart, LogOut } from 'lucide-react';

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
  const [currentView, setCurrentView] = useState<'explorer' | 'helper'>('explorer');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('visava_token');
    const savedUser = localStorage.getItem('visava_user');
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        if (parsedUser.profileComplete) {
          setCurrentView(parsedUser.role === 'helper' ? 'helper' : 'explorer');
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

  const handleRoleSelect = (role: 'explorer' | 'helper') => {
    if (role === 'helper') {
      setPage('google-login');
    } else {
      setPage('google-login');
    }
  };

  const handleBackToLanding = () => setPage('landing');

  const handleGoogleSuccess = (googleUser: any, googleToken: string) => {
    setUser(googleUser);
    setToken(googleToken);
    if (googleUser.profileComplete) {
      setCurrentView(googleUser.role === 'helper' ? 'helper' : 'explorer');
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
    setCurrentView(updatedUser.role === 'helper' ? 'helper' : 'explorer');
    setPage('app');
  };

  const handleLogout = () => {
    localStorage.removeItem('visava_token');
    localStorage.removeItem('visava_user');
    setUser(null);
    setToken(null);
    setPage('landing');
  };

  return (
    <>
      {page === 'landing' && <LandingPage onStart={handleStart} />}
      {page === 'role-select' && (
        <RoleSelection onSelect={handleRoleSelect} onBack={handleBackToLanding} />
      )}
      {page === 'google-login' && (
        <div className="google-login-page">
          <div className="google-login-page-bg" />
          <div className="google-login-page-content">
            <h2>Sign In to Visava</h2>
            <p>Continue with Google to start your journey</p>
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
            <button className="back-link" onClick={() => setPage('role-select')}>
              ← Back
            </button>
          </div>
        </div>
      )}
      {page === 'profile-complete' && user && token && (
        <ProfileCompletion user={user} token={token} onComplete={handleProfileComplete} />
      )}

      {page === 'app' && (
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

            {user && (
              <div className="user-menu">
                {user.avatar && (
                  <img src={user.avatar} alt={user.name} className="user-avatar" />
                )}
                <span className="user-name">{user.name}</span>
                <button className="logout-btn" onClick={handleLogout} title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>

          {currentView === 'explorer' ? <WarkariFeed /> : <HelperDashboard />}
        </>
      )}
    </>
  );
}

export default App;
