import React, { useState } from 'react';
import { X, Camera, AlertCircle, Phone } from 'lucide-react';
import axios from 'axios';
import { useNotifications } from '../context/NotificationContext';
import './NotificationDrawer.css';

interface CreateReportModalProps {
  onClose: () => void;
}

export const CreateReportModal: React.FC<CreateReportModalProps> = ({ onClose }) => {
  const { refreshNotifications } = useNotifications();
  const [type, setType] = useState('missing_person');
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const formData = new FormData();
    formData.append('media', file);

    setIsUploading(true);
    try {
      const res = await axios.post('http://localhost:3000/api/v1/upload', formData);
      if (res.data && res.data.url) {
        setMedia(prev => [...prev, res.data.url]);
      } else {
        setErrorMsg('Failed to upload image');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || description.length < 10) {
      setErrorMsg('Description must be at least 10 characters long.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // 1. Create Report
      // Note: we hardcode location for now, but ideally this would use geolocation
      const token = localStorage.getItem('visava_token');
      const createRes = await axios.post('http://localhost:3000/api/v1/reports', {
        type,
        description,
        media,
        location: {
          type: 'Point',
          coordinates: [75.321, 17.675] // Default generic location for demo
        }
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const reportId = createRes.data.report._id;

      // 2. Confirm to trigger Broadcast
      await axios.patch(`http://localhost:3000/api/v1/reports/${reportId}/confirm`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      refreshNotifications();
      onClose();

    } catch (err: any) {
      console.error('Error submitting report:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="report-modal-overlay">
      <div className="report-modal glass-panel">
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>
        
        <h2>Create Global Alert</h2>
        <p className="subtitle">Notify all Warkaris in the network instantly.</p>

        {errorMsg && (
          <div className="error-banner">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-group">
            <label>Alert Type</label>
            <select value={type} onChange={e => setType(e.target.value)}>
              <option value="missing_person">Missing Person</option>
              <option value="found_item">Found Item</option>
              <option value="medical_emergency">Medical Emergency</option>
              <option value="other">Other Alert</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description (Details, identifying marks, etc.)</label>
            <textarea 
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Please provide clear details..."
              required
            />
          </div>

          <div className="form-group">
            <label>Photo Attachment (Optional)</label>
            {media.length > 0 ? (
              <div className="media-preview-container">
                {media.map((url, i) => (
                  <img key={i} src={url} alt="upload" className="media-preview" />
                ))}
              </div>
            ) : (
              <label className="image-upload-btn">
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                <Camera size={24} />
                <span>{isUploading ? 'Uploading...' : 'Upload Photo'}</span>
              </label>
            )}
          </div>

          <div className="info-banner">
            <Phone size={16} />
            <span>Your registered phone number will be attached so others can contact you.</span>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting ? 'Broadcasting...' : 'Broadcast Alert'}
          </button>
        </form>
      </div>
    </div>
  );
};
