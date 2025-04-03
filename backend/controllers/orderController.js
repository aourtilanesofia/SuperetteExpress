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
    console.log("Commande enregistrée avec succès !");
   

    

    // Mise à jour du stock
    for (const item of produits || []) {
      if (!item.produitId) {
          console.log("Erreur: produitId est manquant pour l'un des produits :", item);
          continue; // Ignore cet élément et passe au suivant
      }
  
      console.log(`Mise à jour du stock pour produit ID: ${item.produitId}`);
  
      const produit = await produitModel.findById(item.produitId);
      if (!produit) {
          console.log(`Produit non trouvé pour l'ID: ${item.produitId}`);
          continue;
      }
  
      if (produit.stock >= item.quantite) {
          produit.stock -= item.quantite;
          await produit.save();
          console.log(`Nouveau stock pour ${produit.nom} : ${produit.stock}`);
      } else {
          console.log(`Stock insuffisant pour ${produit.nom}`);
          return res.status(400).json({ message: `Stock insuffisant pour ${produit.nom}` });
      }
  }
  
  

    console.log("Stock mis à jour après validation de la commande");

    const notification = new Notification({
      message: `${user.nom} vient de passer une commande.`,
      isRead: false,
      role: "administrateur"
    });

    await notification.save();
    //console.log("Notification enregistrée :", notification);

    if (req.app.get("io")) {
      const io = req.app.get("io");
      io.emit("newNotification", notification);
      console.log("Notification envoyée via WebSocket");
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
    const order = await CommandeModel.findByIdAndDelete(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    res.status(200).json({ message: "Commande supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression de la commande" });
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

    // Création de la notification
    const notificationMessage =
      statut === "Confirmée"
        ? `Votre commande numéro ${order.numeroCommande} a été confirmée.`
        : `Votre commande numéro ${order.numeroCommande} a été annulée.`;

    //console.log("User ID associé à la commande :", order.userId);

    const notification = new Notification({
      message: notificationMessage,
      isRead: false,
      role: "client", // Notification destinée au client
      consommateurId: new mongoose.Types.ObjectId(order.userId),
    });

    await notification.save();

    // Envoi de la notification via WebSocket
    if (req.app.get("io")) {
      const io = req.app.get("io");
      io.emit(`notification_${order.userId}`, notification); // Émettre uniquement au client concerné
      //console.log("Notification envoyée au client :", notificationMessage);
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
    const commandes = await CommandeModel.find().populate("userId", "nom");
    res.status(200).json(commandes);
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


