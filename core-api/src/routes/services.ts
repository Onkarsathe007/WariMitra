import { Router, Request, Response } from "express";
import { Service } from "../models/Service";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createServiceSchema, updateServiceSchema, serviceQuerySchema } from "../schemas/services";
import { NotFoundError } from "../utils/AppError";
import { syncLocation, removeLocation } from "../services/geoClient";

const router = Router();

router.get("/", validate(serviceQuerySchema, "query"), async (req: Request, res: Response) => {
  const { lat, lng, radius, type, available, page, limit } = req.query as any;

  const filter: Record<string, unknown> = {};
  if (type) filter.type = type;
  if (available !== undefined) filter.available = available;

  if (lat !== undefined && lng !== undefined) {
    filter.location = {
      $near: {
        $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
        $maxDistance: Number(radius) * 1000,
      },
    };
  }

  console.log("EXECUTING MONGO QUERY IN EXPRESS:", JSON.stringify(filter, null, 2));

  if ((global as any).MOCK_DB_MODE) {
    console.log("MOCK DB MODE ACTIVE: Returning static mock services.");
    return res.json({
      status: "ok",
      services: [
        {
          _id: "mock_service_1",
          name: type === "food" ? "Annachhatra Food Camp" : type === "medical" ? "Emergency Medical Camp" : "Pandharpur Shelter",
          type: type || "food",
          location: { type: "Point", coordinates: [75.3236, 17.6772] },
          contactPhone: "+919876543210",
          available: true
        }
      ],
      pagination: { page, limit, total: 1, pages: 1 }
    });
  }

  const skip = (page - 1) * limit;
  const services = await Service.find(filter).select("-__v").populate("operator", "name phoneNumber").skip(skip).limit(limit).sort({ createdAt: -1 });
  const total = filter.location ? services.length : await Service.countDocuments(filter);

  res.json({
    status: "ok",
    services,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

router.get("/:id", async (req: Request, res: Response) => {
  const service = await Service.findById(req.params.id).select("-__v").populate("operator", "name phoneNumber");
  if (!service) throw new NotFoundError("Service not found");
  res.json({ status: "ok", service });
});

router.post("/", authenticate, authorize("helper", "admin"), validate(createServiceSchema), async (req: Request, res: Response) => {
  const service = await Service.create({ ...req.body, operator: req.user!.userId });
  if (service.location && service.location.coordinates) {
    await syncLocation(service.id, "service", service.location.coordinates[1], service.location.coordinates[0]);
  }
  res.status(201).json({ status: "ok", service });
});

router.patch("/:id", authenticate, validate(updateServiceSchema), async (req: Request, res: Response) => {
  const service = await Service.findById(req.params.id);
  if (!service) throw new NotFoundError("Service not found");

  if (service.operator.toString() !== req.user!.userId && req.user!.role !== "admin") {
    res.status(403).json({ status: "error", message: "Not authorized" });
    return;
  }

  Object.assign(service, req.body);
  await service.save();
  if (service.location && service.location.coordinates) {
    await syncLocation(service.id, "service", service.location.coordinates[1], service.location.coordinates[0]);
  }
  res.json({ status: "ok", service });
});

router.delete("/:id", authenticate, async (req: Request, res: Response) => {
  const service = await Service.findById(req.params.id);
  if (!service) throw new NotFoundError("Service not found");

  if (service.operator.toString() !== req.user!.userId && req.user!.role !== "admin") {
    res.status(403).json({ status: "error", message: "Not authorized" });
    return;
  }

  await service.deleteOne();
  await removeLocation(service.id);
  res.json({ status: "ok", message: "Service deleted" });
});

export default router;
