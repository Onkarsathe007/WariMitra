import { Router, Request, Response } from "express";
import { User } from "../models/User";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { updateUserSchema } from "../schemas/users";
import { NotFoundError } from "../utils/AppError";

const router = Router();

router.get("/", authenticate, authorize("admin"), async (_req: Request, res: Response) => {
  const users = await User.find().select("-__v").sort({ createdAt: -1 });
  res.json({ status: "ok", users });
});

router.get("/:id", authenticate, async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select("-__v");
  if (!user) throw new NotFoundError("User not found");
  res.json({ status: "ok", user });
});

router.patch("/:id", authenticate, validate(updateUserSchema), async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!user) throw new NotFoundError("User not found");
  res.json({ status: "ok", user });
});

export default router;
