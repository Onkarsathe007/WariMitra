import { ArrowRight, MapPin } from 'lucide-react';

export function HelpLocation() {
  return (
    <div className="glass-panel" style={{ padding: 'var(--spacing-4)', overflow: 'hidden' }}>
      <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 'var(--spacing-3)', fontWeight: 600 }}>
        YOUR HELP LOCATION
      </h3>

      <div style={{
        width: '100%',
        height: '140px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 'var(--spacing-3)',
        position: 'relative',
        backgroundImage: 'radial-gradient(var(--color-border) 1px, transparent 1px)',
        backgroundSize: '15px 15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          position: 'absolute',
          width: '30px',
          height: '30px',
          backgroundColor: 'rgba(242, 140, 40, 0.2)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <MapPin size={18} color="var(--color-saffron)" fill="var(--color-saffron)" />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-3)' }}>
        <MapPin size={16} color="var(--color-saffron)" style={{ marginRight: 'var(--spacing-2)' }} />
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          Warkaris can currently find your services here.
        </span>
      </div>

      <button style={{
        display: 'flex',
        alignItems: 'center',
        color: 'var(--color-saffron)',
        fontWeight: 500,
        fontSize: 'var(--font-size-sm)',
        padding: '0',
      }}>
        Update location <ArrowRight size={16} style={{ marginLeft: 'var(--spacing-1)' }} />
      </button>
    </div>
  );
}
