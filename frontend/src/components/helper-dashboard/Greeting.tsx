import { Handshake } from 'lucide-react';

interface GreetingProps {
  name: string;
}

export function Greeting({ name }: GreetingProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div style={{ padding: 'var(--spacing-2) 0' }}>
      <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-1)' }}>
        {getGreeting()}, {name} <Handshake size={24} style={{ verticalAlign: 'middle', color: 'var(--color-saffron)' }} />
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-base)', margin: 0 }}>
        Here's how your help is making a difference.
      </p>
    </div>
  );
}
