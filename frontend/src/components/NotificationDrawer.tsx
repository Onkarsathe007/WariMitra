import React, { useState } from 'react';
import { X, Bell, Phone, AlertTriangle, Info } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { CreateReportModal } from './CreateReportModal';
import './NotificationDrawer.css';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markAsRead } = useNotifications();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mark as read when opened
  React.useEffect(() => {
    if (isOpen) {
      markAsRead();
    }
  }, [isOpen]);

  if (!isOpen && !showCreateModal) return null;

  return (
    <>
      <div className={`notification-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      
      <div className={`notification-drawer glass-panel ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="header-title">
            <Bell size={20} className="text-primary" />
            <h2>Global Alerts</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-actions">
          <button className="create-alert-btn" onClick={() => setShowCreateModal(true)}>
            <AlertTriangle size={18} />
            <span>Report Missing Person / Item</span>
          </button>
        </div>

        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="empty-state">
              <Info size={32} opacity={0.5} />
              <p>No active alerts at the moment.</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div key={notif._id} className="notification-card">
                <div className="card-header">
                  <span className={`badge type-${notif.type.replace('_', '-')}`}>
                    {notif.type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="time">{new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                
                <p className="description">{notif.description}</p>
                
                {notif.media && notif.media.length > 0 && (
                  <div className="media-container">
                    {notif.media.map((url, i) => (
                      <img key={i} src={url} alt="Alert Attachment" className="alert-image" />
                    ))}
                  </div>
                )}
                
                <a href={`tel:${notif.reporterPhone}`} className="contact-btn">
                  <Phone size={16} />
                  <span>Call {notif.reporterPhone}</span>
                </a>
              </div>
            ))
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateReportModal onClose={() => setShowCreateModal(false)} />
      )}
    </>
  );
};
