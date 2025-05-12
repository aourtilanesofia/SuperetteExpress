import express from 'express';
import { 
    connexionControllerL, 
    getLivreurProfileController, 
    inscriptionControllerL,  
    updateProfileControllerL, 
    deleteAccountControllerL,
    validerLivreur, 
    deleteLivreur, 
    getAllLivreurs, 
    getLivreurCountController,
    uploadProfilePicController,
    updatePosition, 
    findNearbyLivreurs,
    getCommandesAssignees,
     accepterCommande,
     refuserCommande
    
} from '../controllers/livreurController.js';
import isAuthL from './../middlewares/authMiddelwareL.js';
import multer from 'multer'; // Importez multer
import { CommandeModel } from '../models/OrderModel.js';
import livreurModel from '../models/livreurModel.js';


// Créez l'instance multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Dossier de stockage
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname); 
    }
});

// Initialisez upload avec la configuration
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite à 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Seules les images sont autorisées!'), false);
        }
    }
});

const router = express.Router();

// Routes existantes
router.post('/inscriptionL', inscriptionControllerL);
router.post('/connexionL', connexionControllerL);
router.get('/profileL', isAuthL, getLivreurProfileController);
router.put('/profile-updateL', isAuthL, updateProfileControllerL);
router.delete('/delete-accountL', isAuthL, deleteAccountControllerL);
router.get('/tousLivreurs', getAllLivreurs);
router.get("/count", getLivreurCountController);
router.put("/valider/:id", validerLivreur);
router.delete('/refuser/:id', deleteLivreur);

// Nouvelle route pour l'upload
router.post(
    '/upload-profile-pic',
    isAuthL,
    upload.single('profilePic'), // Utilisez l'instance configurée
    uploadProfilePicController
);

router.get('/me', isAuthL, async (req, res) => {
    try {
        const livreur = await Livreur.findById(req.user._id).select('-mdp');
        res.json(livreur);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Mettre à jour la position
router.route('/position').post(isAuthL, updatePosition);

// Trouver les livreurs proches
router.route('/nearby').get(findNearbyLivreurs);

router.post('/notify/:livreurId', (req, res) => {
  const requiredFields = [
    'numeroCommande',
    'adresseLivraison',
    'total'
  ];

  const missingFields = requiredFields.filter(field => !req.body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: "Données manquantes",
      missingFields,
      receivedData: req.body
    });
  }

  // Émettre l'événement Socket.IO
  req.io.to(`livreur-${req.params.livreurId}`).emit('nouvelle-commande', {
    ...req.body,
    date: new Date()
  });

  res.json({
    success: true,
    message: "Notification envoyée",
    livreurId: req.params.livreurId
  });
});

// Nouvelle route pour assigner une commande
router.post('/assigner', async (req, res) => {
    try {
        const { livreurId, numeroCommande } = req.body;

        const commande = await CommandeModel.findOne({ numeroCommande });
        if (!commande) {
            return res.status(404).json({ message: "Commande non trouvée" });
        }

        commande.livraison = "En attente";
        commande.livreur = livreurId;
        await commande.save();

        // Utilise req.io (comme dans ta route de notification)
        req.io.to(`livreur-${livreurId}`).emit('commande-assignee', {
            numeroCommande: commande.numeroCommande,
            client: req.body.client,
            adresse: req.body.adresse,
            total: req.body.total,
            infoSupplementaire: req.body.infoSupplementaire
        });

        res.json({ success: true });
    } catch (error) {
        console.error(error); // Ajoute ça pour voir l'erreur exacte
        res.status(500).json({ error: error.message });
    }
});


// Obtenir les commandes assignées à un livreur
router.get('/:livreurId/commandes-assignees', getCommandesAssignees);

router.put('/:numeroCommande/accept',accepterCommande);
router.put('/:numeroCommande/refuser', refuserCommande);

// Nouvelle route pour récupérer les infos du livreur
router.get('/:id', isAuthL, async (req, res) => {
    try {
        const livreur = await livreurModel.findById(req.params.id)
            .select('position lastPositionUpdate nom numTel');
            
        if (!livreur) {
            return res.status(404).json({
                success: false,
                message: "Livreur non trouvé"
            });
        }

        res.status(200).json({
            success: true,
            data: livreur
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur serveur"
        });
    }
});

// Dans votre API (backend)
router.get('/position/:livreurId', async (req, res) => {
    try {
      const livreur = await livreurModel.findById(req.params.livreurId)
        .select('position');
      
      if (!livreur) {
        return res.status(404).json({ message: 'Livreur non trouvé' });
      }
  
      res.json({
        position: livreur.position
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });


// Dans votre backend (ex: livreurRoutes.js)
router.get('/:id', async (req, res) => {
    try {
        const livreur = await livreurModel.findById(req.params.id)
            .select('nom numTel'); 

        if (!livreur) {
            return res.status(404).json({ message: "Livreur non trouvé" });
        }
        res.json(livreur);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


export default router;