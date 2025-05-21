import { CommandeModel, Counter } from "../models/OrderModel.js";
import mongoose from "mongoose";
import Notification from '../models/NotificationModel.js';
import consommateurModel from '../models/consommateurModel.js';
import produitModel from "../models/produitModel.js";


// Fonction pour obtenir le prochain numéro de commande
const getNextOrderNumber = async () => {
  const counter = await Counter.findOneAndUpdate(
    { _id: "orderId" },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );

  if (!counter) {
    throw new Error("Impossible de générer le numéro de commande");
  }
  return counter.sequence_value;
};

// Ajouter une commande
export const addOrder = async (req, res) => {
  try {
    const { userId, produits, total } = req.body;

    if (!userId || !produits || !total) {
      return res.status(400).json({ message: "Données manquantes pour la commande" });
    }

    //console.log("Produits reçus :", JSON.stringify(produits, null, 2));

    const numeroCommande = await getNextOrderNumber();
    //console.log("Numéro de commande généré :", numeroCommande);

    const user = await consommateurModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const newOrder = new CommandeModel({
      numeroCommande,
      userId: new mongoose.Types.ObjectId(userId),
      produits,
      total
    });

    await newOrder.save();
    //console.log("Commande enregistrée avec succès !");




    // Mise à jour du stock
    for (const item of produits || []) {
      if (!item.produitId) {
        console.log("Erreur: produitId est manquant pour l'un des produits :", item);
        continue; // Ignore cet élément et passe au suivant
      }

      //console.log(`Mise à jour du stock pour produit ID: ${item.produitId}`);

      const produit = await produitModel.findById(item.produitId);
      if (!produit) {
        console.log(`Produit non trouvé pour l'ID: ${item.produitId}`);
        continue;
      }

      if (produit.stock >= item.quantite) {
        produit.stock -= item.quantite;
        await produit.save();
        //console.log(`Nouveau stock pour ${produit.nom} : ${produit.stock}`);
      } else {
        //console.log(`Stock insuffisant pour ${produit.nom}`);
        return res.status(400).json({ message: `Stock insuffisant pour ${produit.nom}` });
      }
    }

 

    //console.log("Stock mis à jour après validation de la commande");

    const notification = new Notification({
      message: `${user.nom} vient de passer une commande.`,
      isRead: false,
      role: "commercant"
    });

    await notification.save();
    //console.log("Notification enregistrée :", notification);

    if (req.app.get("io")) {
      const io = req.app.get("io");
      io.emit("newNotification", notification);
      //console.log("Notification envoyée via WebSocket");
    }

    res.status(201).json({ message: "Commande enregistrée avec succès !", numeroCommande });

  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la commande :", error.stack);
    res.status(500).json({ message: "Erreur lors de l'enregistrement de la commande", error: error.message });
  }
};





// Récupérer toutes les commandes d'un client
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.params.userId;
    //console.log("Requête pour userID :", userId);

    const commandes = await CommandeModel.find({ userId });
    //console.log("Commandes récupérées :", commandes);

    res.status(200).json(commandes);
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// Récupérer une commande par son numéro
export const getOrderByNumber = async (req, res) => {
  try {
    const order = await CommandeModel.findOne({ numeroCommande: req.params.numeroCommande });
    if (!order) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération de la commande" });
  }
};

// Annuler une commande
export const cancelOrder = async (req, res) => {
  try {
    // Recherchez ET supprimez par numeroCommande au lieu de _id
    const order = await CommandeModel.findOneAndDelete({ 
      numeroCommande: req.params.numeroCommande 
    });

    if (!order) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    res.status(200).json({ message: "Commande annulée avec succès" });
  } catch (error) {
    console.error("Erreur backend:", error);
    res.status(500).json({ 
      message: "Erreur lors de l'annulation",
      error: error.message 
    });
  }
};


export const updateOrderStatus = async (req, res) => {
  try {
    const { statut } = req.body;
    const order = await CommandeModel.findByIdAndUpdate(
      req.params.orderId,
      { statut },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    // Récupérer l'utilisateur concerné
    const user = await consommateurModel.findById(order.userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut :", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du statut" });
  }
};


//Récuperer toutes les commandes
export const getAllOrders = async (req, res) => {
  try {
    const commandes = await CommandeModel.find().populate("userId", "nom numTel");
    res.status(200).json(commandes);
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getTodayOrdersCount = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const count = await CommandeModel.countDocuments({
      $or: [
        { createdAt: { $gte: today, $lt: tomorrow } },
        { date: { $gte: today, $lt: tomorrow } }
      ]
    });

    res.status(200).json({ count });
  } catch (error) {
    console.error("Erreur lors du comptage des commandes du jour :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


export const mettreAJourPaiement = async (req, res) => {
  try {
    const { paiement, paymentMethod } = req.body;
    const { numeroCommande } = req.params;

    const order = await CommandeModel.findOne({ numeroCommande });

    if (!order) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    // Mise à jour du champ paiement en fonction de la méthode
    let updatedStatus = 'Non';

    if (paymentMethod === 'Espèce') {
      updatedStatus = 'En attente de paiement';
    } else if (paymentMethod === 'Carte') {
      updatedStatus = 'Payée';
    } else if (paiement) {
      updatedStatus = paiement; // Permet d’accepter un statut manuellement défini
    }

    order.paiement = updatedStatus;

    await order.save();

    // Notification au consommateur
    const user = await consommateurModel.findById(order.userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }


    res.status(200).json(order);
  } catch (error) {
    console.error("Erreur détaillée :", error.message, error.stack);
    res.status(500).json({ message: "Erreur lors de la mise à jour du statut" });
  }
};


export const updateOrder = async (req, res) => {
  try {
    const { numeroCommande } = req.params;
    const { adresse, infoSupplementaire } = req.body;

    const commande = await CommandeModel.findOne({ numeroCommande: Number(numeroCommande) });
    //console.log("Numéro reçu:", numeroCommande);

    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    if (!commande.destination) {
      commande.destination = {};
    }

    commande.destination.adresse = adresse;
    commande.destination.infoSup = infoSupplementaire;

    const updatedCommande = await commande.save();

    res.status(200).json({ message: 'Commande mise à jour', commande: updatedCommande });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la commande' });
  }
};


// Récupérer toutes les commandes payées ou en attente de paiement

export const getCommandesPayeesOuEnAttente = async (req, res) => {
  try {
    console.log("Recherche des commandes avec critères:"
      , {
      paiement: { $in: ['Payée', 'En attente de paiement'] }
    });

    // Option 1: Vérifiez d'abord sans filtre
    const toutesCommandes = await CommandeModel.find({}).limit(5);
    //console.log("5 premières commandes (sans filtre):", toutesCommandes);

    // Option 2: Vérifiez les statuts existants
    const statutsExistants = await CommandeModel.distinct('statutPaiement');
    //console.log("Statuts de paiement existants:", statutsExistants);

    // Requête finale
    const commandes = await CommandeModel.find({
      paiement: { $in: ['Payée', 'En attente de paiement'] }
    })
      .populate("userId", "nom numTel")
      .lean();

    //console.log(`Nombre de commandes trouvées: ${commandes.length}`);
    //console.log("Exemple de commande:", commandes[0]);

    res.status(200).json({
      success: true,
      count: commandes.length,
      data: commandes
    });

  } catch (err) {
    console.error("Erreur complète:", err);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: err.message
    });
  }
};

export const updateLivraisonCommande = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Vérification explicite de l'ID
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "ID de commande invalide" });
    }

    // Mise à jour plus robuste
    const updatedOrder = await CommandeModel.findByIdAndUpdate(
      orderId,
      { $set: { livraison: "En cours" } },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Commande non trouvée"
      });
    }

    // Créer une notification pour le client
    const notificationMessage = `Votre commande numéro #${updatedOrder.numeroCommande} est en cours de livraison`;

    const notification = new Notification({
      message: notificationMessage,
      isRead: false,
      role: "client",
      consommateurId: new mongoose.Types.ObjectId(updatedOrder.userId),
    });

    await notification.save();

    // Envoi de la notification via WebSocket
    if (req.app.get("io")) {
      const io = req.app.get("io");
      io.emit(`notification_${updatedOrder.userId}`, notification);
    }


    return res.status(200).json({
      success: true,
      data: updatedOrder,
      message: "Statut de livraison mis à jour"
    });



  } catch (error) {
    console.error("Erreur détaillée:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message
    });
  }
};


export const ModifierCommande = async (req, res) => {
  try {
    const commande = await CommandeModel.findById(req.params.id);

    if (!commande) {
      console.log('Commande non trouvée');
      return res.status(404).json({ success: false, message: "Commande introuvable" });
    }

    if (req.body.livraison) {
      //console.log('Ancien statut livraison:', commande.livraison);
      commande.livraison = req.body.livraison;
      //console.log('Nouveau statut livraison:', commande.livraison);
    }

    if (req.body.paiement) {
      //console.log('Ancien statut paiement:', commande.paiement);
      commande.paiement = req.body.paiement;
      //console.log('Nouveau statut paiement:', commande.paiement);
    }

    const savedCommande = await commande.save();

    // Notification après la sauvegarde
    const notificationMessage =
  savedCommande.livraison === 'Livré'
    ? `La commande numéro #${savedCommande.numeroCommande} est livrée.`
    : savedCommande.livraison === 'Non Livré'
      ? `Votre commande numéro #${savedCommande.numeroCommande} a été annulée.`
      : `La commande numéro #${savedCommande.numeroCommande} n'est pas livrée.`;
    const notification = new Notification({
      message: notificationMessage,
      isRead: false,
      role: "commercant",
      consommateurId: new mongoose.Types.ObjectId(savedCommande.userId),
    });

    await notification.save();

    if (req.app.get("io")) {
      const io = req.app.get("io");
      io.emit(`notification_${savedCommande.userId}`, notification);
    }

    res.status(200).json({
      success: true,
      message: "Commande mise à jour avec succès",
      data: savedCommande
    });

  } catch (error) {
    console.error('Erreur complète:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack
    });
  }
};



export const getTodayStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const matchStage = {
      $match: {
        $and: [
          {
            $or: [
              { createdAt: { $gte: today, $lt: tomorrow } },
              { date: { $gte: today, $lt: tomorrow } }
            ]
          },
          { livraison: { $in: ["Payée", "En attente de paiement"] } }
        ]
      }
    };

    const result = await CommandeModel.aggregate([
      matchStage,
      {
        $facet: {
          total: [{ $count: "count" }],
          livrees: [{ $match: { statutLivraison: "Livré" } }, { $count: "count" }],
          enAttente: [{ $match: { statutLivraison: "En attente" } }, { $count: "count" }],
          nonLivrees: [{ $match: { statutLivraison: "Non livré" } }, { $count: "count" }]
        }
      }
    ]);

    const stats = {
      aujourdhui: result[0].total[0]?.count || 0,
      livrees: result[0].livrees[0]?.count || 0,
      enAttente: result[0].enAttente[0]?.count || 0,
      nonLivrees: result[0].nonLivrees[0]?.count || 0
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Erreur lors de la récupération des stats:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const getTodayOrdersLiv = async (req, res) => {
  try {
    // Utilisation d'UTC pour éviter les problèmes de fuseau horaire
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(startOfDay.getUTCDate() + 1);



    // Debug : afficher quelques documents pour vérification
    const sampleDocs = await CommandeModel.find({
      $or: [
        { createdAt: { $gte: startOfDay, $lt: endOfDay } },
        { date: { $gte: startOfDay, $lt: endOfDay } }
      ]
    }).limit(5);



    const count = await CommandeModel.countDocuments({
      $and: [
        {
          $or: [
            { createdAt: { $gte: startOfDay, $lt: endOfDay } },
            { date: { $gte: startOfDay, $lt: endOfDay } }
          ]
        },
        {
          livraison: { $in:"Livré" }
        }
      ]
    });



    res.status(200).json({ count });
  } catch (error) {
    console.error("Erreur lors du comptage des commandes du jour :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


export const updatePositionLivreur = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Coordonnées manquantes' });
    }

    const updatedCommande = await CommandeModel.findByIdAndUpdate(
      id,
      { positionLivreur: { lat, lng } },
      { new: true }
    );

    if (!updatedCommande) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    }

    res.status(200).json({ success: true, data: updatedCommande });
  } catch (error) {
    console.error("Erreur mise à jour position livreur:", error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};


export const getDerniereLocalisation = async (req, res) => {
  try {

    const derniereCommande = await CommandeModel.findOne({
      positionLivreur: { $exists: true }
    })
      .sort({ updatedAt: -1 })
      .select('positionLivreur')

    if (!derniereCommande) {
      console.log("Aucune commande trouvée avec une position.");
      return res.status(404).json({ success: false, message: 'Aucune position de livreur trouvée' })
    }


    const { lat, lng } = derniereCommande.positionLivreur || {}

    if (!lat || !lng) {
      console.log("Position invalide ou non disponible");
      return res.status(404).json({ success: false, message: 'Position de livreur invalide ou non disponible' })
    }

    res.status(200).json({
      success: true,
      data: { lat, lng }
    })
  } catch (error) {
    console.error("Erreur serveur:", error.message);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message })
  }
}

export const countCommandesLivrees = async (req, res) => {
  try {
    const count = await CommandeModel.countDocuments({
      livraison: "Livré",
     
    });

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message
    });
  }
};


export const countCommandesNonLivrees = async (req, res) => {
  try {
    const count = await CommandeModel.countDocuments({
      $or: [
        { livraison: "Non livré" },
        { livraison: { $exists: false } } // Cas où le champ n'existe pas
      ]
    });

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur"
    });
  }
};

export const countCommandesEnAttente = async (req, res) => {
  try {
    const count = await CommandeModel.countDocuments({
      livraison: "En attente",
     
      statut: { $ne: "Annulé" }
    });

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du comptage",
      error: error.message
    });
  }
};



export const countAllStatuts = async (req, res) => {
  try {
    // Date du jour (minuit à aujourd'hui)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const results = await CommandeModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: todayStart,
            $lte: todayEnd
          }
        }
      },
      {
        $group: {
          _id: "$livraison",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          statut: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    // Formatage pour inclure les statuts manquants (count = 0)
    const statuts = ["Livré", "Non livré", "En attente"];
    const formattedResults = statuts.map(statut => {
      const found = results.find(r => r.statut === statut);
      return found || { statut, count: 0 };
    });

    res.status(200).json({
      success: true,
      data: formattedResults
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
};


//Assigner une commande à un livreur

// POST /api/v1/commandes/:id/assigner
export const assignerCommande = async (req, res) => {
  try {
    const { numeroCommande } = req.body; // Récupération depuis le body
    const { livreurId } = req.body;

    if (!numeroCommande || !livreurId) {
      return res.status(400).json({ message: 'numeroCommande et livreurId sont requis' });
    }

    const commande = await CommandeModel.findOne({ numeroCommande });

    //console.log('Numéro de commande reçu:', numeroCommande);
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    commande.livreur = livreurId;
    commande.statut = 'Assignée';
    await commande.save();

    res.status(200).json(commande);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};


export const getStatutLivraison = async (req, res) => {
  try {
    const commande = await CommandeModel.findOne({ 
      numeroCommande: req.params.numeroCommande 
    }).select('livraison');

    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    res.json({
      livraison: commande.livraison
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


