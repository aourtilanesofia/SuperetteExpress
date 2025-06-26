import mongoose from "mongoose";

const categorieSchema = new mongoose.Schema({
    nom: { type: String, 
    required: true, 
    //unique: true 
},
    image: { type: String,
    required: true 
}, 
superetteId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Superette', 
    required: true 
  }
}, { timestamps: true,
 });

const CategorieModel = mongoose.model("Categorie", categorieSchema);


export default CategorieModel;
