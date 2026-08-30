import { Handshake } from 'lucide-react';

export function ImpactMessage() {
  return (
    <div style={{
      textAlign: 'center',
      padding: 'var(--spacing-6) var(--spacing-4)',
      marginTop: 'var(--spacing-4)'
    }}>
      <h3 style={{
        fontSize: 'var(--font-size-lg)',
        color: 'var(--color-text-primary)',
        fontWeight: 500,
        marginBottom: 'var(--spacing-2)'
      }}>
        You've helped 127 Warkaris so far. <Handshake size={20} style={{ verticalAlign: 'middle', color: 'var(--color-saffron)' }} />
      </h3>
      <p style={{
        color: 'var(--color-text-secondary)',
        fontSize: 'var(--font-size-sm)',
        margin: 0
      }}>
        Every little bit of help matters.
      </p>
    </div>
  );
}
