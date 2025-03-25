import express from "express";
import { addOrder, getUserOrders, getOrderByNumber, cancelOrder } from "../controllers/orderController.js";


const router = express.Router();

router.post("/add",addOrder);                // Ajouter une commande
router.get("/user/:userId", getUserOrders);   // Récupérer les commandes d'un client
router.get("/numero/:numeroCommande", getOrderByNumber); // Récupérer une commande par son numéro
router.put("/cancel/:orderId", cancelOrder);  // Annuler une commande

export default router;
 