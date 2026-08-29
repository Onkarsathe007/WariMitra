import twilio from "twilio";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { AppError } from "../utils/AppError";

const client = env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN
  ? twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
  : null;

export async function sendOtp(phoneNumber: string): Promise<void> {
  if (!client || !env.TWILIO_VERIFY_SERVICE_SID) {
    logger.warn("Twilio not configured — using dev mode OTP (always 123456)");
    return;
  }

  try {
    await client.verify.v2
      .services(env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: `+${phoneNumber}`, channel: "sms" });
    logger.info({ phoneNumber }, "OTP sent");
  } catch (error) {
    logger.error({ err: error, phoneNumber }, "Failed to send OTP");
    throw new AppError("Failed to send OTP", 500);
  }
}

export async function verifyOtp(phoneNumber: string, code: string): Promise<boolean> {
  if (!client || !env.TWILIO_VERIFY_SERVICE_SID) {
    logger.warn("Twilio not configured — using dev mode OTP");
    return code === "123456";
  }

  try {
    const verification = await client.verify.v2
      .services(env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: `+${phoneNumber}`, code });

    return verification.status === "approved";
  } catch (error) {
    logger.error({ err: error, phoneNumber }, "Failed to verify OTP");
    return false;
  }
}
