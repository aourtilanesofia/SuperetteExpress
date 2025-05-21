import express from "express";
import {
  getNearbySuperettes,
  createSuperette,getAllSuperettes,
  getSuperetteById,
  addSuperette,
  updateSuperette,
  deleteSuperette,
  getSupCountController,
  getStatsParSuperette
} from "../controllers/superetteController.js";

import SuperetteModel from "../models/SuperetteModel.js";

const router = express.Router();

// GET /api/superettes/nearby?lat=...&lng=...&radius=...
router.get("/nearby", getNearbySuperettes);

// POST /api/superettes (pour ajouter des superettes)
router.post("/", createSuperette);

//récupérer toutes les supérettes
router.get("/", getAllSuperettes);

router.get('/count',getSupCountController);

//routes des statistique 

router.get("/stat", getStatsParSuperette);

router.get('/disponibles', async (req, res) => {
    try {
        // Trouver les supérettes sans commerçant associé
        const superettes = await SuperetteModel.find({ commercant: { $exists: false } });
        res.json(superettes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//récupérer une superette par id
router.get("/:id", getSuperetteById);

//ajouter une supérette
router.post("/", addSuperette);

//modifier une supérette
router.put("/:id", updateSuperette);

//supprimer une suppérette
router.delete("/:id", deleteSuperette);



export default router; 