import { Types } from "mongoose";

export type UserRole = "varkari" | "helper" | "admin";

export interface IUser {
  _id: Types.ObjectId;
  phoneNumber?: string;
  email?: string;
  googleId?: string;
  role: UserRole;
  name?: string;
  avatar?: string;
  age?: number;
  gender?: "male" | "female" | "other";
  city?: string;
  profileComplete: boolean;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ReportType = "missing_person" | "found_item" | "medical_emergency" | "other";
export type ReportStatus = "pending" | "confirmed" | "resolved" | "dismissed";

export interface IReport {
  _id: Types.ObjectId;
  type: ReportType;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  description: string;
  reporterPhone: string;
  status: ReportStatus;
  confirmationCode?: string;
  confirmedAt?: Date;
  radius: number;
  media: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type WariStatus = "active" | "inactive";

export interface IWari {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  route: {
    type: "LineString";
    coordinates: [number, number][];
  };
  startPoint: {
    type: "Point";
    coordinates: [number, number];
  };
  endPoint: {
    type: "Point";
    coordinates: [number, number];
  };
  associatedPlace?: string;
  history?: string;
  status: WariStatus;
  leader?: Types.ObjectId;
  contactPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CampType = "medical" | "food" | "shelter" | "rest" | "other";

export interface ICamp {
  _id: Types.ObjectId;
  name: string;
  type: CampType;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  description?: string;
  city?: string;
  contactPhone?: string;
  operatingHours?: string;
  services: string[];
  media?: string[];
  operator: Types.ObjectId;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ServiceType = "medical" | "food" | "water" | "shelter" | "other";

export interface IService {
  _id: Types.ObjectId;
  name: string;
  type: ServiceType;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  contactPhone?: string;
  city?: string;
  description?: string;
  available: boolean;
  media?: string[];
  operator: Types.ObjectId;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
  phoneNumber?: string;
  email?: string;
}
