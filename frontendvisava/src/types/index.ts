export interface LocationPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Service {
  _id: string;
  name: string;
  type: "medical" | "food" | "water" | "shelter" | "toilet" | "other" | "camp" | "helper";
  location: LocationPoint;
  address?: string;
  description?: string;
  contactPhone?: string;
  available: boolean;
  media: string[];
  verified: boolean;
  createdBy?: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
  userId?: string;
}
