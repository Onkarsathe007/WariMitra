import { z } from "zod";

const pointSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.tuple([z.number(), z.number()]),
});

export const createCampSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(["medical", "food", "shelter", "rest", "other"]),
  location: pointSchema,
  city: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  contactPhone: z.string().max(15).optional(),
  operatingHours: z.string().max(100).optional(),
  services: z.array(z.string().max(100)).max(20).optional(),
  media: z.array(z.string()).max(10).optional(),
});

export const updateCampSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.enum(["medical", "food", "shelter", "rest", "other"]).optional(),
  location: pointSchema.optional(),
  city: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  contactPhone: z.string().max(15).optional(),
  operatingHours: z.string().max(100).optional(),
  services: z.array(z.string().max(100)).max(20).optional(),
  media: z.array(z.string()).max(10).optional(),
});

export const campQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(0.1).max(100).default(10),
  type: z.enum(["medical", "food", "shelter", "rest", "other"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});
