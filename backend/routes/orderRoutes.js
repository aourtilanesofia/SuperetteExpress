import express from "express";
import { addOrder, getUserOrders, getOrderByNumber, cancelOrder, updateOrderStatus, getAllOrders } from "../controllers/orderController.js";


const router = express.Router();

router.post("/add",addOrder);                // Ajouter une commande
router.get("/user/:userId", getUserOrders);   // Récupérer les commandes d'un client
router.get("/numero/:numeroCommande", getOrderByNumber); // Récupérer une commande par son numéro
router.delete("/cancel/:orderId", cancelOrder);  // Annuler une commande
///Mettre a jour une commande (statut) 
router.put("/:orderId", updateOrderStatus);
router.get("/", getAllOrders);  // Route pour récupérer toutes les commandes

export default router; 
   