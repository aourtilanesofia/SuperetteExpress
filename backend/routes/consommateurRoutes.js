import express from 'express';
import { connexionController, getConsommateurProfileController, inscriptionController, updateMDPController, updateProfileController } from '../controllers/consommateurController.js';
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
router.put('/update-mdp', isAuth,updateMDPController);


export default router;