import { Plus, Edit3, MapPin, List } from 'lucide-react';

interface QuickActionsProps {
  onAddService: () => void;
}

export function QuickActions({ onAddService }: QuickActionsProps) {
  const actions = [
    { label: 'Offer a new service', icon: Plus, primary: true, onClick: onAddService },
    { label: 'Update availability', icon: Edit3, primary: false, onClick: () => {} },
    { label: 'Update location', icon: MapPin, primary: false, onClick: () => {} },
    { label: 'View requests', icon: List, primary: false, onClick: () => {} },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <button key={index} onClick={action.onClick} className={action.primary ? '' : 'glass-panel'} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-4)',
            backgroundColor: action.primary ? 'var(--color-saffron)' : undefined,
            color: action.primary ? 'white' : 'var(--color-text-primary)',
            borderRadius: 'var(--radius-xl)',
            border: action.primary ? 'none' : undefined,
            transition: 'var(--transition-fast)'
          }}>
            <Icon size={24} style={{ marginBottom: 'var(--spacing-2)' }} />
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500, textAlign: 'center' }}>
              {action.primary ? '+ ' : ''}{action.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
