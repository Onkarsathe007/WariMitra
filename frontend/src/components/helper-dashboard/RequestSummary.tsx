import { ArrowRight } from 'lucide-react';

const MOCK_REQUESTS = [
  { id: 'r1', type: 'food', title: 'Food request', warkaris: 3, status: 'Waiting for response', statusType: 'pending' as const },
  { id: 'r2', type: 'stay', title: 'Accommodation request', warkaris: 2, status: 'Accepted', statusType: 'accepted' as const },
];

export function RequestSummary() {
  return (
    <div>
      <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 'var(--spacing-3)', fontWeight: 600 }}>
        REQUESTS NEEDING ATTENTION
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
        {MOCK_REQUESTS.map(req => (
          <div key={req.id} className="glass-panel" style={{
            padding: 'var(--spacing-4)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderLeft: req.statusType === 'pending' ? '3px solid var(--color-semantic-medical)' : '1px solid var(--color-border)'
          }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-1)' }}>
                {req.title}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                {req.warkaris} Warkaris
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: req.statusType === 'pending' ? 'var(--color-semantic-medical)' : 'var(--color-semantic-food)', fontWeight: 500 }}>
                {req.status}
              </div>
            </div>

            <button style={{
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-saffron)',
              fontWeight: 500,
              fontSize: 'var(--font-size-sm)',
              padding: 'var(--spacing-2)',
              backgroundColor: 'var(--color-semantic-stay-bg)',
              borderRadius: 'var(--radius-pill)',
            }}>
              {req.statusType === 'pending' ? 'Review' : 'View'} <ArrowRight size={14} style={{ marginLeft: 'var(--spacing-1)' }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
