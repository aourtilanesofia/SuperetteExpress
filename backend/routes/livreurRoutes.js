import express from 'express';
import { connexionControllerL, getLivreurProfileController, inscriptionControllerL,  updateProfileControllerL, deleteAccountControllerL, validerLivreur, deleteLivreur, getAllLivreurs } from '../controllers/livreurController.js';
import  isAuthL  from './../middlewares/authMiddelwareL.js';

//créer un objet router
const router = express.Router();

//les routes

//Inscription route
router.post('/inscriptionL',inscriptionControllerL);

//Connexion route
router.post('/connexionL',connexionControllerL);

//profile
router.get('/profileL',isAuthL, getLivreurProfileController);

// Modifier le profile
router.put('/profile-updateL',isAuthL,updateProfileControllerL);

//modifier le MDP
//router.put('/update-mdp', isAuth,updateMDPController);

// Supprimer le compte
router.delete('/delete-accountL', isAuthL, deleteAccountControllerL);

//tous les livreurs
router.get('/tousLivreurs', getAllLivreurs);

//Valider livreur
router.put("/valider/:id", validerLivreur); 


//refuser livreur
router.delete('/refuser/:id',deleteLivreur);








export default router;