import axios, { AxiosInstance } from "axios";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const geoClient: AxiosInstance = axios.create({
  baseURL: env.GEO_SERVICE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export interface RadiusQueryParams {
  lat: number;
  lng: number;
  radius: number;
  type: "varkari" | "camp" | "service" | "all";
}

export interface NearbyResult {
  id: string;
  lat: number;
  lng: number;
  distance: number;
  type: string;
  metadata: Record<string, unknown>;
}

export interface FanOutParams {
  location: { lat: number; lng: number };
  radius: number;
  alertType: "missing_person" | "found_item" | "medical_emergency";
  alertData: Record<string, unknown>;
}

export async function radiusQuery(params: RadiusQueryParams): Promise<NearbyResult[]> {
  try {
    const response = await geoClient.post("/internal/geo/radius-query", params);
    return response.data.results;
  } catch (error) {
    logger.error({ err: error, params }, "Geo Service radius query failed");
    return [];
  }
}

export async function fanOut(params: FanOutParams): Promise<{ targetCount: number; targets: NearbyResult[] }> {
  try {
    const response = await geoClient.post("/internal/geo/fan-out", params);
    return response.data;
  } catch (error) {
    logger.error({ err: error, params }, "Geo Service fan-out failed");
    return { targetCount: 0, targets: [] };
  }
}

export async function getWariLocation(wariId: string): Promise<{ lat: number; lng: number; lastUpdated: string } | null> {
  try {
    const response = await geoClient.get(`/internal/geo/wari-location/${wariId}`);
    return response.data;
  } catch (error) {
    logger.error({ err: error, wariId }, "Geo Service get wari location failed");
    return null;
  }
}

export async function syncLocation(memberId: string, type: string, lat: number, lng: number): Promise<void> {
  try {
    await geoClient.post("/internal/geo/location", {
      memberId,
      type,
      lat,
      lng
    });
  } catch (error) {
    logger.error({ err: error, memberId }, "Geo Service sync location failed");
  }
}

export async function removeLocation(memberId: string): Promise<void> {
  try {
    await geoClient.delete(`/internal/geo/location/${memberId}`);
  } catch (error) {
    logger.error({ err: error, memberId }, "Geo Service remove location failed");
  }
}
