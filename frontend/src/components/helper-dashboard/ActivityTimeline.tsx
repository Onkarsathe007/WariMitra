import { Droplets, Utensils, Stethoscope } from 'lucide-react';

const MOCK_ACTIVITY = [
  { id: 'a1', type: 'water', title: 'Water provided', warkaris: 12, time: '8 min ago' },
  { id: 'a2', type: 'food', title: 'Food served', warkaris: 23, time: '42 min ago' },
  { id: 'a3', type: 'medical', title: 'Medical assistance', warkaris: 4, time: '1 hr ago' },
];

export function ActivityTimeline() {
  const getIconAndColor = (type: string) => {
    switch (type) {
      case 'water':
        return { Icon: Droplets, color: 'var(--color-semantic-water)', bg: 'var(--color-semantic-water-bg)' };
      case 'food':
        return { Icon: Utensils, color: 'var(--color-semantic-food)', bg: 'var(--color-semantic-food-bg)' };
      case 'medical':
        return { Icon: Stethoscope, color: 'var(--color-semantic-medical)', bg: 'var(--color-semantic-medical-bg)' };
      default:
        return { Icon: Droplets, color: 'var(--color-text-secondary)', bg: 'transparent' };
    }
  };

  return (
    <div>
      <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 'var(--spacing-4)', fontWeight: 600 }}>
        TODAY'S ACTIVITY
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {MOCK_ACTIVITY.map((activity, index) => {
          const { Icon, color, bg } = getIconAndColor(activity.type);

          return (
            <div key={activity.id} style={{
              display: 'flex',
              alignItems: 'flex-start',
              paddingBottom: index < MOCK_ACTIVITY.length - 1 ? 'var(--spacing-4)' : 0,
              borderBottom: index < MOCK_ACTIVITY.length - 1 ? '1px solid var(--color-border)' : 'none',
              marginBottom: index < MOCK_ACTIVITY.length - 1 ? 'var(--spacing-4)' : 0,
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: bg,
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 'var(--spacing-4)',
                flexShrink: 0
              }}>
                <Icon size={20} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {activity.title}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--spacing-1)' }}>
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                    {activity.warkaris} Warkaris
                  </span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {activity.time}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
