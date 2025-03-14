import express from 'express';
import Notification from '../models/NotificationModel.js';

const router = express.Router();

// Récupérer toutes les notifications
router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        console.log("Notifications récupérées :", notifications);
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

export default router;
