/*import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
const consommateurSchema = new mongoose.Schema({
    nom:{
        type: String,
        required:[true,"Le champ est obligatoire"],
    },
    numTel:{
        type: Number,
        required:[true,"Le champ est obligatoire"],
    },
    adresse:{
        type: String,
        required:[true,"Le champ est obligatoire"],
    },
    email:{
        type: String,
        required:[true,"Le champ est obligatoire"],
        unique:[true,"L'adresse e-mail existe déja"],
    },
    mdp:{
        type: String,
        required:[true,"Le champ est obligatoire"],
        minLength:[6,"Le mot de passe doit contenir au moins 6 caractères"],
    },
},
{timestamps:true}
);

//Une fonction de hachage
consommateurModel.pre('save', async function () {
    this.mdp = await bcrypt.hash(this.mdp, 10); 
});

export const consommateurModel = mongoose.model("Consommateurs",consommateurSchema);
export default consommateurModel;*/
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import JWT from 'jsonwebtoken';

const consommateurSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, "Le champ est obligatoire"],
    },
    numTel: {
      type: Number,
      required: [true, "Le champ est obligatoire"],
    },
    adresse: {
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
  },
  { timestamps: true }
);

//  Hachage du mot de passe avant l'enregistrement
consommateurSchema.pre("save", async function (next) {
  if (!this.isModified("mdp")) return next();

  this.mdp = await bcrypt.hash(this.mdp, 10);
  next();
});

// une fonction de comparaison 
consommateurSchema.methods.comparePassword = async function (plainPassword) {
    return await bcrypt.compare(plainPassword, this.mdp);
    
};

//JWT token
consommateurSchema.methods.generateToken = function () {
    return JWT.sign({_id:this._id},process.env.JWT_SECRET,{expiresIn:"7d"});
    
};

// Création du modèle après avoir tout défini
const consommateurModel = mongoose.model("Consommateurs", consommateurSchema);

export default consommateurModel;
