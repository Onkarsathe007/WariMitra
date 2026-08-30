import { useState } from 'react';

export function QuickAvailability() {
  const [availability, setAvailability] = useState<'available' | 'limited' | 'unavailable'>('available');

  return (
    <div className="glass-panel" style={{ padding: 'var(--spacing-4)' }}>
      <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 'var(--spacing-3)', fontWeight: 600 }}>
        Service availability
      </h3>

      <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexDirection: 'column' }}>
        <button
          onClick={() => setAvailability('available')}
          style={{
            padding: 'var(--spacing-3)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: availability === 'available' ? 'var(--color-semantic-food-bg)' : 'transparent',
            border: `1px solid ${availability === 'available' ? 'var(--color-semantic-food)' : 'var(--color-border)'}`,
            transition: 'var(--transition-fast)',
            textAlign: 'left'
          }}
        >
          <span style={{
            width: '10px', height: '10px', borderRadius: '50%',
            backgroundColor: 'var(--color-semantic-food)', marginRight: 'var(--spacing-3)'
          }}></span>
          <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>Available</span>
        </button>

        <button
          onClick={() => setAvailability('limited')}
          style={{
            padding: 'var(--spacing-3)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: availability === 'limited' ? 'var(--color-semantic-stay-bg)' : 'transparent',
            border: `1px solid ${availability === 'limited' ? 'var(--color-saffron)' : 'var(--color-border)'}`,
            transition: 'var(--transition-fast)',
            textAlign: 'left'
          }}
        >
          <span style={{
            width: '10px', height: '10px', borderRadius: '50%',
            backgroundColor: 'var(--color-saffron)', marginRight: 'var(--spacing-3)'
          }}></span>
          <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>Limited / Busy</span>
        </button>

        <button
          onClick={() => setAvailability('unavailable')}
          style={{
            padding: 'var(--spacing-3)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: availability === 'unavailable' ? 'var(--color-semantic-medical-bg)' : 'transparent',
            border: `1px solid ${availability === 'unavailable' ? 'var(--color-semantic-medical)' : 'var(--color-border)'}`,
            transition: 'var(--transition-fast)',
            textAlign: 'left'
          }}
        >
          <span style={{
            width: '10px', height: '10px', borderRadius: '50%',
            backgroundColor: 'var(--color-semantic-medical)', marginRight: 'var(--spacing-3)'
          }}></span>
          <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>Unavailable</span>
        </button>
      </div>
    </div>
  );
}
