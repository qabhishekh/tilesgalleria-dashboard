import { Router } from "express";
import { getDashboardSummary } from "../controllers/dashboardController.js";

const r = Router();
r.get("/summary", getDashboardSummary);
export default r;
