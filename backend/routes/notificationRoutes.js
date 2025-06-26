import express from 'express';
import Notification from '../models/NotificationModel.js';

const router = express.Router();

// Créer une nouvelle notification (AJOUTEZ CETTE ROUTE)
router.post('/', async (req, res) => {
    try {
        const { message, livreurId, role } = req.body;
        
        // Validation des données
        if (!message || !role) {
            return res.status(400).json({ message: "Message et role sont obligatoires" });
        }

        const newNotification = new Notification({
            message,
            livreurId,
            role,
            isRead: false
        });

        await newNotification.save();
        res.status(201).json(newNotification);
    } catch (error) {
        console.error("Erreur création notification:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Récupérer les notifications d'un utilisateur spécifique
router.get("/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const notifications = await Notification.find({ consommateurId: userId, role: "client" });
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
});

// Récupérer toutes les notifications
router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        //console.log("Notifications récupérées :", notifications);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Marquer une notification comme lue
router.put('/:id/read', async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour" });
    }
});

// **Supprimer une notification**
router.delete('/:id', async (req, res) => {
    try {
        const result = await Notification.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: "Notification non trouvée" });
        }
        res.json({ success: true, message: "Notification supprimée" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression" });
    }
});


router.get("/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const notifications = await Notification.find({ consommateurId: userId, role: "client" });
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
});

router.get('/commercant/:commercantId', async (req, res) => {
  try {
    const { commercantId } = req.params;

    const notifications = await Notification.find({ 
      commercantId,
      role: "commercant"
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

  

export default router;
