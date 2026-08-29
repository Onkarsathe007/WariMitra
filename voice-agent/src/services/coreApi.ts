import axios, { AxiosInstance } from "axios";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { ServiceResult, ReportResult } from "../types";

const coreClient: AxiosInstance = axios.create({
  baseURL: env.CORE_API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export async function findNearbyServices(
  type: string,
  lat: number,
  lng: number,
  radius: number = 5
): Promise<ServiceResult[]> {
  try {
    const response = await coreClient.get("/api/v1/services", {
      params: { type, lat, lng, radius, available: true, limit: 5 },
    });
    return response.data.services || [];
  } catch (error) {
    logger.error({ err: error, type, lat, lng }, "Failed to find nearby services");
    return [];
  }
}

export async function findNearbyCamps(
  type: string,
  lat: number,
  lng: number,
  radius: number = 5
): Promise<ServiceResult[]> {
  try {
    const response = await coreClient.get("/api/v1/camps", {
      params: { type, lat, lng, radius, limit: 5 },
    });
    return response.data.camps || [];
  } catch (error) {
    logger.error({ err: error, type, lat, lng }, "Failed to find nearby camps");
    return [];
  }
}

export async function createReport(data: {
  type: string;
  location: { type: "Point"; coordinates: [number, number] };
  description: string;
  reporterPhone: string;
  radius?: number;
}): Promise<ReportResult | null> {
  try {
    const response = await coreClient.post("/api/v1/reports", data, {
      headers: {
        Authorization: `Bearer ${env.INTERNAL_API_KEY}`,
      },
    });
    return response.data.report;
  } catch (error) {
    logger.error({ err: error, data }, "Failed to create report");
    return null;
  }
}
export async function getReport(id: string): Promise<ReportResult | null> {
  try {
    const response = await coreClient.get(`/api/v1/reports/${id}`, {
      headers: {
        Authorization: `Bearer ${env.INTERNAL_API_KEY}`,
      },
    });
    return response.data.report;
  } catch (error) {
    logger.error({ err: error, id }, "Failed to get report");
    return null;
  }
}

export async function findHelpers(): Promise<any[]> {
  try {
    const response = await coreClient.get("/api/v1/users", {
      headers: {
        Authorization: `Bearer ${env.INTERNAL_API_KEY}`,
      },
    });
    const users = response.data.users || [];
    // Filter out only helpers and verified ones if possible
    return users.filter((u: any) => u.role === "helper" && u.verified === true);
  } catch (error) {
    logger.error({ err: error }, "Failed to find helpers");
    return [];
  }
}
