import { Router } from "express";
import authRoutes from "./auth";
import userRoutes from "./users";
import wariRoutes from "./waris";
import campRoutes from "./camps";
import serviceRoutes from "./services";
import reportRoutes from "./reports";
import uploadRoutes from "./upload";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/waris", wariRoutes);
router.use("/camps", campRoutes);
router.use("/services", serviceRoutes);
router.use("/reports", reportRoutes);
router.use("/upload", uploadRoutes);

export default router;
