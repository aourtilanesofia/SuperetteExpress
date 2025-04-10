import express from 'express';
import { getRecetteParIngredients } from '../controllers/recetteController.js';

const router = express.Router();

router.post('/recherche', getRecetteParIngredients);

export default router;
