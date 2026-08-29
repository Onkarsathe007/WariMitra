import React, { useState } from 'react';
import axios from 'axios';
import { Loader2, MapPin } from 'lucide-react';
import LocationPickerMap from './LocationPickerMap';

const CORE_API_URL = 'http://localhost:3000/api/v1';
const INTERNAL_TOKEN = 'visava-internal-secret-token-2024';

export default function HelperDashboard() {
  const [type, setType] = useState('camp');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [phone, setPhone] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      alert("Please select a location on the map.");
      return;
    }

    setLoading(true);
    setSuccessMsg('');

    try {
      const headers = { Authorization: `Bearer ${INTERNAL_TOKEN}` };
      
      let finalImageUrl = '';
      if (imageFile) {
        const formData = new FormData();
        formData.append('media', imageFile);
        const uploadRes = await axios.post(`${CORE_API_URL}/upload`, formData, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' }
        });
        finalImageUrl = uploadRes.data.url;
      }

      const media = finalImageUrl ? [finalImageUrl] : [];

      if (type === 'camp') {
        await axios.post(`${CORE_API_URL}/camps`, {
          name,
          type: 'shelter',
          description: desc,
          contactPhone: phone || '+910000000000',
          media,
          location: { type: 'Point', coordinates: [location.lng, location.lat] },
          verified: true
        }, { headers });
      } else if (type === 'service') {
        await axios.post(`${CORE_API_URL}/services`, {
          name,
          type: 'food',
          description: desc,
          contactPhone: phone || '+910000000000',
          media,
          location: { type: 'Point', coordinates: [location.lng, location.lat] },
          available: true
        }, { headers });
      } else if (type === 'report') {
        const res = await axios.post(`${CORE_API_URL}/reports`, {
          type: 'medical_emergency',
          description: desc || name,
          location: { type: 'Point', coordinates: [location.lng, location.lat] },
          reporterPhone: phone || '+910000000000',
          media
        }, { headers });
        await axios.patch(`${CORE_API_URL}/reports/${res.data.report._id}/confirm`, {}, { headers });
      }

      setSuccessMsg("Successfully added! You can view it on the Warkari Explorer map.");
      // Reset form
      setName('');
      setDesc('');
      setPhone('');
      setImageFile(null);
      setLocation(null);
    } catch (error: any) {
      console.error(error);
      alert('Failed to add location: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header glass-panel">
        <MapPin color="#f97316" size={32} />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Helper Portal</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Offer resources, shelters, or report emergencies for Warkaris.</p>
        </div>
      </div>

      <div className="dashboard-content glass-panel">
        {successMsg && (
          <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#10b981', borderRadius: '8px', marginBottom: '24px' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="dashboard-form">
          <div className="form-column">
            <h3>1. Resource Details</h3>
            
            <div className="form-group">
              <label>Category</label>
              <select value={type} onChange={e => setType(e.target.value)}>
                <option value="camp">⛺ Accommodation / Shelter</option>
                <option value="service">🍲 Food / Services</option>
                <option value="report">⚠️ Emergency / Incident</option>
              </select>
            </div>

            <div className="form-group">
              <label>Name / Title</label>
              <input required placeholder="e.g. Tukaram Maharaj Annachhatra" value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Mobile Number</label>
              <input required type="tel" placeholder="+91..." value={phone} onChange={e => setPhone(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Photo Upload (Optional)</label>
              <input type="file" accept="image/*" onChange={e => {
                if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
              }} style={{ cursor: 'pointer' }} />
              {imageFile && <span style={{fontSize: '0.8rem', color: '#10b981'}}>File selected: {imageFile.name}</span>}
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea required rows={4} placeholder="Provide details like capacity, timings, etc." value={desc} onChange={e => setDesc(e.target.value)} />
            </div>
          </div>

          <div className="form-column">
            <h3>2. Location</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Tap the map to set the exact location for this resource.
            </p>
            
            <LocationPickerMap 
              onLocationSelected={(lat, lng) => setLocation({lat, lng})} 
              defaultLocation={location || undefined}
            />

            {location && (
              <p style={{ fontSize: '0.85rem', color: '#10b981', marginTop: '8px' }}>
                ✓ Location Selected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            )}

            <button type="submit" className="btn-primary" style={{ marginTop: 'auto', padding: '16px', fontSize: '1.1rem' }} disabled={loading}>
              {loading ? <><Loader2 className="lucide-spin" size={20} /> Saving Data...</> : 'Submit Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
