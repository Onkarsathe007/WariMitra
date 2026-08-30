import { ArrowRight, Droplets, Utensils, Stethoscope } from 'lucide-react';

const MOCK_SERVICES = [
  { id: 's1', name: 'Drinking Water', status: 'Available', statusColor: 'green', detail: '42 units remaining', type: 'water', icon: Droplets },
  { id: 's2', name: 'Food', status: 'Available', statusColor: 'green', detail: '37 meals remaining', type: 'food', icon: Utensils },
  { id: 's3', name: 'Medical Assistance', status: 'Busy', statusColor: 'yellow', detail: null, type: 'medical', icon: Stethoscope },
];

export function ServiceOverview() {
  const getStatusColor = (colorName: string) => {
    switch (colorName) {
      case 'green': return 'var(--color-semantic-food)';
      case 'yellow': return 'var(--color-saffron)';
      case 'red': return 'var(--color-semantic-medical)';
      default: return 'var(--color-text-secondary)';
    }
  };

  return (
    <div>
      <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 'var(--spacing-2)', fontWeight: 600 }}>
        CURRENTLY OFFERING
      </h3>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-4)' }}>
        Services currently visible to Warkaris.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
        {MOCK_SERVICES.map(service => {
          const Icon = service.icon;
          return (
            <div key={service.id} className="glass-panel" style={{
              padding: 'var(--spacing-4)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: `var(--color-semantic-${service.type === 'water' ? 'water' : service.type === 'food' ? 'food' : 'medical'}-bg)`,
                  color: `var(--color-semantic-${service.type === 'water' ? 'water' : service.type === 'food' ? 'food' : 'medical'})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-1)' }}>
                    {service.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--font-size-sm)' }}>
                    <span style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      backgroundColor: getStatusColor(service.statusColor),
                      borderRadius: '50%',
                      marginRight: 'var(--spacing-2)'
                    }}></span>
                    <span style={{ color: getStatusColor(service.statusColor), fontWeight: 500, marginRight: 'var(--spacing-3)' }}>
                      {service.status}
                    </span>
                    {service.detail && (
                      <span style={{ color: 'var(--color-text-secondary)' }}>
                        {service.detail}
                      </span>
                    )}
                  </div>
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
                Manage <ArrowRight size={14} style={{ marginLeft: 'var(--spacing-1)' }} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
