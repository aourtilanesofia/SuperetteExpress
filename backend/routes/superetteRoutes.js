import express from "express";
import {
  getNearbySuperettes,
  createSuperette,getAllSuperettes,
  getSuperetteById,
  addSuperette,
  updateSuperette,
  deleteSuperette,
} from "../controllers/superetteController.js";

const router = express.Router();

// GET /api/superettes/nearby?lat=...&lng=...&radius=...
router.get("/nearby", getNearbySuperettes);

// POST /api/superettes (pour ajouter des superettes)
router.post("/", createSuperette);
//récupérer toutes les supérettes
router.get("/", getAllSuperettes);

//récupérer une superette par id
router.get("/:id", getSuperetteById);

//ajouter une supérette
router.post("/", addSuperette);

//modifier une supérette
router.put("/:id", updateSuperette);

//supprimer une suppérette
router.delete("/:id", deleteSuperette);

export default router; 