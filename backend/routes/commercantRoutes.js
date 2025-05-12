import express from 'express';
import { 
  inscriptionCommercantController,
  connexionCommercantController,
  getCommercantProfileController, 
  updateCommercantProfileController,
  deleteCommercantAccountController,
  getAllCommercants,
  deleteCommercant,
  toggleStatus,
  getCommercantByIdController,
  getCommercantCountController,
} from '../controllers/commercantController.js';
import isAuthCom from '../middlewares/authMiddelwareCom.js';

// Créer un objet router
const router = express.Router();

// Les routes

// Inscription route
router.post('/inscription', inscriptionCommercantController);

// Connexion route
router.post('/connexion', connexionCommercantController);

// Profile route
router.get('/profile', isAuthCom, getCommercantProfileController);

// Modifier le profil
router.put('/modifier', isAuthCom, updateCommercantProfileController); 

// Supprimer le compte
router.delete('/delete-account', isAuthCom, deleteCommercantAccountController);

// Récupérer tous les commerçants
router.get('/tousCommercants', getAllCommercants);

// Supprimer un commerçant
router.delete('/supCommercant/:id', deleteCommercant);

// Activer ou désactiver un commerçant
router.put('/status/:id', toggleStatus);

//Récupérer le nombre des commerçants
router.get("/count", getCommercantCountController);


// Récupérer un commerçant par son ID
router.get('/:id', getCommercantByIdController);

export default router;
