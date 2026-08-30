import { useState, useEffect } from 'react';
import { LayoutDashboard, HeartHandshake, ClipboardList, BarChart3, UserCircle2, LogOut } from 'lucide-react';
import styles from './HelperDashboard.module.css';
import dashboardStyles from './Dashboard.module.css';
import { Greeting } from './Greeting';
import { ServiceStatus } from './ServiceStatus';
import { ImpactHero } from './ImpactHero';
import { QuickMetrics } from './QuickMetrics';
import { ServiceOverview } from './ServiceOverview';
import { QuickAvailability } from './QuickAvailability';
import { ActivityTimeline } from './ActivityTimeline';
import { AnalyticsPreview } from './AnalyticsPreview';
import { RequestSummary } from './RequestSummary';
import { HelpLocation } from './HelpLocation';
import { QuickActions } from './QuickActions';
import { ImpactMessage } from './ImpactMessage';
import { AddServiceForm } from './AddServiceForm';

interface HelperDashboardProps {
  user: { name?: string; avatar?: string; role: string } | null;
  onLogout: () => void;
}

export function HelperDashboard({ user, onLogout }: HelperDashboardProps) {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [showAddService, setShowAddService] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, active: true },
    { name: 'Services', icon: HeartHandshake, active: false },
    { name: 'Requests', icon: ClipboardList, active: false },
    { name: 'Analytics', icon: BarChart3, active: false },
    { name: 'Profile', icon: UserCircle2, active: false },
  ];

  const userName = user?.name?.split(' ')[0] || 'Helper';
  const avatarInitials = userName.charAt(0).toUpperCase();

  return (
    <div className={styles.layoutContainer}>
      <aside className={styles.desktopSidebar} style={{ borderRadius: 0, border: 'none', borderRight: '1px solid var(--glass-border)' }}>
        <div style={{ padding: 'var(--spacing-6)' }}>
          <h1 style={{ fontSize: 'var(--font-size-lg)', letterSpacing: '0.5px', color: 'var(--color-saffron)' }}>VISAVA</h1>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', letterSpacing: '1px', fontWeight: 600 }}>HELPER PORTAL</p>
        </div>

        <nav style={{ flex: 1, padding: '0 var(--spacing-4)', marginTop: 'var(--spacing-6)' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.name} style={{
                display: 'flex',
                alignItems: 'center',
                padding: 'var(--spacing-3) var(--spacing-4)',
                marginBottom: 'var(--spacing-2)',
                borderRadius: 'var(--radius-md)',
                color: item.active ? 'var(--color-saffron)' : 'var(--color-text-secondary)',
                backgroundColor: item.active ? 'var(--color-semantic-helpers-bg)' : 'transparent',
                cursor: 'pointer',
                fontWeight: item.active ? 600 : 500,
                transition: 'var(--transition-fast)'
              }}>
                <Icon size={20} style={{ marginRight: 'var(--spacing-3)' }} />
                <span>{item.name}</span>
              </div>
            );
          })}
        </nav>

        <div style={{ padding: 'var(--spacing-6)', borderTop: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '36px', height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-saffron)',
                color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, fontSize: 'var(--font-size-sm)',
                marginRight: 'var(--spacing-3)'
              }}>
                {avatarInitials}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{userName}</div>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--color-semantic-food)' }}>
                  Verified Helper
                </div>
              </div>
            </div>
            <button onClick={onLogout} style={{ color: 'var(--color-text-secondary)', padding: 'var(--spacing-2)' }}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <div className={styles.mainContent}>
        {!isDesktop && (
          <header className="glass-panel" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--spacing-3) var(--spacing-4)',
            margin: 'var(--spacing-4)',
            marginBottom: 'var(--spacing-6)',
            position: 'sticky',
            top: 'var(--spacing-4)',
            zIndex: 10,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 style={{ fontSize: 'var(--font-size-base)', margin: 0, lineHeight: 1.2, color: 'var(--color-saffron)' }}>VISAVA</h1>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>HELPER PORTAL</span>
                <span style={{
                  marginLeft: 'var(--spacing-2)',
                  fontSize: '10px',
                  color: 'var(--color-semantic-food)',
                  backgroundColor: 'var(--color-semantic-food-bg)',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 600
                }}>
                  Verified
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
              <div style={{
                width: '32px', height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-saffron)',
                color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, fontSize: 'var(--font-size-xs)'
              }}>
                {avatarInitials}
              </div>
            </div>
          </header>
        )}

        <main className={styles.contentWrapper} style={{ padding: '0 var(--spacing-4)' }}>
          <div className={dashboardStyles.dashboardContainer}>
            <div className={dashboardStyles.mainColumn}>
              <Greeting name={userName} />
              <ServiceStatus />
              <ImpactHero />
              <QuickMetrics />
              <ServiceOverview />
              <ActivityTimeline />
            </div>

            <div className={dashboardStyles.sideColumn}>
              <QuickAvailability />
              <AnalyticsPreview />
              <RequestSummary />
              <HelpLocation />
              <QuickActions onAddService={() => setShowAddService(true)} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <ImpactMessage />
            </div>
          </div>
        </main>

        {!isDesktop && (
          <nav className="glass-panel-heavy" style={{
            position: 'fixed',
            bottom: 'var(--spacing-4)',
            left: 'var(--spacing-4)',
            right: 'var(--spacing-4)',
            display: 'flex',
            justifyContent: 'space-between',
            padding: 'var(--spacing-2) var(--spacing-4)',
            zIndex: 50,
            borderRadius: 'var(--radius-pill)',
          }}>
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.name} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: item.active ? 'var(--color-saffron)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  padding: 'var(--spacing-2)'
                }}>
                  <Icon size={20} strokeWidth={item.active ? 2.5 : 2} />
                  <span style={{
                    fontSize: '10px',
                    marginTop: '4px',
                    fontWeight: item.active ? 600 : 500
                  }}>
                    {item.name}
                  </span>
                </div>
              );
            })}
          </nav>
        )}
      </div>

      {showAddService && (
        <AddServiceForm
          onClose={() => setShowAddService(false)}
          onServiceAdded={() => {}}
        />
      )}
    </div>
  );
}
