import mongoose from "mongoose";

const produitSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    prix: { type: Number, required: true },
    categorie: { type: String, required: true },
    stock: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: String }, // Stockera le chemin de l'image
  },
  { timestamps: true }
);

const produitModel = mongoose.model("produit", produitSchema);

export default produitModel;
