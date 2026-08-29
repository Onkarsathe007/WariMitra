import { ArrowLeft, ArrowRight, Footprints, HeartHandshake } from 'lucide-react';

interface RoleSelectionProps {
  onSelect: (role: 'explorer' | 'helper') => void;
  onBack: () => void;
}

export default function RoleSelection({ onSelect, onBack }: RoleSelectionProps) {
  return (
    <div className="role-selection">
      <div className="role-selection-bg" />
      <div className="role-selection-noise" />

      <button className="role-back-btn" onClick={onBack}>
        <ArrowLeft className="role-back-arrow" size={16} />
        Back
      </button>

      <div className="role-selection-content">
        <div className="role-header">
          <h2>Who Are You?</h2>
          <p>Choose your path on this sacred journey</p>
        </div>

        <div className="role-cards">
          <div className="role-card" onClick={() => onSelect('explorer')}>
            <div className="role-card-icon">
              <Footprints size={32} />
            </div>
            <div className="role-card-title">Warkari</div>
            <div className="role-card-desc">
              I am on the sacred journey
            </div>
            <div className="role-card-cta">
              Enter
              <ArrowRight className="role-card-cta-arrow" size={14} />
            </div>
          </div>

          <div className="role-card" onClick={() => onSelect('helper')}>
            <div className="role-card-icon">
              <HeartHandshake size={32} />
            </div>
            <div className="role-card-title">Helper</div>
            <div className="role-card-desc">
              I want to support the pilgrims
            </div>
            <div className="role-card-cta">
              Enter
              <ArrowRight className="role-card-cta-arrow" size={14} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
