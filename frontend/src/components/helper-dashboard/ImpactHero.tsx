import { TrendingUp } from 'lucide-react';

export function ImpactHero() {
  const warkarisHelped = 127;
  const thisWeekIncrease = 18;

  return (
    <div className="glass-panel-heavy" style={{
      padding: 'var(--spacing-8) var(--spacing-6)',
      textAlign: 'center',
      background: 'linear-gradient(135deg, var(--color-surface-glass-heavy) 0%, rgba(242, 140, 40, 0.05) 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, var(--color-semantic-stay-bg) 0%, transparent 70%)',
        opacity: 0.5
      }}></div>

      <h3 style={{
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text-secondary)',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        marginBottom: 'var(--spacing-2)'
      }}>
        Your Impact
      </h3>

      <div style={{
        fontSize: '4rem',
        fontWeight: 700,
        lineHeight: 1,
        color: 'var(--color-saffron)',
        marginBottom: 'var(--spacing-2)'
      }}>
        {warkarisHelped}
      </div>

      <div style={{
        fontSize: 'var(--font-size-sm)',
        fontWeight: 600,
        letterSpacing: '1px',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--spacing-4)'
      }}>
        WARKARIS HELPED
      </div>

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: 'var(--color-semantic-food-bg)',
        color: 'var(--color-semantic-food)',
        padding: 'var(--spacing-1) var(--spacing-3)',
        borderRadius: 'var(--radius-pill)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 600,
        marginBottom: 'var(--spacing-2)'
      }}>
        <TrendingUp size={14} style={{ marginRight: 'var(--spacing-1)' }} />
        +{thisWeekIncrease} this week
      </div>

      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
        Your help is making a difference.
      </p>
    </div>
  );
}
