import { z } from "zod";

const pointSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.tuple([z.number(), z.number()]),
});

export const createReportSchema = z.object({
  type: z.enum(["missing_person", "found_item", "medical_emergency", "other"]),
  location: pointSchema,
  description: z.string().min(10).max(5000),
  radius: z.number().min(0.1).max(50).default(2),
  media: z.array(z.string()).max(10).optional(),
});

export const reportQuerySchema = z.object({
  type: z.enum(["missing_person", "found_item", "medical_emergency", "other"]).optional(),
  status: z.enum(["pending", "confirmed", "resolved", "dismissed"]).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(0.1).max(100).default(10),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});
