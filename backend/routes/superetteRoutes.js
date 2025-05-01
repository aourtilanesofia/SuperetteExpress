import express from "express";
import {
  getNearbySuperettes,
  createSuperette
} from "../controllers/superetteController.js";

const router = express.Router();

// GET /api/superettes/nearby?lat=...&lng=...&radius=...
router.get("/nearby", getNearbySuperettes);

// POST /api/superettes (pour ajouter des superettes)
router.post("/", createSuperette);

export default router;