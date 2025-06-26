import mongoose from "mongoose";

const produitSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    prix: { type: Number, required: true }, 
    categorie: { type: String, required: true },
    categorieId: { type: mongoose.Schema.Types.ObjectId, ref: "categorie", required: true },
    stock: { type: Number, required: true },
    description: { type: String, required: true }, 
    image: {  type: String, required: true }, 
    codeBarre: { type: String, required: false, unique: true }
  },
  { timestamps: true }
);  

const produitModel = mongoose.model("produit", produitSchema);

export default produitModel;
