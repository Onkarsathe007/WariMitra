# Visava Frontend Integration Guide (Backend Info)

This document contains everything you need to connect the React frontend to the Visava backend services. The backend is split into two microservices:
1. **Core API (Node.js):** Handles authentication, users, CRUD operations for camps/services/reports.
2. **Geo Service (Golang):** Handles real-time location tracking and WebSocket connections.

---

## 1. Base URLs (Local Development)

- **Core API (REST):** `http://localhost:3000`
- **Geo Service (HTTP):** `http://localhost:8081`
- **Geo Service (WebSockets):** `ws://localhost:8081/ws/location`

---

## 2. Authentication Flow (Passwordless)

The app uses phone number + OTP authentication. Passwords are not used.

1. **Request OTP:**
   ```http
   POST http://localhost:3000/api/v1/auth/send-otp
   Content-Type: application/json
   
   {
     "phoneNumber": "+919876543210"
   }
   ```
   *Note: In development (`NODE_ENV=development`), you can bypass Twilio and use the hardcoded OTP `123456`.*

2. **Verify OTP & Get Token:**
   ```http
   POST http://localhost:3000/api/v1/auth/verify-otp
   Content-Type: application/json
   
   {
     "phoneNumber": "+919876543210",
     "code": "123456"
   }
   ```
   **Response:**
   ```json
   {
     "status": "ok",
     "token": "eyJhbGciOiJIUzI1NiIsInR...",
     "user": {
       "id": "6a92af392ae87...",
       "role": "varkari" // or "helper", "admin"
     }
   }
   ```

3. **Attach Token to Requests:**
   For any protected routes, include the token in the `Authorization` header:
   ```http
   Authorization: Bearer <your_jwt_token>
   ```

---

## 3. Core API Endpoints (CRUD)

All Core API endpoints are prefixed with `/api/v1`.

### Camps & Services (Food, Water, Medical, Shelter)
These endpoints are public (no JWT required) for reading. Creating/Updating requires Auth.

- `GET /camps` — List camps (Supports query params: `?lat=&lng=&radius=&type=`)
- `GET /camps/:id` — Get specific camp details
- `POST /camps` — Create a camp (Requires JWT)
- `GET /services` — List helper services (Supports query params: `?lat=&lng=&radius=&type=`)
- `POST /services` — Create a service (Requires JWT)

**Example Response for `/services`:**
```json
{
  "status": "ok",
  "services": [
    {
      "_id": "6a92af...",
      "name": "Shri Gajanan Maharaj Annachhatra",
      "type": "food",
      "description": "Serving Mahaprasad twice a day.",
      "available": true,
      "verified": true,
      "media": ["https://images.unsplash.com/..."],
      "location": {
        "type": "Point",
        "coordinates": [75.321, 17.675] // [longitude, latitude]
      }
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "pages": 1 }
}
```

### Reports (Missing Persons / Medical Emergencies)
- `GET /reports` — List reports (query: `?type=&status=&lat=&lng=&radius=`)
- `POST /reports` — Create a new report (Requires JWT)
- `PATCH /reports/:id/confirm` — Confirm a report (Required before public alerts are sent out!)

---

## 4. Real-Time Tracking & WebSockets (Geo Service)

To track pilgrims and show them moving on the map in real-time, connect to the Golang Geo Service WebSocket hub.

**WebSocket URL:** `ws://localhost:8081/ws/location`

### How to use the WebSocket:

1. **Connect and Join a Wari (Room):**
   When the map component mounts, open the socket and send a `join_wari` message.
   ```json
   { "type": "join_wari", "wariId": "wari-123" }
   ```

2. **Send User's Live Location:**
   As the user walks, grab their GPS coordinates via the browser's `navigator.geolocation` and send it to the socket:
   ```json
   { 
     "type": "location_update", 
     "lat": 18.5204, 
     "lng": 73.8567, 
     "wariId": "wari-123" 
   }
   ```

3. **Listen for Other Users' Locations:**
   The server will broadcast location updates from *other* users in the same Wari room. Listen for these to update markers on your React Map (Leaflet):
   ```json
   { 
     "type": "location_update", 
     "wariId": "wari-123", 
     "lat": 18.5209, 
     "lng": 73.8571 
   }
   ```

4. **Leave Room:**
   When unmounting the map:
   ```json
   { "type": "leave_wari", "wariId": "wari-123" }
   ```

---

## 5. Data Models & Schemas

### User
```typescript
{
  _id: string;
  phoneNumber: string;
  role: "varkari" | "helper" | "admin";
  name?: string;
  verified: boolean;
  createdAt: string;
}
```

### Service / Camp
```typescript
{
  _id: string;
  name: string;
  type: "medical" | "food" | "water" | "shelter" | "other";
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude] !! Order is important for GeoJSON !!
  };
  address?: string;
  description?: string;
  contactPhone?: string;
  available: boolean;
  media: string[]; // Array of image URLs
  verified: boolean;
  createdBy: string; // User ID
}
```

### Report
```typescript
{
  _id: string;
  type: "missing_person" | "found_item" | "medical_emergency";
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  description: string;
  reporterPhone: string;
  status: "pending_confirmation" | "confirmed" | "resolved";
  radius: number; // km
}
```

---

## 💡 Frontend Tips for Visava
- **Coordinates:** MongoDB and GeoJSON always use `[longitude, latitude]`. Leaflet (and Google Maps) usually use `[latitude, longitude]`. Be careful to flip them when passing data from the API to your map markers!
- **Offline First:** Since Varkaris often lose internet, make sure to cache the map tiles (Leaflet + OpenStreetMap) and use React Query or a Service Worker to cache API responses.
- **Images:** Service and Camp images are provided in the `media` array as full URLs (from Unsplash for now, or local paths). Always check if `media.length > 0` before trying to render an `<img>`.
