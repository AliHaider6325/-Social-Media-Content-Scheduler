import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import { getStats, getUpcoming } from "./dashboard.controller.js";

const router = Router();

// Protect all dashboard routes
router.use(authMiddleware);

// Stats endpoint
router.get("/stats", getStats);

// Upcoming posts endpoint
router.get("/upcoming", getUpcoming);

export default router;
