import { Router, Request, Response } from "express";
import { Camp } from "../models/Camp";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createCampSchema, updateCampSchema, campQuerySchema } from "../schemas/camps";
import { NotFoundError } from "../utils/AppError";
import { syncLocation } from "../services/geoClient";

const router = Router();

router.get("/", validate(campQuerySchema, "query"), async (req: Request, res: Response) => {
  const { lat, lng, radius, type, page, limit } = req.query as any;

  const filter: Record<string, unknown> = {};
  if (type) filter.type = type;

  if (lat !== undefined && lng !== undefined) {
    filter.location = {
      $near: {
        $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
        $maxDistance: Number(radius) * 1000,
      },
    };
  }

  if ((global as any).MOCK_DB_MODE) {
    console.log("MOCK DB MODE ACTIVE: Returning static mock camps.");
    return res.json({
      status: "ok",
      camps: [
        {
          _id: "mock_camp_1",
          name: type === "medical" ? "Wakhari Medical Camp" : "Wakhari Relief Camp",
          type: type || "medical",
          location: { type: "Point", coordinates: [75.3236, 17.6772] },
          contactPhone: "+918888888888",
          capacity: 100,
          currentOccupancy: 10
        }
      ],
      pagination: { page, limit, total: 1, pages: 1 }
    });
  }

  const skip = (page - 1) * limit;
  const camps = await Camp.find(filter).select("-__v").populate("operator", "name phoneNumber").skip(skip).limit(limit).sort({ createdAt: -1 });
  const total = filter.location ? camps.length : await Camp.countDocuments(filter);

  res.json({
    status: "ok",
    camps,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

router.get("/:id", async (req: Request, res: Response) => {
  const camp = await Camp.findById(req.params.id).select("-__v").populate("operator", "name phoneNumber");
  if (!camp) throw new NotFoundError("Camp not found");
  res.json({ status: "ok", camp });
});

router.post("/", authenticate, authorize("helper", "admin"), validate(createCampSchema), async (req: Request, res: Response) => {
  const camp = await Camp.create({ ...req.body, operator: req.user!.userId });
  if (camp.location && camp.location.coordinates) {
    await syncLocation(camp.id, camp.type || "camp", camp.location.coordinates[1], camp.location.coordinates[0]);
  }
  res.status(201).json({ status: "ok", camp });
});

router.patch("/:id", authenticate, validate(updateCampSchema), async (req: Request, res: Response) => {
  const camp = await Camp.findById(req.params.id);
  if (!camp) throw new NotFoundError("Camp not found");

  if (camp.operator.toString() !== req.user!.userId && req.user!.role !== "admin") {
    res.status(403).json({ status: "error", message: "Not authorized" });
    return;
  }

  Object.assign(camp, req.body);
  await camp.save();
  if (camp.location && camp.location.coordinates) {
    await syncLocation(camp.id, camp.type || "camp", camp.location.coordinates[1], camp.location.coordinates[0]);
  }
  res.json({ status: "ok", camp });
});

export default router;
