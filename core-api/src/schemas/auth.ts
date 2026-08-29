import { z } from "zod";

export const sendOtpSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
});

export const verifyOtpSchema = z.object({
  phoneNumber: z
    .string()
    .min(10)
    .max(15)
    .regex(/^\d+$/),
  code: z.string().length(6, "OTP must be 6 digits"),
});

export const googleAuthSchema = z.object({
  credential: z.string().min(1, "Google credential is required"),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  age: z.number().int().min(1).max(150).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  city: z.string().max(100).optional(),
  role: z.enum(["varkari", "helper"]).optional(),
});
