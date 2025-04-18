import mongoose from "mongoose";

const commandeSchema = new mongoose.Schema({
  numeroCommande: { type: Number, unique: true, required: true }, 
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Consommateurs", required: true },
  produits: [
    {
      nom: String,
      prix: Number,
      quantite: Number
    }
  ],
  total: { type: Number, required: true },
  statut: { type: String, default: "En attente" }, 
  date: { type: Date, default: Date.now }
}, {
  timestamps: true // Ajout correct ici
});

// Schéma pour gérer l'incrémentation du numéro de commande
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 }
});

const CommandeModel = mongoose.model("Commande", commandeSchema);
const Counter = mongoose.model("Counter", counterSchema);

// Exportation correcte
export { CommandeModel, Counter };
