import { z } from "zod";

const pointSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.tuple([z.number(), z.number()]),
});

const lineStringSchema = z.object({
  type: z.literal("LineString"),
  coordinates: z.array(z.tuple([z.number(), z.number()])).min(2),
});

export const createWariSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  route: lineStringSchema,
  startPoint: pointSchema,
  endPoint: pointSchema,
  associatedPlace: z.string().max(200).optional(),
  history: z.string().max(5000).optional(),
  contactPhone: z.string().max(15).optional(),
});

export const updateWariSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  route: lineStringSchema.optional(),
  startPoint: pointSchema.optional(),
  endPoint: pointSchema.optional(),
  associatedPlace: z.string().max(200).optional(),
  history: z.string().max(5000).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  contactPhone: z.string().max(15).optional(),
});

export const wariQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(0.1).max(100).default(10),
  status: z.enum(["active", "inactive"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});
