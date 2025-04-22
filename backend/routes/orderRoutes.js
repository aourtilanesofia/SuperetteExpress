import express from "express";
import { addOrder, getUserOrders, getOrderByNumber, cancelOrder,
     updateOrderStatus, getAllOrders, getTodayOrdersCount, mettreAJourPaiement,updateOrder,
     getCommandesPayeesOuEnAttente, updateLivraisonCommande,ModifierCommande,getTodayOrdersLiv,
     updatePositionLivreur,getDerniereLocalisation,countCommandesLivrees,countCommandesNonLivrees,countCommandesEnAttente,countAllStatuts } from "../controllers/orderController.js";


const router = express.Router();

router.post("/add",addOrder);                // Ajouter une commande
router.get("/user/:userId", getUserOrders);   // Récupérer les commandes d'un client
router.get("/numero/:numeroCommande", getOrderByNumber); // Récupérer une commande par son numéro
router.delete("/cancel/:orderId", cancelOrder);  // Annuler une commande
// Récuperer les commandes d'aujourd'hui 
router.get("/count/today", getTodayOrdersCount);

///Mettre a jour une commande (statut) 
router.put("/:orderId", updateOrderStatus);
router.get("/", getAllOrders);  // Route pour récupérer toutes les commandes

//mettre à jour l'attribut payer 
router.put('/payer/:numeroCommande', mettreAJourPaiement);

router.put("/livraison/:numeroCommande", updateOrder);

router.get('/payeesouattente', getCommandesPayeesOuEnAttente);

router.put("/livstat/:orderId", updateLivraisonCommande);

router.put('/ModifierStat/:id', ModifierCommande);

router.get('/today/count', getTodayOrdersLiv);

router.put('/commande/:id/position', updatePositionLivreur);

router.get('/dernierelocalisation', getDerniereLocalisation);


router.get('/count/livre', countCommandesLivrees);
router.get('/count/non-livre', countCommandesNonLivrees);
router.get('/count/en-attente', countCommandesEnAttente);
router.get('/count/all', countAllStatuts);

export default router; 
    