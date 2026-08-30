import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, MapPin, Loader2, Check, Utensils, Droplets, Cross, Home, HelpCircle } from 'lucide-react';
import { submitHelperService } from '../../services/api';

const dropPinIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `
    <div style="transform: scale(0.8)">
      <div style="background-color: var(--color-saffron); width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(45deg);"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
    </div>
  `,
  iconSize: [30, 42],
  iconAnchor: [15, 42]
});

const MapClickHandler = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({ click(e) { onLocationSelect(e.latlng.lat, e.latlng.lng); } });
  return null;
};

const SERVICE_TYPES = [
  { id: 'food', label: 'Food', icon: Utensils, color: 'var(--color-semantic-food)' },
  { id: 'water', label: 'Water', icon: Droplets, color: 'var(--color-semantic-water)' },
  { id: 'medical', label: 'Medical', icon: Cross, color: 'var(--color-semantic-medical)' },
  { id: 'shelter', label: 'Shelter', icon: Home, color: 'var(--color-semantic-stay)' },
  { id: 'other', label: 'Other', icon: HelpCircle, color: 'var(--color-text-secondary)' },
];

interface AddServiceFormProps {
  onClose: () => void;
  onServiceAdded: () => void;
}

export function AddServiceForm({ onClose, onServiceAdded }: AddServiceFormProps) {
  const [serviceType, setServiceType] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);

  const handleLocationSelect = async (lat: number, lng: number) => {
    setLocation({ lat, lng });
    setGeoLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data?.address) {
        const foundCity = data.address.city || data.address.town || data.address.village || data.address.county || '';
        if (foundCity) setCity(foundCity);
      }
    } catch (e) {
      console.error('Reverse geocoding failed', e);
    } finally {
      setGeoLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!serviceType) { setError('Please select a service type'); return; }
    if (!name.trim()) { setError('Please enter a service name'); return; }
    if (!location) { setError('Please select a location on the map'); return; }
    if (!city.trim()) { setError('City could not be detected. Please select a different location.'); return; }

    setLoading(true);
    setError('');

    const payload = {
      name: name.trim(),
      type: serviceType,
      description: description.trim(),
      contactPhone: contactPhone.trim() || undefined,
      city: city.trim().toLowerCase(),
      location: { type: 'Point', coordinates: [location.lng, location.lat] },
      available: true,
    };

    const result = await submitHelperService(payload);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => { onServiceAdded(); onClose(); }, 1500);
    } else {
      setError(result.error || 'Failed to add service. Please try again.');
    }
  };

  if (success) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)'
      }}>
        <div className="glass-panel-heavy" style={{
          width: '90%', maxWidth: '400px', padding: 'var(--spacing-8)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-4)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            backgroundColor: 'var(--color-semantic-food-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Check size={32} color="var(--color-semantic-food)" />
          </div>
          <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600 }}>Service Added!</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            Warkaris can now find your help on the map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)'
    }}>
      <div className="glass-panel-heavy" style={{
        width: '90%', maxWidth: '500px', maxHeight: '90vh',
        overflowY: 'auto', padding: 'var(--spacing-6)',
        display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, margin: 0 }}>Add New Service</h2>
          <button onClick={onClose} style={{ color: 'var(--color-text-secondary)', padding: 'var(--spacing-2)' }}>
            <X size={20} />
          </button>
        </div>

        <div>
          <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--spacing-2)' }}>
            Service Type
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-2)' }}>
            {SERVICE_TYPES.map(type => {
              const Icon = type.icon;
              const isSelected = serviceType === type.id;
              return (
                <button key={type.id} onClick={() => setServiceType(type.id)} style={{
                  padding: 'var(--spacing-3)', borderRadius: 'var(--radius-lg)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-1)',
                  backgroundColor: isSelected ? 'var(--color-semantic-stay-bg)' : 'var(--color-surface)',
                  border: `1px solid ${isSelected ? 'var(--color-saffron)' : 'var(--color-border)'}`,
                  color: isSelected ? 'var(--color-saffron)' : 'var(--color-text-primary)',
                  transition: 'var(--transition-fast)'
                }}>
                  <Icon size={20} />
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500 }}>{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--spacing-2)' }}>
            Service Name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Tukaram Annachhatra"
            style={{
              width: '100%', padding: 'var(--spacing-3)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-base)',
              outline: 'none'
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--spacing-2)' }}>
            Description
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What can you provide? Capacity, timings, etc."
            rows={3}
            style={{
              width: '100%', padding: 'var(--spacing-3)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-base)',
              outline: 'none', resize: 'vertical'
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--spacing-2)' }}>
            Contact Phone
          </label>
          <input
            type="tel"
            value={contactPhone}
            onChange={e => setContactPhone(e.target.value)}
            placeholder="+91..."
            style={{
              width: '100%', padding: 'var(--spacing-3)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-base)',
              outline: 'none'
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--spacing-2)' }}>
            Location on Map
          </label>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-2)' }}>
            Click on the map to set your service location. City will be auto-detected.
          </p>
          <div style={{
            width: '100%', height: '200px', borderRadius: 'var(--radius-lg)',
            overflow: 'hidden', border: '1px solid var(--color-border)'
          }}>
            <MapContainer
              center={location || [17.675, 75.321]}
              zoom={13}
              zoomControl={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapClickHandler onLocationSelect={handleLocationSelect} />
              {location && <Marker position={[location.lat, location.lng]} icon={dropPinIcon} />}
            </MapContainer>
          </div>
          {location && (
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 'var(--spacing-2)', gap: 'var(--spacing-2)' }}>
              <MapPin size={14} color="var(--color-saffron)" />
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-semantic-food)' }}>
                Location set: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
            </div>
          )}
        </div>

        <div>
          <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--spacing-2)' }}>
            City
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder={location ? 'Detecting city...' : 'Select location on map first'}
              style={{
                flex: 1, padding: 'var(--spacing-3)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-size-base)',
                outline: 'none'
              }}
            />
            {geoLoading && <Loader2 size={18} color="var(--color-saffron)" className="animate-spin" />}
          </div>
        </div>

        {error && (
          <div style={{
            padding: 'var(--spacing-3)',
            backgroundColor: 'var(--color-semantic-medical-bg)',
            border: '1px solid var(--color-semantic-medical)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-semantic-medical)',
            fontSize: 'var(--font-size-sm)'
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: 'var(--spacing-4)',
            backgroundColor: 'var(--color-saffron)',
            color: 'white', borderRadius: 'var(--radius-lg)',
            fontSize: 'var(--font-size-base)', fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-2)',
            opacity: loading ? 0.7 : 1,
            transition: 'var(--transition-fast)'
          }}
        >
          {loading ? <><Loader2 size={18} className="animate-spin" /> Adding Service...</> : 'Add Service'}
        </button>
      </div>
    </div>
  );
}
