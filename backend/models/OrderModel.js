import mongoose from "mongoose";

const commandeSchema = new mongoose.Schema({
  numeroCommande: { type: Number, unique: true, required: true }, 
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Consommateurs", required: true },
  superetteId: { type: mongoose.Schema.Types.ObjectId, ref: "Superette" },
  produits: [
    {
      nom: String,
      prix: Number,
      quantite: Number  
    }
  ],
  total: { type: Number, required: true },
  totalNet: { type: Number },
  methodePaiement: { 
  type: String,
  enum: ['Espèce', 'CIB', 'DAHABIYA', 'Non spécifié'],
  default: 'Non spécifié'
},
  statut: {
    type: String,
    enum: ['En attente', 'Assignée'], 
    default: 'En attente'
  },
  
  livreur: { type: mongoose.Schema.Types.ObjectId, ref: "Livreurs" }, 

  paiement: {
    type: String,
    enum: ['Payée', 'Non', 'En attente de paiement'],
    default: 'En attente de paiement' 
  },
  destination: { 
    adresse: { type: String },
    infoSup: { type: String } 
  },
  date: { type: Date, default: Date.now },
  livraison: {
    type: String,
    enum: ["En attente", "En cours", "Livré", "Non Livré", 'Acceptée', 'Refusée'],
    default: "En attente"
  },
  positionLivreur: {
    lat: { type: Number },
    lng: { type: Number }
  }
}, {
  timestamps: true
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
