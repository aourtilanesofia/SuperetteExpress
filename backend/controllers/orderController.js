import { CommandeModel, Counter } from "../models/OrderModel.js";
import mongoose from "mongoose";

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

        console.log("Données reçues :", req.body);

        const numeroCommande = await getNextOrderNumber();

        console.log("Numéro de commande généré :", numeroCommande);

        const newOrder = new CommandeModel({
            numeroCommande,
            userId: new mongoose.Types.ObjectId(userId),
            produits,
            total
        });

        await newOrder.save();
        console.log("Commande enregistrée avec succès !");

        res.status(201).json({ message: "Commande enregistrée avec succès !", numeroCommande });
    } catch (error) {
        console.error("Erreur lors de l'enregistrement de la commande :", error);
        res.status(500).json({ message: "Erreur lors de l'enregistrement de la commande", error: error.message });
    }
};
  

// Récupérer toutes les commandes d'un client
export const getUserOrders = async (req, res) => {
    console.log("Requête reçue pour userId :", req.params.userId);
    try {
        const orders = await CommandeModel.find({ userId: req.params.userId }).sort({ date: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error("Erreur lors de la récupération des commandes :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des commandes", error: error.message });
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
    const order = await CommandeModel.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }
    if (order.statut !== "En attente") {
      return res.status(400).json({ message: "Commande déjà confirmée ou annulée" });
    }
    
    order.statut = "Annulée";
    await order.save();
    res.status(200).json({ message: "Commande annulée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'annulation de la commande" });
  }
};
