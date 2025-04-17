
import mongoose from "mongoose";
import JWT from "jsonwebtoken";

const livreurSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, "Le champ est obligatoire"],
    },
    numTel: {
      type: String,
      required: [true, "Le champ est obligatoire"],
    },
    categorie: {
      type: String,
      required: [true, "Le champ est obligatoire"],
    },
    matricule: {
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
    isValidated: { type: Boolean, default: false }

  },
  { timestamps: true }
);

// JWT token
livreurSchema.methods.generateToken = function () {
  return JWT.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};


// Méthode pour supprimer un consommateur
livreurSchema.methods.deleteAccount = async function () {
  try {
    // Vérifier que l'utilisateur existe
    if (!this._id) {
      throw new Error("Aucun utilisateur trouvé");
    }

    // Utilisation de deleteOne() pour supprimer le livreur
    await this.constructor.deleteOne({ _id: this._id }); // Utilisation de this.constructor pour accéder au modèle
    return { success: true, message: "Compte supprimé avec succès." };
  } catch (error) {
    console.error("Erreur lors de la suppression du compte:", error);
    throw new Error("Erreur lors de la suppression du compte");
  }
};



// Création du modèle après avoir tout défini
const livreurModel = mongoose.model("Livreurs", livreurSchema);

export default livreurModel;

