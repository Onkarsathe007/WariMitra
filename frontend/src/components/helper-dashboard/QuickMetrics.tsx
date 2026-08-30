import styles from './QuickMetrics.module.css';

export function QuickMetrics() {
  const metrics = [
    { label: 'Warkaris Helped', value: 127 },
    { label: 'Help Sessions', value: 184 },
    { label: 'Response Time', value: '4 min' },
    { label: 'Active Services', value: 3 },
  ];

  return (
    <div className={styles.metricsGrid}>
      {metrics.map((metric, index) => (
        <div key={index} className="glass-panel" style={{ padding: 'var(--spacing-3)', textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)' }}>
            {metric.label}
          </div>
          <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {metric.value}
          </div>
        </div>
      ))}
    </div>
  );
}
