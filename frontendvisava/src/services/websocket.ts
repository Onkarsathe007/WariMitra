import type { UserLocation } from '../types';

export class GeoWebSocket {
  private ws: WebSocket | null = null;
  private url = 'ws://localhost:8081/ws/location';
  private wariId: string;
  private onLocationUpdate: (location: UserLocation) => void;

  constructor(wariId: string, onLocationUpdate: (location: UserLocation) => void) {
    this.wariId = wariId;
    this.onLocationUpdate = onLocationUpdate;
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('Connected to Geo Service');
      this.ws?.send(JSON.stringify({ type: 'join_wari', wariId: this.wariId }));
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'location_update') {
          this.onLocationUpdate({ lat: data.lat, lng: data.lng, userId: data.userId });
        }
      } catch (err) {
        console.error('WebSocket message parsing error', err);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  sendLocation(lat: number, lng: number) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'location_update',
        lat,
        lng,
        wariId: this.wariId
      }));
    }
  }

  disconnect() {
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'leave_wari', wariId: this.wariId }));
      }
      this.ws.close();
    }
  }
}
