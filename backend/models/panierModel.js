import mongoose from "mongoose";

const panierSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  produits: [
    {
      produitId: { type: mongoose.Schema.Types.ObjectId, ref: "produit", required: true },
      quantite: { type: Number, default: 1 },
      prix: { type: Number, required: true }, // Stocke le prix du produit
    }
  ],
  total: { type: Number, default: 0 } // Stocke le total du panier
});

const panierModel = mongoose.model("Panier", panierSchema);

export default panierModel;
