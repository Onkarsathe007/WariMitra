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
