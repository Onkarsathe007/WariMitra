import { Router, Request, Response } from "express";
import { Wari } from "../models/Wari";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createWariSchema, updateWariSchema, wariQuerySchema } from "../schemas/waris";
import { NotFoundError } from "../utils/AppError";

const router = Router();

router.get("/", validate(wariQuerySchema, "query"), async (req: Request, res: Response) => {
  const { lat, lng, radius, status, page, limit } = req.query as any;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  if (lat !== undefined && lng !== undefined) {
    filter.location = {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: radius * 1000,
      },
    };
  }

  const skip = (page - 1) * limit;
  const [waris, total] = await Promise.all([
    Wari.find(filter).select("-__v").skip(skip).limit(limit).sort({ createdAt: -1 }),
    Wari.countDocuments(filter),
  ]);

  res.json({
    status: "ok",
    waris,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

router.get("/:id", async (req: Request, res: Response) => {
  const wari = await Wari.findById(req.params.id).select("-__v");
  if (!wari) throw new NotFoundError("Wari not found");
  res.json({ status: "ok", wari });
});

router.post("/", authenticate, authorize("admin"), validate(createWariSchema), async (req: Request, res: Response) => {
  const wari = await Wari.create(req.body);
  res.status(201).json({ status: "ok", wari });
});

router.patch("/:id", authenticate, authorize("admin"), validate(updateWariSchema), async (req: Request, res: Response) => {
  const wari = await Wari.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!wari) throw new NotFoundError("Wari not found");
  res.json({ status: "ok", wari });
});

export default router;
