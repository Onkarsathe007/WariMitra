import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowRight } from 'lucide-react';

const MOCK_ANALYTICS_DATA = [
  { name: 'Mon', helped: 12 },
  { name: 'Tue', helped: 19 },
  { name: 'Wed', helped: 15 },
  { name: 'Thu', helped: 22 },
  { name: 'Fri', helped: 18 },
  { name: 'Sat', helped: 28 },
  { name: 'Sun', helped: 13 },
];

export function AnalyticsPreview() {
  return (
    <div className="glass-panel" style={{ padding: 'var(--spacing-4)' }}>
      <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 'var(--spacing-1)', fontWeight: 600 }}>
        YOUR ACTIVITY
      </h3>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-4)' }}>
        Warkaris helped this week
      </p>

      <div style={{ height: '180px', width: '100%', marginBottom: 'var(--spacing-4)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={MOCK_ANALYTICS_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
              dy={10}
            />
            <Tooltip
              cursor={{ fill: 'var(--color-border)' }}
              contentStyle={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 12px var(--color-shadow-soft)'
              }}
              labelStyle={{ color: 'var(--color-text-secondary)', marginBottom: '4px' }}
              itemStyle={{ color: 'var(--color-saffron)', fontWeight: 600 }}
            />
            <Bar
              dataKey="helped"
              fill="var(--color-saffron)"
              radius={[4, 4, 4, 4]}
              barSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <button style={{
        display: 'flex',
        alignItems: 'center',
        color: 'var(--color-saffron)',
        fontWeight: 500,
        fontSize: 'var(--font-size-sm)',
        width: '100%',
        justifyContent: 'center',
        padding: 'var(--spacing-2) 0',
      }}>
        View detailed analytics <ArrowRight size={16} style={{ marginLeft: 'var(--spacing-1)' }} />
      </button>
    </div>
  );
}
