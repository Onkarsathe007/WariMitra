import { Router, Request, Response } from "express";
import { User } from "../models/User";
import { sendOtp, verifyOtp } from "../services/otp";
import { generateToken } from "../services/auth";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { sendOtpSchema, verifyOtpSchema } from "../schemas/auth";
import { updateUserSchema } from "../schemas/users";
import { NotFoundError } from "../utils/AppError";

const router = Router();

router.post("/send-otp", validate(sendOtpSchema), async (req: Request, res: Response) => {
  const { phoneNumber } = req.body;
  await sendOtp(phoneNumber);
  res.json({ status: "ok", message: "OTP sent" });
});

router.post("/verify-otp", validate(verifyOtpSchema), async (req: Request, res: Response) => {
  const { phoneNumber, code } = req.body;

  const valid = await verifyOtp(phoneNumber, code);
  if (!valid) {
    res.status(401).json({ status: "error", message: "Invalid OTP" });
    return;
  }

  let user = await User.findOne({ phoneNumber });
  if (!user) {
    user = await User.create({ phoneNumber, role: "varkari", verified: true });
  } else if (!user.verified) {
    user.verified = true;
    await user.save();
  }

  const token = generateToken({
    userId: user._id.toString(),
    role: user.role,
    phoneNumber: user.phoneNumber,
  });

  res.json({
    status: "ok",
    token,
    user: {
      id: user._id,
      phoneNumber: user.phoneNumber,
      role: user.role,
      name: user.name,
      verified: user.verified,
    },
  });
});

router.get("/me", authenticate, async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.userId);
  if (!user) throw new NotFoundError("User not found");

  res.json({
    status: "ok",
    user: {
      id: user._id,
      phoneNumber: user.phoneNumber,
      role: user.role,
      name: user.name,
      verified: user.verified,
      createdAt: user.createdAt,
    },
  });
});

router.patch("/me", authenticate, validate(updateUserSchema), async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(req.user!.userId, req.body, { new: true });
  if (!user) throw new NotFoundError("User not found");

  res.json({
    status: "ok",
    user: {
      id: user._id,
      phoneNumber: user.phoneNumber,
      role: user.role,
      name: user.name,
      verified: user.verified,
    },
  });
});

export default router;
