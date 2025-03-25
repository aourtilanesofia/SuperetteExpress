import mongoose from "mongoose";

const categorieSchema = new mongoose.Schema({
    nom: { type: String, 
    required: true, 
    unique: true 
},
    image: { type: String,
    required: true 
}, // URL de l'image de la catégorie
}, { timestamps: true });

const CategorieModel = mongoose.model("Categorie", categorieSchema);


export default CategorieModel;
