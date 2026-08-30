import { Router, Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { Report } from "../models/Report";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createReportSchema, reportQuerySchema } from "../schemas/reports";
import { fanOut, syncLocation, removeLocation } from "../services/geoClient";
import { NotFoundError, BadRequestError } from "../utils/AppError";
import { logger } from "../utils/logger";

const router = Router();

router.get("/", validate(reportQuerySchema, "query"), async (req: Request, res: Response) => {
  const { type, status, lat, lng, radius, page, limit } = req.query as any;

  const filter: Record<string, unknown> = {};
  if (type) filter.type = type;
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
  const reports = await Report.find(filter).select("-__v").skip(skip).limit(limit).sort({ createdAt: -1 });
  const total = filter.location ? reports.length : await Report.countDocuments(filter);

  res.json({
    status: "ok",
    reports,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

router.get("/:id", async (req: Request, res: Response) => {
  const report = await Report.findById(req.params.id).select("-__v");
  if (!report) throw new NotFoundError("Report not found");
  res.json({ status: "ok", report });
});

router.post("/", authenticate, validate(createReportSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const confirmationCode = uuidv4().slice(0, 8).toUpperCase();

  const report = await Report.create({
    ...req.body,
    reporterPhone: req.user!.phoneNumber || req.body.reporterPhone || "unknown",
    confirmationCode,
    status: "pending",
  });

    logger.info({ reportId: report._id, type: report.type }, "Report created");

    res.status(201).json({
      status: "ok",
      report,
      confirmationCode,
      message: "Report created. Please confirm to activate alert.",
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/confirm", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) throw new NotFoundError("Report not found");

  if (req.user!.role !== "admin" && report.reporterPhone !== req.user!.phoneNumber && report.reporterPhone !== "unknown") {
    throw new BadRequestError("Only the reporter can confirm this report");
  }

    if (report.status !== "pending") {
      throw new BadRequestError(`Report is already ${report.status}`);
    }

    report.status = "confirmed";
    report.confirmedAt = new Date();
    await report.save();

  if (["missing_person", "found_item", "medical_emergency"].includes(report.type)) {
    if (report.location && report.location.coordinates) {
      await syncLocation(report.id, "report", report.location.coordinates[1], report.location.coordinates[0]);
    }
    const fanOutResult = await fanOut({
      location: {
        lat: report.location.coordinates[1],
        lng: report.location.coordinates[0],
      },
      radius: report.radius,
      alertType: report.type as "missing_person" | "found_item" | "medical_emergency",
      alertData: {
        reportId: report._id.toString(),
        type: report.type,
        description: report.description,
        location: report.location,
      },
    });

    logger.info(
      { reportId: report._id, targetCount: fanOutResult.targetCount },
      "Alert fan-out triggered"
    );
  }

    res.json({ status: "ok", report });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/resolve", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) throw new NotFoundError("Report not found");

    if (report.status !== "confirmed") {
      throw new BadRequestError(`Cannot resolve a report with status: ${report.status}`);
    }

    report.status = "resolved";
    await report.save();
    await removeLocation(report.id);

    res.json({ status: "ok", report });
  } catch (error) {
    next(error);
  }
});

export default router;
