import commercantModel from "../models/commercantModel.js";
import SuperetteModel from "../models/SuperetteModel.js";
import Notification from '../models/NotificationModel.js';
import mongoose from 'mongoose';


// INSCRIPTION
export const inscriptionCommercantController = async (req, res) => {
    try {
        const { nom, numTel, adresseBoutique, mdp, superetteId } = req.body;

        // Validation des champs obligatoires
        if (!nom || !numTel || !adresseBoutique || !mdp || !superetteId) {
            return res.status(400).send({
                success: false,
                message: "Veuillez remplir tous les champs, y compris la sélection de la supérette !",
            });
        }

        // Validation du mot de passe
        if (mdp.length <= 6) {
            return res.status(400).send({
                success: false,
                message: "Le mot de passe doit contenir plus de 6 caractères"
            });
        }

        // Validation du numéro de téléphone
        const numTelRegex = /^(06|07|05)[0-9]{8}$/;
        if (!numTelRegex.test(numTel)) {
            return res.status(400).send({
                success: false,
                message: "Le numéro de téléphone doit commencer par 06, 07 ou 05 et contenir exactement 10 chiffres"
            });
        }

        // Vérifier si la supérette existe et n'est pas déjà associée
        const superette = await SuperetteModel.findById(superetteId);
        if (!superette) {
            return res.status(404).send({
                success: false,
                message: "La supérette sélectionnée n'existe pas"
            });
        }

        if (superette.commercant) {
            return res.status(400).send({
                success: false,
                message: "Cette supérette est déjà associée à un autre commerçant"
            });
        }

        // Création du commerçant avec référence à la supérette
        const commercant = await commercantModel.create({
            nom,
            numTel,
            adresseBoutique,
            mdp,
            superette: superetteId
        });

        // Mise à jour de la supérette avec référence au commerçant
        superette.commercant = commercant._id;
        await superette.save();

        // Création de la notification
        try {
            const notification = new Notification({
                message: `${nom} vient de s'inscrire en tant que commerçant et a été associé à la supérette ${superette.name}.`,
                isRead: false,
                role: "administrateur",
            });
            await notification.save();
            req.io.emit("newNotification", notification);
        } catch (notifError) {
            console.error("Erreur lors de la création de la notification :", notifError);
        }

        res.status(201).send({
            success: true,
            message: "Inscription réussie et association avec la supérette effectuée",
            commercant,
            superette
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Erreur dans l'API d'inscription",
            error,
        });
    }
};

// CONNEXION
export const connexionCommercantController = async (req, res) => {
  try {
    const { numTel, mdp } = req.body;

    const commercant = await commercantModel.findOne({ numTel });
    const now = new Date();

    if (!commercant) {
      return res.status(400).json({
        success: false,
        message: "Identifiants incorrects",
      });
    }

    // Vérifier si le compte est bloqué
    if (commercant.blockUntil && commercant.blockUntil > now) {
      const reste = Math.ceil((commercant.blockUntil - now) / 60000);
      return res.status(403).json({
        success: false,
        message: `Compte bloqué. Réessayez dans ${reste} minute(s).`,
      });
    }

    // Mot de passe incorrect
    if (mdp !== commercant.mdp) {
      commercant.loginAttempts += 1;

      if (commercant.loginAttempts >= 3) {
        commercant.blockUntil = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
        commercant.loginAttempts = 0;
        await commercant.save();
        return res.status(403).json({
          success: false,
          message: "3 tentatives échouées. Compte bloqué 5 minutes.",
        });
      }

      await commercant.save();
      return res.status(400).json({
        success: false,
        message: `Mot de passe incorrect. Tentative ${commercant.loginAttempts}/3`,
      });
    }

    // Succès : Réinitialiser les tentatives
    commercant.loginAttempts = 0;
    commercant.blockUntil = null;
    await commercant.save();

    const token = commercant.generateToken();

    return res.status(200).json({
      success: true,
      message: "Connexion réussie",
      token,
      commercant,
    });

  } catch (err) {
    console.error("Erreur serveur :", err);
    return res.status(500).json({
      success: false,
      message: "Erreur technique",
    });
  }
};







// PROFIL COMMERÇANT
export const getCommercantProfileController = async (req, res) => {
    try {
        const commercant = await commercantModel.findById(req.user._id).populate({
            path: 'superette',
            select: 'name address',  // Sélectionne uniquement le nom et l'adresse
        });
        //console.log(commercant.superette);
        console.log("Supérette peuplée :", commercant.superette);
        res.status(200).send({
            success: true,
            message: "Profil commerçant récupéré avec succès",
            commercant,
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Erreur dans l'API du profil",
            error,
        });
    }
};

// MODIFIER LE PROFIL
export const updateCommercantProfileController = async (req, res) => {
    try {
        const { nom, email, numTel, adresseBoutique, mdp } = req.body;

        const commercant = await commercantModel.findById(new mongoose.Types.ObjectId(req.user._id));

        if (!commercant) {
            return res.status(404).json({ success: false, message: "Commerçant non trouvé" });
        }

        commercant.nom = nom || commercant.nom;
        commercant.email = email || commercant.email;
        commercant.numTel = numTel || commercant.numTel;
        commercant.adresseBoutique = adresseBoutique || commercant.adresseBoutique;
        commercant.mdp = mdp || commercant.mdp;

        await commercant.save();

        res.status(200).json({ success: true, message: "Profil mis à jour", commercant });

    } catch (error) {
        console.error("Erreur mise à jour profil :", error);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};

// SUPPRIMER LE COMPTE
export const deleteCommercantAccountController = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await commercantModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur non trouvé"
            });
        }

        await commercantModel.findByIdAndDelete(userId);
        res.status(200).json({
            success: true,
            message: "Compte commerçant supprimé avec succès"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la suppression du compte",
            error: error.message
        });
    }
};


// Récupérer tous les commerçants
export const getAllCommercants = async (req, res) => {
    try {
        const commercants = await commercantModel.find();
        res.json(commercants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// SUPPRIMER UN COMMERÇANT
export const deleteCommercant = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "ID manquant" });
        }

        const commercant = await commercantModel.findByIdAndDelete(id);
        if (!commercant) {
            return res.status(404).json({ message: "Commerçant introuvable !" });
        }

        res.json({ message: "Commerçant supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Activer ou désactiver un consommateur

export const toggleStatus = async (req, res) => {
    try {
        const commercant = await commercantModel.findById(req.params.id);

        if (!commercant) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        commercant.isActive = !commercant.isActive;
        await commercant.save();

        res.json(commercant);
    } catch (error) {
        console.error("Erreur lors de l'activation/désactivation :", error);
        res.status(500).json({ message: error.message });
    }
};

// Récupérer un consommateur par son ID
export const getCommercantByIdController = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({ message: "ID manquant dans la requête" });
        }

        const commercant = await commercantModel.findById(req.params.id);
        if (!commercant) {
            return res.status(404).json({ message: "Commercant non trouvé" });
        }

        res.json({
            nom: commercant.nom,
            telephone: commercant.numTel
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
};

// RÉCUPÉRER LE NOMBRE DE COMMERCANTS
export const getCommercantCountController = async (req, res) => {
    try {
        const count = await commercantModel.countDocuments();
        res.status(200).json({
            success: true,
            count,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération du nombre de commerçants :", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur",
            error,
        });
    }
};




