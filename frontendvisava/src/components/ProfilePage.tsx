import React, { useState, useEffect } from 'react';
import { 
  Settings, Edit2, Calendar, Activity, MapPin, User, 
  Droplets, Tent, ShieldCheck, ChevronRight, Globe, Palette, 
  PhoneCall, Accessibility, Info, Sun, Moon 
} from 'lucide-react';
import { Header } from './Header';
import './ProfilePage.css';

const MOCK_USER = {
  name: 'Pruthvi Jadhav',
  age: 21,
  wariSince: 2023,
  from: 'Solapur, MH',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=240&q=80',
};

export const ProfilePage: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    
    if (nextTheme === 'dark') {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    
    localStorage.setItem('theme', nextTheme);
  };

  return (
    <div className="profile-page">
      <div className="profile-background"></div>
      
      <Header 
        showGreeting={false} 
        transparentBg={true} 
        rightAction={
          <button className="settings-btn glass-panel" aria-label="Settings">
            <Settings size={20} />
          </button>
        } 
      />
      
      <div className="profile-content animate-fade-in">
        
        {/* Hero Area */}
        <section className="profile-hero">
          <div className="avatar-container">
            <img src={MOCK_USER.avatarUrl} alt={MOCK_USER.name} className="avatar-image" />
            <button className="edit-avatar-btn" aria-label="Edit Profile">
              <Edit2 size={14} strokeWidth={3} />
            </button>
          </div>
          <h2 className="profile-name">{MOCK_USER.name}</h2>
          <div className="warkari-status">
            <span className="status-dot"></span>
            Warkari
            <span className="status-dot"></span>
          </div>
        </section>

        {/* Summary Card */}
        <div className="summary-card glass-panel-solid">
          <div className="summary-item">
            <Calendar size={18} className="text-muted" />
            <div className="summary-item-content">
              <span className="summary-label">Age</span>
              <span className="summary-value">{MOCK_USER.age} Years</span>
            </div>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-item" style={{ justifyContent: 'center' }}>
            <Activity size={18} className="text-muted" />
            <div className="summary-item-content">
              <span className="summary-label">Wari Since</span>
              <span className="summary-value">{MOCK_USER.wariSince}</span>
            </div>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-item" style={{ justifyContent: 'flex-end' }}>
            <MapPin size={18} className="text-muted" />
            <div className="summary-item-content">
              <span className="summary-label">From</span>
              <span className="summary-value">{MOCK_USER.from}</span>
            </div>
          </div>
        </div>

        {/* Personalization Card */}
        <div className="personalization-card glass-panel-solid">
          <div className="personalization-header">
            <div className="personalization-icon">
              <User size={20} strokeWidth={2.5} />
            </div>
            <div className="personalization-text">
              <h3>Personalized for you</h3>
              <p>We use your age & preferences to show what matters most during your Wari.</p>
            </div>
          </div>
          <div className="chips-container">
            <div className="chip">
              <Droplets size={14} className="chip-blue" strokeWidth={2.5} />
              Stay Hydrated
            </div>
            <div className="chip">
              <Tent size={14} className="chip-orange" strokeWidth={2.5} />
              Nearby Camps
            </div>
            <div className="chip">
              <ShieldCheck size={14} className="chip-green" strokeWidth={2.5} />
              Rest & Safety
            </div>
            <div className="chip chip-gray">
              +2
            </div>
          </div>
        </div>

        {/* Settings Surface */}
        <div className="settings-surface glass-panel-solid">
          
          <div className="settings-row">
            <div className="settings-icon icon-orange">
              <User size={20} />
            </div>
            <div className="settings-text">
              <h4>Personal Information</h4>
              <p>Name, age, gender and more</p>
            </div>
            <ChevronRight size={18} className="settings-action" />
          </div>
          <div className="settings-divider"></div>

          <div className="settings-row">
            <div className="settings-icon icon-blue">
              <Globe size={20} />
            </div>
            <div className="settings-text">
              <h4>Language</h4>
              <p>English</p>
            </div>
            <ChevronRight size={18} className="settings-action" />
          </div>
          <div className="settings-divider"></div>

          <div className="settings-row" onClick={toggleTheme}>
            <div className="settings-icon icon-purple">
              <Palette size={20} />
            </div>
            <div className="settings-text">
              <h4>Appearance</h4>
              <p>{isDark ? 'Dark Mode' : 'Light Mode'}</p>
            </div>
            <div className="theme-toggle-switch" role="switch" aria-checked={isDark}>
              <div className="theme-toggle-thumb">
                {isDark ? (
                  <Moon size={14} className="theme-toggle-icon" strokeWidth={3} />
                ) : (
                  <Sun size={14} className="theme-toggle-icon text-accent" strokeWidth={3} />
                )}
              </div>
            </div>
          </div>
          <div className="settings-divider"></div>

          <div className="settings-row">
            <div className="settings-icon icon-red">
              <PhoneCall size={20} />
            </div>
            <div className="settings-text">
              <h4>Emergency Contact</h4>
              <p>1 contact added</p>
            </div>
            <ChevronRight size={18} className="settings-action" />
          </div>
          <div className="settings-divider"></div>

          <div className="settings-row">
            <div className="settings-icon icon-green">
              <Accessibility size={20} />
            </div>
            <div className="settings-text">
              <h4>Accessibility</h4>
              <p>Text size, contrast, more</p>
            </div>
            <ChevronRight size={18} className="settings-action" />
          </div>
          <div className="settings-divider"></div>

          <div className="settings-row">
            <div className="settings-icon icon-orange">
              <Info size={20} />
            </div>
            <div className="settings-text">
              <h4>About Visava</h4>
              <p>Version 1.0.0</p>
            </div>
            <ChevronRight size={18} className="settings-action" />
          </div>

        </div>
      </div>
    </div>
  );
};
