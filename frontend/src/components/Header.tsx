import { Bell } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  showGreeting?: boolean;
  rightAction?: React.ReactNode;
  transparentBg?: boolean;
}

export const Header = ({ showGreeting = true, rightAction, transparentBg = false }: HeaderProps) => {
  return (
    <header className={`header-container ${transparentBg ? 'header-transparent' : ''}`}>
      <div className="header-left">
        <div className="branding">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="var(--visava-orange)" />
              <circle cx="12" cy="9" r="2.5" fill="white" />
            </svg>
          </div>
          <div className="branding-text">
            <h1 className="logo-text">VISAVA</h1>
            <span className="subtitle">WARI COMPANION</span>
          </div>
        </div>
        {showGreeting && (
          <div className="greeting">
            <h2 className="greeting-title">Hello, Warkari</h2>
          </div>
        )}
      </div>
      <div className="header-right">
        {rightAction !== undefined ? rightAction : (
          <button className="notification-btn glass-panel" aria-label="Notifications">
            <Bell size={20} className="text-primary" />
            <span className="notification-badge">2</span>
          </button>
        )}
      </div>
    </header>
  );
};
