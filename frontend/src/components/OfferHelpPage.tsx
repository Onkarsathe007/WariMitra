import { useState } from 'react';
import { 
  Home, Cross, Droplets, Utensils, SquarePlay, Armchair, 
  HandHeart, AlertTriangle, Check, MapPin, Phone, 
  MessageCircle, Smartphone, ArrowRight, Handshake, AlertCircle 
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { submitHelperService } from '../services/api';
import { Header } from './Header';
import './OfferHelpPage.css';

const dropPinIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `
    <div class="marker-container" style="transform: scale(0.8)">
      <div class="marker-pin" style="background-color: var(--visava-orange)">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        <div class="marker-pin-tail" style="border-top-color: var(--visava-orange)"></div>
      </div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

const MapClickHandler = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

const SERVICES_LIST = [
  { id: 'accommodation', label: 'Accommodation', subtitle: 'A place to stay', icon: Home },
  { id: 'medical', label: 'Medical', subtitle: 'Medical assistance', icon: Cross },
  { id: 'water', label: 'Water', subtitle: 'Drinking water', icon: Droplets },
  { id: 'food', label: 'Food', subtitle: 'Meals or refreshments', icon: Utensils },
  { id: 'toilets', label: 'Toilets', subtitle: 'Toilet facilities', icon: SquarePlay },
  { id: 'rest_area', label: 'Rest Area', subtitle: 'A place to rest', icon: Armchair },
  { id: 'general', label: 'General Help', subtitle: 'Other assistance', icon: HandHeart },
  { id: 'emergency', label: 'Emergency', subtitle: 'Emergency support', icon: AlertTriangle },
];

export const OfferHelpPage = () => {
  const [step, setStep] = useState<'form' | 'review' | 'success'>('form');
  
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [description, setDescription] = useState('');
  const [availability, setAvailability] = useState('');
  const [contactPreference, setContactPreference] = useState<'Call' | 'WhatsApp' | 'In-app' | ''>('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleService = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
    setErrorMsg('');
  };

  const handleGetCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation([pos.coords.latitude, pos.coords.longitude]);
          setErrorMsg('');
        },
        () => setErrorMsg('Could not get your location. Please select manually on the map.')
      );
    }
  };

  const validateForm = () => {
    if (selectedServices.length === 0) {
      setErrorMsg('Select at least one way you can help.');
      return false;
    }
    if (!location) {
      setErrorMsg('Choose where Warkaris can find you.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const handleContinue = () => {
    if (validateForm()) {
      setStep('review');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const payload = {
      name: 'Helper Service',
      type: selectedServices[0],
      location: {
        type: 'Point',
        coordinates: [location![1], location![0]]
      },
      description: description,
      contactPhone: contactPreference
    };

    const res = await submitHelperService(payload);
    setIsSubmitting(false);
    
    if (res.success) {
      setStep('success');
    } else {
      setErrorMsg('Failed to submit. Please try again.');
    }
  };

  return (
    <div className="offer-page">
      <div className="offer-background"></div>
      
      <Header showGreeting={false} transparentBg={true} rightAction={null} />
      
      <div className="offer-content animate-fade-in">
        
        {step === 'form' && (
          <>
            <div className="offer-title-area">
              <h2 className="offer-title">Offer Help <Handshake size={24} className="text-accent" /></h2>
              <p className="offer-subtitle">Your small help can make someone's Wari easier.</p>
            </div>

            <section>
              <h3 className="offer-section-title">What can you help with?</h3>
              <div className="service-grid">
                {SERVICES_LIST.map(service => {
                  const Icon = service.icon;
                  const isSelected = selectedServices.includes(service.id);
                  return (
                    <div 
                      key={service.id} 
                      className={`service-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleService(service.id)}
                    >
                      {isSelected && (
                        <div className="service-card-check">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                      <div className="service-card-icon">
                        <Icon size={20} />
                      </div>
                      <span className="service-card-title">{service.label}</span>
                      <span className="service-card-subtitle">{service.subtitle}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <h3 className="offer-section-title">Where can Warkaris find you?</h3>
              
              <div className="map-preview-container">
                <MapContainer 
                  center={location || [17.675, 75.321]} 
                  zoom={13} 
                  zoomControl={false} 
                  style={{ height: '100%', width: '100%', zIndex: 0 }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapClickHandler onLocationSelect={(lat, lng) => setLocation([lat, lng])} />
                  {location && <Marker position={location} icon={dropPinIcon} />}
                </MapContainer>
              </div>
              
              <button className="location-btn" onClick={handleGetCurrentLocation}>
                <MapPin size={18} className="text-accent" /> Use my current location
              </button>
            </section>

            <section className="glass-panel-solid glass-form-container">
              <h3 className="offer-section-title" style={{ marginBottom: 0 }}>Tell us a little more</h3>
              
              <div className="form-group">
                <label className="form-label">What can you provide?</label>
                <textarea 
                  className="glass-input" 
                  placeholder="Tell Warkaris what you can provide..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  maxLength={150}
                />
              </div>

              {selectedServices.includes('accommodation') && (
                <div className="form-group animate-fade-in">
                  <label className="form-label">How many people can you accommodate?</label>
                  <input type="number" className="glass-input" placeholder="e.g. 5" />
                </div>
              )}

              {selectedServices.includes('food') && (
                <div className="form-group animate-fade-in">
                  <label className="form-label">Approximate number of people you can serve</label>
                  <input type="number" className="glass-input" placeholder="e.g. 50" />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">When are you available?</label>
                <input 
                  type="datetime-local" 
                  className="glass-input" 
                  value={availability}
                  onChange={e => setAvailability(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">How can Warkaris contact you?</label>
                <div className="contact-options">
                  <div 
                    className={`contact-pill ${contactPreference === 'Call' ? 'selected' : ''}`}
                    onClick={() => setContactPreference('Call')}
                  >
                    <Phone size={16} /> Call
                  </div>
                  <div 
                    className={`contact-pill ${contactPreference === 'WhatsApp' ? 'selected' : ''}`}
                    onClick={() => setContactPreference('WhatsApp')}
                  >
                    <MessageCircle size={16} /> WhatsApp
                  </div>
                  <div 
                    className={`contact-pill ${contactPreference === 'In-app' ? 'selected' : ''}`}
                    onClick={() => setContactPreference('In-app')}
                  >
                    <Smartphone size={16} /> In-app
                  </div>
                </div>
              </div>
            </section>

            {errorMsg && (
              <div className="validation-message animate-fade-in">
                <AlertCircle size={18} /> {errorMsg}
              </div>
            )}

            <button className="primary-btn" onClick={handleContinue}>
              Continue <ArrowRight size={18} />
            </button>
          </>
        )}

        {step === 'review' && (
          <div className="glass-panel-solid glass-form-container animate-slide-up">
            <h2 className="offer-title">Review Your Help</h2>
            
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Selected Services</label>
              <p className="text-primary">{selectedServices.join(', ')}</p>
            </div>
            
            <div className="form-group">
              <label className="form-label">Location</label>
              <p className="text-primary">Coordinates: {location?.[0].toFixed(4)}, {location?.[1].toFixed(4)}</p>
            </div>
            
            {description && (
              <div className="form-group">
                <label className="form-label">Description</label>
                <p className="text-primary">{description}</p>
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label">Contact</label>
              <p className="text-primary">{contactPreference || 'Not specified'}</p>
            </div>

            {errorMsg && (
              <div className="validation-message animate-fade-in">
                <AlertCircle size={18} /> {errorMsg}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button 
                className="glass-input" 
                style={{ flex: 1, textAlign: 'center', background: 'var(--glass-bg)' }}
                onClick={() => setStep('form')}
              >
                Back
              </button>
              <button 
                className="primary-btn" 
                style={{ flex: 2, margin: 0 }}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Offer Help'}
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="success-state animate-fade-in">
            <div className="success-icon">
              <Handshake size={40} />
            </div>
            <h2>You're now helping Warkaris.</h2>
            <p>Warkaris will be able to find your help on the Visava map.</p>
            
            <button className="primary-btn" onClick={() => window.location.reload()}>
              Go to Helper Dashboard <ArrowRight size={18} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
