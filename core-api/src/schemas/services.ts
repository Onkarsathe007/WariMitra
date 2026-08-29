import { z } from "zod";

const pointSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.tuple([z.number(), z.number()]),
});

export const createServiceSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(["medical", "food", "water", "shelter", "other"]),
  location: pointSchema,
  contactPhone: z.string().max(15).optional(),
  city: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  available: z.boolean().default(true),
  media: z.array(z.string()).max(10).optional(),
});

export const updateServiceSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.enum(["medical", "food", "water", "shelter", "other"]).optional(),
  location: pointSchema.optional(),
  contactPhone: z.string().max(15).optional(),
  description: z.string().max(2000).optional(),
  available: z.boolean().optional(),
  media: z.array(z.string()).max(10).optional(),
});

export const serviceQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(0.1).max(100).default(10),
  type: z.enum(["medical", "food", "water", "shelter", "other"]).optional(),
  available: z.coerce.boolean().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});
