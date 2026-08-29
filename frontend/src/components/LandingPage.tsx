import { ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="landing-page">
      <div className="landing-overlay" />
      <div className="landing-vignette" />
      <div className="landing-content">
        <h1 className="landing-title">Visava</h1>
        <p className="landing-subtitle">Sacred Journey, Connected Community</p>
        <div className="landing-divider" />
        <div className="landing-cta">
          <button className="start-btn" onClick={onStart}>
            <span>Start Now</span>
            <ArrowRight className="start-btn-arrow" size={18} />
          </button>
          <p className="landing-hint">Begin your pilgrimage experience</p>
        </div>
      </div>
    </div>
  );
}
