import mongoose from "mongoose";
import JWT from "jsonwebtoken";

const commercantSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, "Le champ est obligatoire"],
    },
    numTel: {
        type: String,
        required: [true, "Le champ est obligatoire"],
      },
    
    adresseBoutique: {
      type: String,
      required: [true, "Le champ est obligatoire"],
    },
    
    email: {
      type: String,
      required: [true, "Le champ est obligatoire"],
      unique: [true, "L'adresse e-mail existe déjà"],
    },
    mdp: {
      type: String,
      required: [true, "Le champ est obligatoire"],
      minLength: [6, "Le mot de passe doit contenir au moins 6 caractères"],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true,
    collection: "Commercant", 
   }
);

// JWT token
commercantSchema.methods.generateToken = function () {
  return JWT.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Méthode pour supprimer un commerçant
commercantSchema.methods.deleteAccount = async function () {
  try {
    if (!this._id) {
      throw new Error("Aucun utilisateur trouvé");
    }
    await this.constructor.deleteOne({ _id: this._id });
    return { success: true, message: "Compte supprimé avec succès." };
  } catch (error) {
    console.error("Erreur lors de la suppression du compte:", error);
    throw new Error("Erreur lors de la suppression du compte");
  }
};

const commercantModel = mongoose.model("Commercant", commercantSchema);

export default commercantModel;
