import { Router, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/User";
import { sendOtp, verifyOtp } from "../services/otp";
import { generateToken } from "../services/auth";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { sendOtpSchema, verifyOtpSchema, googleAuthSchema, profileUpdateSchema } from "../schemas/auth";
import { updateUserSchema } from "../schemas/users";
import { NotFoundError, AppError } from "../utils/AppError";
import { env } from "../config/env";

const router = Router();
const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

router.post("/google", validate(googleAuthSchema), async (req: Request, res: Response) => {
  const { credential } = req.body;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new AppError("Invalid Google credential", 401);
    }

    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
        user.avatar = picture || user.avatar;
        user.verified = true;
        await user.save();
      } else {
        user = await User.create({
          googleId,
          email,
          name,
          avatar: picture,
          role: "varkari",
          verified: true,
          profileComplete: false,
        });
      }
    } else {
      user.name = name || user.name;
      user.avatar = picture || user.avatar;
      await user.save();
    }

    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    });

    res.json({
      status: "ok",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        age: user.age,
        gender: user.gender,
        city: user.city,
        profileComplete: user.profileComplete,
        verified: user.verified,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    throw new AppError("Invalid Google credential", 401);
  }
});

router.patch("/profile", authenticate, validate(profileUpdateSchema), async (req: Request, res: Response) => {
  const { name, age, gender, city, role } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user!.userId,
    {
      name,
      age,
      gender,
      city,
      role,
      profileComplete: true,
    },
    { new: true }
  );

  if (!user) throw new NotFoundError("User not found");

  res.json({
    status: "ok",
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      age: user.age,
      gender: user.gender,
      city: user.city,
      profileComplete: user.profileComplete,
      verified: user.verified,
    },
  });
});

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
      email: user.email,
      phoneNumber: user.phoneNumber,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      age: user.age,
      gender: user.gender,
      city: user.city,
      profileComplete: user.profileComplete,
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
      email: user.email,
      phoneNumber: user.phoneNumber,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      age: user.age,
      gender: user.gender,
      city: user.city,
      profileComplete: user.profileComplete,
      verified: user.verified,
    },
  });
});

export default router;
