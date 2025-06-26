import express from 'express';
import {addCategorie, getCategories,  updateCategorie, deleteCategorie, getCategorieCount} from  '../controllers/categorieController.js';

const router = express.Router();
// Ajouter une catégorie
router.post('/add',addCategorie);

// Récupérer toutes les catégories
router.get('/',getCategories);

//Récupérer le nombre de catégories
router.get('/count', getCategorieCount); 

// Modifier une catégorie
router.put('/update/:id',updateCategorie);

// Supprimer une catégorie
router.delete('/delete/:id',deleteCategorie);

export default router;
