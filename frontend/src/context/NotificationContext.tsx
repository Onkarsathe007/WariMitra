import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export interface AlertNotification {
  _id: string;
  type: string;
  description: string;
  location?: {
    coordinates: [number, number];
  };
  reporterPhone: string;
  status: string;
  media?: string[];
  createdAt: string;
}

interface NotificationContextType {
  notifications: AlertNotification[];
  unreadCount: number;
  markAsRead: () => void;
  addNotification: (notification: AlertNotification) => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/v1/reports?status=confirmed&limit=20');
      if (res.data && res.data.reports) {
        setNotifications(res.data.reports);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const ws = new WebSocket('ws://localhost:8081/ws/location');
    
    ws.onopen = () => {
      console.log('Notification WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'alert') {
          // data.alertType holds the type, data.data holds the alert payload
          const newAlert: AlertNotification = {
            _id: data.data.reportId || Math.random().toString(),
            type: data.data.type || data.alertType,
            description: data.data.description || 'New Alert Received',
            location: data.data.location,
            reporterPhone: data.data.reporterPhone || 'Unknown',
            status: 'confirmed',
            media: data.data.media || [],
            createdAt: new Date().toISOString()
          };
          
          setNotifications(prev => [newAlert, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      } catch (err) {
        console.error('Notification WS parse error', err);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const markAsRead = () => {
    setUnreadCount(0);
  };

  const addNotification = (notif: AlertNotification) => {
    setNotifications(prev => [notif, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      addNotification,
      refreshNotifications: fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
