import express from 'express';
import { connexionController, getConsommateurProfileController,
     inscriptionController,  updateProfileController, 
     deleteAccountController, getAllConsommateurs, deleteConsommateur, 
     toggleStatus, getConsommateurByIdController, getActiveConsommateurCountController,
     getNotActiveConsommateurCountController } from '../controllers/consommateurController.js';
import  isAuth  from './../middlewares/authMiddelware.js';

//créer un objet router
const router = express.Router();
 
//les routes

//Inscription route
router.post('/inscription',inscriptionController);

//Connexion route
router.post('/connexion',connexionController);

//profile
router.get('/profile',isAuth, getConsommateurProfileController);

// Modifier le profile
router.put('/profile-update',isAuth,updateProfileController);

//modifier le MDP
//router.put('/update-mdp', isAuth,updateMDPController);

// Supprimer le compte
router.delete('/delete-account', isAuth, deleteAccountController);
 
//récupere les consommateur 

router.get('/tousConsommateur', getAllConsommateurs);

//Supprimer un consommateur

router.delete('/supConsommateur/:id',deleteConsommateur);

//Activer désactiver un consommateur 

router.put('/status/:id',toggleStatus);

// Récupérer le nombre de consommateurs actifs
router.get("/activeConsommateurs/count", getActiveConsommateurCountController);

//Récupérer le nombre des consommateurs non actifs

router.get("/nonactiveConsommateurs/count",getNotActiveConsommateurCountController);


// Récupérer un consommateur par son ID
router.get('/:id', getConsommateurByIdController);

export default router;