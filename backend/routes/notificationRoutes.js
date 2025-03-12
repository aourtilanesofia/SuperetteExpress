import express from 'express';
import Notification from '../models/NotificationModel.js';

const router = express.Router();

// Récupérer toutes les notifications
router.get('/', async (req, res) => {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    console.log("Notifications récupérées :", notifications);
    res.json(notifications);
});

// Marquer une notification comme lue
router.put('/:id/read', async (req, res) => {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
});





export default router;