import { ArrowRight } from 'lucide-react';

export function ServiceStatus() {
  return (
    <div className="glass-panel" style={{ padding: 'var(--spacing-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)', fontWeight: 600 }}>
          Your services are currently
        </div>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-semantic-food)' }}>
          <span style={{
            display: 'inline-block',
            width: '10px',
            height: '10px',
            backgroundColor: 'var(--color-semantic-food)',
            borderRadius: '50%',
            marginRight: 'var(--spacing-2)',
            boxShadow: '0 0 8px var(--color-semantic-food)'
          }}></span>
          ACTIVE
        </div>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-1)' }}>
          Warkaris can currently find your help.
        </div>
      </div>
      <button style={{
        display: 'flex',
        alignItems: 'center',
        color: 'var(--color-saffron)',
        fontWeight: 500,
        fontSize: 'var(--font-size-sm)'
      }}>
        Manage availability <ArrowRight size={16} style={{ marginLeft: 'var(--spacing-1)' }} />
      </button>
    </div>
  );
}
