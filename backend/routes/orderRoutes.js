import express from "express";
import { addOrder, getUserOrders, getOrderByNumber, cancelOrder,
     updateOrderStatus, getAllOrders, getTodayOrdersCount, mettreAJourPaiement,updateOrder,
     getCommandesPayeesOuEnAttente, updateLivraisonCommande,ModifierCommande,getTodayOrdersLiv,
     updatePositionLivreur,getDerniereLocalisation,countCommandesLivrees,countCommandesNonLivrees,
     countCommandesEnAttente,countAllStatuts,assignerCommande,getCommandeByNumero, getStatutLivraison , getTotalNetByNumeroCommande, updatePayment } from "../controllers/orderController.js";
import { CommandeModel } from "../models/OrderModel.js";


const router = express.Router();

router.post("/add",addOrder);                // Ajouter une commande
router.get("/user/:userId", getUserOrders);   // Récupérer les commandes d'un client
router.get("/numero/:numeroCommande", getOrderByNumber); // Récupérer une commande par son numéro
router.delete("/cancel/:numeroCommande", cancelOrder);  // Annuler une commande
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

router.put('/update-payment/:numeroCommande', updatePayment);

router.get('/:numeroCommande',getCommandeByNumero);


//recupérer le total net pour chaque commande 
router.get("/totalNet/commande/:numeroCommande", getTotalNetByNumeroCommande);

router.get('/count/livre', countCommandesLivrees);
router.get('/count/non-livre', countCommandesNonLivrees); 
router.get('/count/en-attente', countCommandesEnAttente);
router.get('/count/all', countAllStatuts);
 
router.post('/assigner', assignerCommande);


// Récupérer le statut de livraison d'une commande
router.get('/:numeroCommande/livraison', getStatutLivraison);

router.put('/:numeroCommande/livraison', async (req, res) => {
     const { numeroCommande } = req.params;
     const { livraison } = req.body;
   
     try {
       const commande = await Commande.findOneAndUpdate(
         { numeroCommande },
         { livraison },
         { new: true }
       );
       res.status(200).json(commande);
     } catch (error) {
       res.status(500).json({ error: "Erreur de mise à jour de la commande." });
     }
   });
   

   router.get('/en-cours', async (req, res) => {
    const { livreurId } = req.query;
    try {
      const query = {
        livraison: 'En cours'
      };
      if (livreurId) {
        query.livreur = livreurId;
      }
  
      const commandes = await CommandeModel.find(query).populate('userId');
      res.json({ success: true, data: commandes });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  });
  

  // Dans votre backend (route GET)
router.get('/derniere/:userId', async (req, res) => {
  try {
    const commande = await CommandeModel.findOne({
      userId: req.params.userId,
      statut: { $in: [ 'En cours'] }
    })
    .sort({ date: -1 })
    .populate('livreurId');
    
    if (!commande) return res.status(404).json({ message: "Aucune commande trouvée" });
    
    res.json(commande);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



router.get('/', async (req, res) => {
    try {
        const commandes = await CommandeModel.find()
            .populate({
                path: 'userId',
                model: 'Consommateurs',
                select: 'nom numTel'
            })
            .populate({
                path: 'livreur',
                model: 'Livreurs',
                select: 'nom numTel'
            })
            .sort({ createdAt: -1 });

        console.log("Exemple de commande peuplée:", {
            _id: commandes[0]?._id,
            livreur: commandes[0]?.livreur // Vérifiez spécifiquement le livreur
        });

        res.json(commandes);
    } catch (err) {
        console.error("Erreur:", err);
        res.status(500).json({ message: err.message });
    }
});
export default router; 
     